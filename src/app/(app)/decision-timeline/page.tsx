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
  Loader2,
  Activity,
  Zap,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { DEMO_SCENARIOS } from '@/lib/engine/actionResolution/scenarios';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import { useReplay, ReplayControlBanner } from '@/lib/replay/replayState';
import ProvenanceBadge from '@/components/ProvenanceBadge';

export default function DecisionTimelinePage() {
  const supabase = createClient();
  const { timelineEvents, allSnapshots, setTimestamp } = useReplay();
  const [activeTab, setActiveTab] = useState<'REPLAY_TIMELINE' | 'SCENARIO_EVOLUTION' | 'TRIP_HISTORY'>('REPLAY_TIMELINE');
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

  // Dynamically compute chronological progression across all demo scenarios
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
            <span>Audit Trail &amp; Replay Evolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Decision Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Chronological audit trail showing how changing hazard inputs, road states, and evidence updates trigger deterministic protective action re-evaluations across the corridor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('REPLAY_TIMELINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'REPLAY_TIMELINE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Replay Progression ({timelineEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SCENARIO_EVOLUTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'SCENARIO_EVOLUTION'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Scenario Presets ({scenarioTimeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRIP_HISTORY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'TRIP_HISTORY'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Trip History ({trips.length})</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Synthetic Replay Progression Timeline */}
      {activeTab === 'REPLAY_TIMELINE' && (
        <div className="space-y-6">
          <ReplayControlBanner />

          <div className="space-y-4">
            {timelineEvents.map((evt, idx) => {
              const snapshot = allSnapshots[idx];
              const isHighRisk = evt.newRisk >= 70;
              const isModRisk = evt.newRisk >= 40 && !isHighRisk;

              return (
                <div
                  key={evt.timestamp}
                  className={`p-5 rounded-2xl border transition shadow-xs ${
                    isHighRisk
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : isModRisk
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded bg-slate-900 text-emerald-400 shadow-xs">
                        {evt.timeLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        Munnar → Valparai Replay Observation
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Step {idx + 1} of {timelineEvents.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-500">Overall Risk: <b className={`font-bold ${isHighRisk ? 'text-rose-700' : isModRisk ? 'text-amber-700' : 'text-emerald-700'}`}>{evt.newRisk} / 100</b></span>
                      <span className="text-slate-500">Road: <b className="text-slate-800 font-bold">{evt.newRoadState}</b></span>
                      <span className="text-slate-500">Trend: <b className={evt.newTrend === 'RISING' ? 'text-rose-600 font-bold' : 'text-slate-700 font-bold'}>{evt.newTrend}</b></span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Deterministic Action:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                          evt.newAction === 'STOP' || evt.newAction === 'SEEK_SHELTER' || evt.newAction === 'TURN_BACK'
                            ? 'bg-rose-500/20 text-rose-800 border border-rose-300'
                            : evt.newAction === 'DIVERT'
                            ? 'bg-purple-500/20 text-purple-800 border border-purple-300'
                            : evt.newAction === 'SLOW_DOWN'
                            ? 'bg-amber-500/20 text-amber-800 border border-amber-300'
                            : 'bg-emerald-500/20 text-emerald-800 border border-emerald-300'
                        }`}>
                          {snapshot?.decisionResult.actionTitle || evt.newAction}
                        </span>
                      </div>

                      {evt.actionChanged && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                          Action Re-Evaluated
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Cause of Evaluation: </strong>
                      {evt.reasonForChange}
                    </p>

                    {snapshot?.decisionResult.reasons && snapshot.decisionResult.reasons.length > 0 && (
                      <div className="bg-white/80 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1 font-mono">
                        <div className="font-bold text-slate-800">Causal Decision Window: ~{snapshot.decisionResult.decisionWindowMinutes} mins</div>
                        <div>{snapshot.decisionResult.reasons[0]}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: Scenario Presets Evolution */}
      {activeTab === 'SCENARIO_EVOLUTION' && (
        <div className="space-y-4">
          <ProvenanceBadge origin="SIMULATED" source="Engine Multi-Hazard State Transitions (scenarios.ts)" />

          <div className="space-y-4 pt-2">
            {scenarioTimeline.map((step) => (
              <div
                key={step.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-slate-900 text-emerald-400">
                      {step.time}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{step.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {step.corridor}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-medium">Selected Directive</div>
                    <div className="text-sm font-extrabold text-slate-900">{step.action}</div>
                    <div className="text-xs text-slate-600 max-w-xl">{step.reasons[0]}</div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                    <span className="text-slate-500">Confidence: <b className="text-slate-900">{(step.confidence * 100).toFixed(0)}%</b></span>
                    <span className="text-slate-500">Window: <b className="text-emerald-700">~{step.decisionWindow}m</b></span>
                    <span className="text-slate-500">Recoverability: <b className="text-emerald-700">{step.recoverability}</b></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 3: Supabase Trip Records */}
      {activeTab === 'TRIP_HISTORY' && (
        <div className="space-y-4">
          <ProvenanceBadge origin="HISTORICAL" source="Supabase trips & logs" />

          {loadingTrips ? (
            <div className="h-64 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching trip history...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No Trip History Records Found</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Plan a trip from the Main Dashboard or Trip Planner to record an immutable safety decision log.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900">
                      {trip.source} &rarr; {trip.destination}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Mode: {trip.mode} &bull; Departure: {new Date(trip.travel_time).toLocaleString()}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Logged
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
