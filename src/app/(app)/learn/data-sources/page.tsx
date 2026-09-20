'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { HazardSegment } from '@/lib/engine/types';
import { 
  Database, 
  Info, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function DataSourcesPage() {
  const supabase = createClient();
  const [segments, setSegments] = useState<HazardSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSources() {
      try {
        const { data, error: fetchErr } = await supabase
          .from('hazard_segments')
          .select('*')
          .order('segment_id', { ascending: true });

        if (fetchErr) throw fetchErr;
        setSegments(data || []);
      } catch (err: any) {
        console.error('Failed to load data sources:', err);
        setError('Unable to fetch data provenance records from database.');
      } finally {
        setLoading(false);
      }
    }

    loadSources();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
          <Database className="w-3 h-3 text-emerald-400" />
          <span>Full Transparency & Provenance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Data Sources & Transparency
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Every decision rendered by TravelLord AI is traceable to its verified origin. Here is the full provenance breakdown for the NH-766 corridor.
        </p>
      </div>

      {/* Mandatory Disclosure Paragraph */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Info className="w-4 h-4 text-emerald-600" />
          <span>MVP Architectural Disclosure</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          This MVP uses manually curated data grounded in real public sources for one real corridor (NH-766, Kozhikode–Wayanad), rather than live automated government API feeds. This design decision is deliberate: before connecting production automated feeds from agencies such as the Geological Survey of India (GSI) or the India Meteorological Department (IMD), the deterministic decision gate math must be verified and battle-tested on real historical ground-truth hazard profiles.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          All data sources, methodologies, and modeling classifications are openly documented below.
        </p>
      </div>

      {/* Real-time Supabase Data Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            Corridor Segment Provenance Records
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            Live from Supabase
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-xs text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-slate-700 mb-2" />
            <span>Loading provenance data...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 pr-3">ID</th>
                  <th className="py-2.5 px-3">Segment Name</th>
                  <th className="py-2.5 px-3">Hazard Type</th>
                  <th className="py-2.5 px-3">Base Confidence</th>
                  <th className="py-2.5 pl-3">Public Data Source / Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {segments.map((seg) => (
                  <tr key={seg.segment_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pr-3 font-mono font-bold text-slate-900">
                      {seg.segment_id}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {seg.name}
                    </td>
                    <td className="py-3.5 px-3 capitalize font-medium text-slate-600">
                      {seg.hazard_type.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-emerald-800">
                      {(seg.base_confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-3.5 pl-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-medium text-[11px]">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span>{seg.source}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
