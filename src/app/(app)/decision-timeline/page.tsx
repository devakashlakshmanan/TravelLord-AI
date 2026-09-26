'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Clock, 
  Radio, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Info,
  Calendar,
  Compass,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { DEMO_SCENARIOS } from '@/lib/engine/actionResolution/scenarios';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import ProvenanceBadge from '@/components/ProvenanceBadge';

export default function DecisionTimelinePage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'TRIP_HISTORY' | 'SCENARIO_EVOLUTION'>('SCENARIO_EVOLUTION');
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        const { data } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) setTrips(data);
      } catch (err) {
        console.warn('Error fetching trip history:', err);
      } finally {
        setLoadingTrips(false);
      }
    }
    loadTrips();
  }, [supabase]);

  // Dynamically compute chronological progression across all 5 demo scenarios
  const scenarioTimeline = React.useMemo(() => {
    return DEMO_SCENARIOS.map((sc) => {
      const decision = resolveProtectiveAction(sc.params);
      return {
        id: sc.id,
        time: sc.narrativeTime,
        title: sc.name,
        badge: sc.badge,
        corridor: sc.corridor,
        description: sc.description,
        action: decision.actionTitle,
        reasons: decision.reasons,
        confidence: decision.confidence,
        decisionWindow: decision.decisionWindowMinutes,
        recoverability: decision.recoverability,
      };
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Trail &amp; Evolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Decision Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Chronological audit log showing how real-time telemetry changes, confidence decay, and clearing operations dynamically update deterministic protective actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SCENARIO_EVOLUTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'SCENARIO_EVOLUTION'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Scenario State Evolution ({scenarioTimeline.length})
          </button>
          <button
            onClick={() => setActiveTab('TRIP_HISTORY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'TRIP_HISTORY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            User Trip Records ({trips.length})
          </button>
        </div>
      </div>

      {/* Mode 1: Scenario State Evolution */}
      {activeTab === 'SCENARIO_EVOLUTION' && (
        <div className="space-y-4">
          <ProvenanceBadge origin="SIMULATED" source="Engine Multi-Hazard State Transitions (scenarios.ts)" />

          <div className="space-y-4 pt-2">
            {scenarioTimeline.map((step, idx) => (
              <div
                key={step.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-slate-900 text-emerald-400">
                      {step.time}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{step.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                    <span>Conf: <strong className="text-slate-800">{(step.confidence * 100).toFixed(0)}%</strong></span>
                    <span>Window: <strong className="text-emerald-700">~{step.decisionWindow}m</strong></span>
                    <span>Recoverability: <strong className="text-slate-800">{step.recoverability}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-emerald-700 font-extrabold">Directive:</span>
                    <span>{step.action}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] truncate max-w-md">
                    {step.reasons[0] || 'Nominal monitoring'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Real Database Trips History */}
      {activeTab === 'TRIP_HISTORY' && (
        <div className="space-y-4">
          <ProvenanceBadge origin="HISTORICAL" source="Supabase trips Table Log" />

          {loadingTrips ? (
            <div className="py-12 flex items-center justify-center text-xs text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading saved trip records...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <Compass className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700">No previous trip transitions recorded.</div>
              <p>Plan a trip to generate chronological audit logs in Supabase.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((tr) => (
                <div key={tr.id} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{tr.source} &rarr; {tr.destination}</div>
                    <div className="text-[11px] text-slate-400">Mode: {tr.mode} &bull; Recorded: {new Date(tr.created_at || tr.travel_time).toLocaleString()}</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Audit Stored
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
