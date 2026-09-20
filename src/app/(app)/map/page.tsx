'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase';
import { HazardSegment, SegmentEvaluation } from '@/lib/engine/types';
import { Loader2, AlertTriangle, Layers, Compass } from 'lucide-react';
import Link from 'next/link';

// Dynamically import existing CorridorMap with ssr: false (exact same pattern)
const CorridorMap = dynamic(() => import('@/components/CorridorMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
      <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-600" />
      <span>Loading NH-766 live corridor map...</span>
    </div>
  ),
});

export default function MapPage() {
  const supabase = createClient();
  const [segments, setSegments] = useState<SegmentEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCorridorData() {
      try {
        // Fetch all 6 hazard segments directly from Supabase (read-only)
        const { data, error: fetchErr } = await supabase
          .from('hazard_segments')
          .select('*')
          .order('segment_id', { ascending: true });

        if (fetchErr) throw fetchErr;

        if (data) {
          // Adapt into SegmentEvaluation shape required by CorridorMap
          const evaluations: SegmentEvaluation[] = data.map((s: HazardSegment) => {
            const trendMultiplier = s.trend === 'rising' ? 1.2 : s.trend === 'falling' ? 0.8 : 1.0;
            const confidence = s.base_confidence;
            const risk_score = Number((s.severity * (0.5 + 0.5 * confidence) * trendMultiplier).toFixed(4));

            let action_candidate = 'Continue';
            if (confidence >= 0.75) {
              if (risk_score >= 0.7) action_candidate = 'Turn Back / Divert';
              else if (risk_score >= 0.5) action_candidate = 'Wait';
              else if (risk_score >= 0.3) action_candidate = 'Slow Down';
              else action_candidate = 'Continue';
            } else if (confidence >= 0.4) {
              action_candidate = 'ELEVATED_CAUTION';
            } else {
              action_candidate = 'INSUFFICIENT_DATA';
            }

            return {
              segment_id: s.segment_id,
              name: s.name,
              hazard_type: s.hazard_type,
              source: s.source,
              severity: s.severity,
              base_confidence: s.base_confidence,
              trend: s.trend,
              source_agreement: s.base_confidence,
              data_recency: 1.0,
              historical_reliability: 0.7,
              confidence,
              risk_score,
              action_candidate,
            };
          });

          setSegments(evaluations);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Required Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>Pre-Trip Situational Awareness</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Live Corridor Overview — NH-766 Kozhikode to Wayanad
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          This shows all known hazard points on the corridor, independent of any specific trip.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Fetching corridor telemetry from database...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Corridor Map Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
            <CorridorMap 
              segmentScores={segments}
              controllingSegmentId="S1" 
            />
          </div>

          {/* Quick Segment Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {segments.map((seg) => {
              const isHigh = seg.risk_score >= 0.7;
              const isModerate = seg.risk_score >= 0.3 && !isHigh;
              const badgeClass = isHigh
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : isModerate
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <div 
                  key={seg.segment_id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {seg.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {seg.segment_id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="capitalize font-medium">{seg.hazard_type}</span>
                    <span className="font-semibold text-slate-700">Risk: {(seg.risk_score * 100).toFixed(0)}%</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Action:</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${badgeClass}`}>
                      {seg.action_candidate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Callout to Trip Planner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Ready to plan your transit?
              </h4>
              <p className="text-xs text-emerald-800/90 mt-0.5">
                Calculate an end-to-end verified safety recommendation tailored to your specific origin, destination, and vehicle type.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs shrink-0"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open Trip Planner</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
