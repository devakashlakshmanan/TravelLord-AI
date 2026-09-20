'use client';

import React, { useEffect, useRef } from 'react';
import { SegmentEvaluation } from '@/lib/engine/types';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';

interface CorridorMapProps {
  segmentScores: SegmentEvaluation[];
  controllingSegmentId?: string;
}

// Fallback coordinates for all 6 NH-766 segments if lat/lng are omitted
const SEGMENT_COORDINATES: Record<string, [number, number]> = {
  S1: [11.4880, 76.1220], // Adivaram to Chooralmala
  S5: [11.5000, 75.9980], // Lakkidi Viewpoint Curve
  S3: [11.5760, 76.0980], // Vythiri Ghat Section
  S2: [11.5480, 76.2790], // Meppadi Junction
  S6: [11.6090, 76.0830], // Kalpetta Bypass
  S4: [11.6280, 76.4310], // Muthanga Wildlife Corridor
};

export default function CorridorMap({
  segmentScores,
  controllingSegmentId,
}: CorridorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      // If component unmounted while loading Leaflet, return
      if (!isMounted || !mapContainerRef.current) return;

      // Center around Wayanad Ghats (Vythiri / Kalpetta center)
      const map = L.map(mapContainerRef.current, {
        center: [11.56, 76.18],
        zoom: 11,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap Tiles (No API Key Required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markersGroup = L.featureGroup();

      // Ensure all 6 corridor segments are represented
      const allSegmentIds = ['S1', 'S5', 'S3', 'S2', 'S6', 'S4'];
      const scoreMap = new Map<string, SegmentEvaluation>();
      for (const s of segmentScores) {
        scoreMap.set(s.segment_id, s);
      }

      // Default attributes for corridor segments if not in current route slice
      const fallbackDetails: Record<string, Partial<SegmentEvaluation>> = {
        S1: { name: 'Adivaram to Chooralmala', hazard_type: 'landslide', risk_score: 0.92, confidence: 0.80, action_candidate: 'Turn Back / Divert' },
        S5: { name: 'Lakkidi Viewpoint Curve', hazard_type: 'landslide', risk_score: 0.26, confidence: 0.74, action_candidate: 'ELEVATED_CAUTION' },
        S3: { name: 'Vythiri Ghat Section', hazard_type: 'landslide', risk_score: 0.51, confidence: 0.72, action_candidate: 'ELEVATED_CAUTION' },
        S2: { name: 'Meppadi Junction', hazard_type: 'flood', risk_score: 0.44, confidence: 0.73, action_candidate: 'ELEVATED_CAUTION' },
        S6: { name: 'Kalpetta Bypass', hazard_type: 'road_closure', risk_score: 0.15, confidence: 0.90, action_candidate: 'Continue' },
        S4: { name: 'Muthanga Wildlife Corridor', hazard_type: 'wildlife', risk_score: 0.28, confidence: 0.68, action_candidate: 'Continue' },
      };

      let controllingMarker: any = null;

      allSegmentIds.forEach(segId => {
        const coords = SEGMENT_COORDINATES[segId];
        if (!coords) return;

        const evaluated = scoreMap.get(segId);
        const fallback = fallbackDetails[segId] || {};

        const name = evaluated?.name || fallback.name || `Segment ${segId}`;
        const hazardType = evaluated?.hazard_type || fallback.hazard_type || 'hazard';
        const riskScore = evaluated?.risk_score !== undefined ? evaluated.risk_score : (fallback.risk_score || 0.2);
        const confidence = evaluated?.confidence !== undefined ? evaluated.confidence : (fallback.confidence || 0.7);
        const action = evaluated?.action_candidate || fallback.action_candidate || 'Continue';

        // Color coding based on risk_score (same color system as Task 7)
        let pinColor = '#10b981'; // Green for low risk (< 0.3)

        if (riskScore >= 0.7) {
          pinColor = '#e11d48'; // Red for severe risk (>= 0.7)
        } else if (riskScore >= 0.3) {
          pinColor = '#f59e0b'; // Amber for moderate risk (>= 0.3)
        }

        const isControlling = segId === controllingSegmentId;

        // Custom Leaflet DivIcon with pin style
        const customIcon = L.divIcon({
          className: 'custom-corridor-pin',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: ${pinColor};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 11px;
              font-weight: 800;
              position: relative;
              ${isControlling ? 'outline: 3px solid #0f172a;' : ''}
            ">
              ${segId}
              ${isControlling ? '<div style="position:absolute; top:-6px; right:-6px; width:10px; height:10px; background:#e11d48; border-radius:50%; border:2px solid white;"></div>' : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker(coords, { icon: customIcon }).addTo(markersGroup);

        // Popup content matching Task 9 requirements
        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 180px; padding: 2px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
              ${name} <span style="font-size: 10px; color: #64748b;">(${segId})</span>
            </div>
            <div style="font-size: 11px; color: #475569; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">
              Hazard: ${hazardType}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; padding-top: 4px; border-top: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Risk Score:</span>
              <strong style="color: ${pinColor};">${(riskScore * 100).toFixed(0)}% (${riskScore})</strong>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748b;">Confidence:</span>
              <strong style="color: #0f172a;">${(confidence * 100).toFixed(0)}%</strong>
            </div>
            <div style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; background: ${riskScore >= 0.7 ? '#ffe4e6' : riskScore >= 0.3 ? '#fef3c7' : '#dcfce7'}; color: ${riskScore >= 0.7 ? '#9f1239' : riskScore >= 0.3 ? '#92400e' : '#166534'};">
              Action: ${action}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (isControlling) {
          controllingMarker = marker;
        }
      });

      markersGroup.addTo(map);

      // Fit map view to cover all corridor markers (animate: false to prevent pending animation race condition on unmount)
      map.fitBounds(markersGroup.getBounds(), { padding: [30, 30], animate: false });

      // Automatically open the popup for the controlling segment pin (or S1) as required by Task 9
      if (controllingMarker) {
        controllingMarker.openPopup();
      } else {
        const firstMarker = markersGroup.getLayers()[0] as any;
        if (firstMarker && firstMarker.openPopup) {
          firstMarker.openPopup();
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop(); // Immediately stops ongoing pan/zoom animations
          mapInstanceRef.current.closePopup();
          mapInstanceRef.current.remove();
        } catch (e) {
          // Guard against unmount race conditions
        }
        mapInstanceRef.current = null;
      }
    };
  }, [segmentScores, controllingSegmentId]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">NH-766 Wayanad Corridor Map</h3>
            <p className="text-[11px] text-slate-500">6 Risk-Monitored Ghat Checkpoints</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>High Risk (&ge;0.7)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Moderate (&ge;0.3)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Low</span>
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef}
        id="corridor-leaflet-map"
        className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-10"
      />
    </div>
  );
}
