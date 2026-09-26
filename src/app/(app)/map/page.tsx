'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase';
import { HazardSegment, SegmentEvaluation } from '@/lib/engine/types';
import { Loader2, AlertTriangle, Layers, Compass, Activity, MapPin, Radio, Sliders } from 'lucide-react';
import Link from 'next/link';
import { evaluateSegment } from '@/lib/engine/hazardStateAdapter';
import { useReplay, CurrentIntelligenceBanner } from '@/lib/replay/replayState';
import ProvenanceBadge from '@/components/ProvenanceBadge';

const CorridorMap = dynamic(() => import('@/components/CorridorMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
      <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-600" />
      <span>Loading interactive mountain corridor map...</span>
    </div>
  ),
});

export default function MapPage() {
  const supabase = createClient();
  const { currentSnapshot } = useReplay();
  const [corridorMode, setCorridorMode] = useState<'MUNNAR_REPLAY' | 'WAYANAD_LIVE'>('MUNNAR_REPLAY');
  const [wayanadSegments, setWayanadSegments] = useState<SegmentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCorridorData() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('hazard_segments')
          .select('*')
          .order('segment_id', { ascending: true });

        if (fetchErr) throw fetchErr;

        if (data) {
          const evaluations: SegmentEvaluation[] = data.map((s: HazardSegment) => 
            evaluateSegment(s, [])
          );
          setWayanadSegments(evaluations);
        }
      } catch (err: any) {
        console.error('Error fetching corridor map data:', err);
        setError('Unable to load corridor map data from database.');
      } finally {
        setLoading(false);
      }
    }

    loadCorridorData();
  }, [supabase]);

  // Transform current replay snapshot segments into SegmentEvaluation[]
  const replaySegmentEvaluations: SegmentEvaluation[] = useMemo(() => {
    return currentSnapshot.segmentList.map(s => {
      let actionCand = 'Continue';
      if (s.road_state === 'BLOCKED') actionCand = 'Turn Back / Divert';
      else if (s.overallRisk >= 70) actionCand = 'Turn Back / Divert';
      else if (s.overallRisk >= 40) actionCand = 'Slow Down';

      let hazType = 'Geotechnical slope';
      if (s.landslideRisk >= 60) hazType = 'Severe Landslide Signal';
      else if (s.floodRisk >= 50) hazType = 'High Flash Flood Inundation';
      else if (s.wildlifeRisk >= 40) hazType = 'Wildlife Crossing Corridor';
      else if (s.road_state === 'RESTRICTED') hazType = 'Restricted Passage';

      return {
        segment_id: s.segment_id,
        name: s.name,
        hazard_type: hazType,
        source: 'Synthetic Replay Dataset',
        severity: Number((s.overallRisk / 100).toFixed(2)),
        base_confidence: Number((s.confidence / 100).toFixed(2)),
        trend: s.trend.toLowerCase() as any,
        source_agreement: 0.9,
        data_recency: 0.95,
        historical_reliability: 0.85,
        confidence: Number((s.confidence / 100).toFixed(2)),
        risk_score: Number((s.overallRisk / 100).toFixed(2)),
        action_candidate: actionCand,
      };
    });
  }, [currentSnapshot]);

  const activeSegments = corridorMode === 'MUNNAR_REPLAY' ? replaySegmentEvaluations : wayanadSegments;
  const controllingId = corridorMode === 'MUNNAR_REPLAY' ? currentSnapshot.controllingSegment.segment_id : 'S1';
  const corridorTitle = corridorMode === 'MUNNAR_REPLAY' ? 'Munnar → Valparai High Range Pass (SH-17)' : 'NH-766 Kozhikode to Wayanad Ghat Pass';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>Pre-Trip Situational Risk Map</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {corridorTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualizes localized hazard exposures, physical road states, and candidate actions across all monitored checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCorridorMode('MUNNAR_REPLAY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              corridorMode === 'MUNNAR_REPLAY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Munnar Corridor (S1–S6)</span>
          </button>
          <button
            onClick={() => setCorridorMode('WAYANAD_LIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              corridorMode === 'WAYANAD_LIVE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>NH-766 Wayanad Pass</span>
          </button>
        </div>
      </div>

      {/* Current Intelligence Banner when in Munnar Corridor Mode */}
      {corridorMode === 'MUNNAR_REPLAY' && (
        <CurrentIntelligenceBanner showDetails={false} />
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && corridorMode === 'WAYANAD_LIVE' ? (
        <div className="h-96 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Fetching corridor telemetry from database...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Corridor Map Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <CorridorMap 
              segmentScores={activeSegments}
              controllingSegmentId={controllingId}
              corridorName={corridorTitle}
            />
          </div>

          {/* Segment Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeSegments.map((seg) => {
              const isHigh = seg.risk_score >= 0.7;
              const isModerate = seg.risk_score >= 0.3 && !isHigh;
              const badgeClass = isHigh
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : isModerate
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              const replaySegment = corridorMode === 'MUNNAR_REPLAY' ? currentSnapshot.segments[seg.segment_id] : null;

              return (
                <div 
                  key={seg.segment_id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {seg.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 shrink-0">
                      {seg.segment_id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="capitalize font-medium truncate">{seg.hazard_type}</span>
                    <span className="font-bold text-slate-800 shrink-0">Risk: {(seg.risk_score * 100).toFixed(0)}%</span>
                  </div>

                  {replaySegment && (
                    <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                      <div>Rain 1h: <b className="text-slate-700">{replaySegment.rainfall_1h_mm}mm</b></div>
                      <div>Soil Sat: <b className="text-slate-700">{replaySegment.soil_saturation_pct}%</b></div>
                      <div>Water: <b className="text-slate-700">{replaySegment.water_level_pct}%</b></div>
                      <div>Road: <b className={replaySegment.road_state === 'BLOCKED' ? 'text-rose-600 font-bold' : 'text-slate-700'}>{replaySegment.road_state}</b></div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Directive:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${badgeClass}`}>
                      {seg.action_candidate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
