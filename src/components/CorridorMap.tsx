'use client';

import React, { useEffect, useRef } from 'react';
import { SegmentEvaluation } from '@/lib/engine/types';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';

interface CorridorMapProps {
  segmentScores?: SegmentEvaluation[];
  controllingSegmentId?: string;
  corridorName?: string;
  safeLocations?: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number; name: string };
    type: string;
  }>;
}

const WAYANAD_COORDINATES: Record<string, [number, number]> = {
  S1: [11.4880, 76.1220], // Adivaram
  S5: [11.5000, 75.9980], // Lakkidi
  S3: [11.5760, 76.0980], // Vythiri
  S2: [11.5480, 76.2790], // Meppadi
  S6: [11.6090, 76.0830], // Kalpetta
  S4: [11.6280, 76.4310], // Muthanga
};

const MUNNAR_COORDINATES: Record<string, [number, number]> = {
  S1: [10.0889, 77.0595], // Munnar -> Gap Road
  S2: [10.2195, 77.1602], // Gap Road -> Chinnar Approach
  S3: [10.2750, 77.1370], // Chinnar Approach -> Marayoor
  S4: [10.3240, 76.9550], // Marayoor -> Valparai East
  S5: [10.1460, 77.0630], // Munnar -> Anamudi Corridor
  S6: [10.3265, 76.9515], // Anamudi Corridor -> Valparai
  N_MUNNAR: [10.0889, 77.0595],
  N_GAP_ROAD: [10.0520, 77.1420],
  N_ANAMUDI_PASS: [10.2010, 77.0120],
  N_MATTUPETTY: [10.1050, 77.1250],
  N_SHOLAYAR: [10.2850, 76.9420],
  N_VALPARAI: [10.3264, 76.9554],
};

export default function CorridorMap({
  segmentScores = [],
  controllingSegmentId,
  corridorName = 'NH-766 Wayanad Mountain Pass',
  safeLocations = [],
}: CorridorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (!isMounted || !mapContainerRef.current) return;

      const isMunnar = corridorName.includes('Munnar') || (controllingSegmentId && controllingSegmentId.startsWith('N_'));
      const centerCoords: [number, number] = isMunnar ? [10.15, 77.08] : [11.56, 76.18];
      const initialZoom = isMunnar ? 10 : 11;

      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: initialZoom,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // OSM Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const markersGroup = L.featureGroup();
      const coordsMap = isMunnar ? MUNNAR_COORDINATES : WAYANAD_COORDINATES;

      const allSegmentIds = Object.keys(coordsMap);
      const scoreMap = new Map<string, SegmentEvaluation>();
      for (const s of segmentScores) {
        scoreMap.set(s.segment_id, s);
      }

      let controllingMarker: any = null;

      // Render Checkpoints
      allSegmentIds.forEach(segId => {
        const coords = coordsMap[segId];
        if (!coords) return;

        const evaluated = scoreMap.get(segId);
        const name = evaluated?.name || (isMunnar ? `Sector ${segId}` : `Checkpoint ${segId}`);
        const hazardType = evaluated?.hazard_type || 'slope risk';
        const riskScore = evaluated?.risk_score !== undefined ? evaluated.risk_score : 0.2;
        const confidence = evaluated?.confidence !== undefined ? evaluated.confidence : 0.8;
        const action = evaluated?.action_candidate || 'Continue';

        let pinColor = '#10b981'; // Green (Low)
        if (riskScore >= 0.7) {
          pinColor = '#e11d48'; // Red (High)
        } else if (riskScore >= 0.3) {
          pinColor = '#f59e0b'; // Amber (Moderate)
        }

        const isControlling = segId === controllingSegmentId;

        const customIcon = L.divIcon({
          className: 'custom-corridor-pin',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: ${pinColor};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: 800;
              position: relative;
              ${isControlling ? 'outline: 3px solid #0f172a;' : ''}
            ">
              ${segId.replace(/^(S|N_)/, '')}
              ${isControlling ? '<div style="position:absolute; top:-6px; right:-6px; width:10px; height:10px; background:#e11d48; border-radius:50%; border:2px solid white;"></div>' : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        });

        const marker = L.marker(coords, { icon: customIcon }).addTo(markersGroup);

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 180px; padding: 2px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
              ${name}
            </div>
            <div style="font-size: 11px; color: #475569; text-transform: uppercase; margin-bottom: 6px; font-weight: 600;">
              Sector: ${segId} | Hazard: ${hazardType}
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; padding-top: 4px; border-top: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Risk Score:</span>
              <strong style="color: ${pinColor};">${(riskScore * 100).toFixed(0)}%</strong>
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

      // Render Designated Safe Staging Locations
      safeLocations.forEach(safe => {
        const safeIcon = L.divIcon({
          className: 'safe-zone-pin',
          html: `
            <div style="
              width: 28px;
              height: 28px;
              background-color: #059669;
              border: 2px solid white;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            ">
              🛡️
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -16],
        });

        const sMarker = L.marker([safe.location.lat, safe.location.lng], { icon: safeIcon }).addTo(markersGroup);
        sMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
            <div style="font-weight: 800; color: #065f46; font-size: 13px;">🛡️ Designated Safe Zone</div>
            <div style="font-weight: 600; color: #0f172a; margin-top: 2px;">${safe.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Status: Available Shelter & Staging</div>
          </div>
        `);
      });

      markersGroup.addTo(map);

      if (markersGroup.getLayers().length > 0) {
        map.fitBounds(markersGroup.getBounds(), { padding: [35, 35], animate: false });
      }

      if (controllingMarker) {
        controllingMarker.openPopup();
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.closePopup();
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [segmentScores, controllingSegmentId, corridorName, safeLocations]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{corridorName}</h3>
            <p className="text-[11px] text-slate-500">Multi-Hazard Monitoring &amp; Alternate Route Geometry</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
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
            <span>Low Risk</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-xs">🛡️</span>
            <span>Safe Shelter</span>
          </span>
        </div>
      </div>

      {/* Map Element */}
      <div 
        ref={mapContainerRef}
        id="corridor-leaflet-map"
        className="w-full h-84 sm:h-96 rounded-xl overflow-hidden border border-slate-200 shadow-inner z-10"
      />
    </div>
  );
}
