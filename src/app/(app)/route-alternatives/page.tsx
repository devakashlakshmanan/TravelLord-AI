'use client';

import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Navigation, 
  ShieldCheck,
  TrendingDown,
  Info,
  Sliders
} from 'lucide-react';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import { DEMO_SCENARIOS } from '@/lib/engine/actionResolution/scenarios';
import ProvenanceBadge from '@/components/ProvenanceBadge';

export default function RouteAlternativesPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEMO_SCENARIOS[2].id);

  const scenario = DEMO_SCENARIOS.find(s => s.id === selectedScenarioId) || DEMO_SCENARIOS[2];
  const decisionResult = resolveProtectiveAction(scenario.params);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <GitFork className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Route Feasibility &amp; Rejection Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Route Alternatives Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Evaluates every geographic path on hazard exposure, physical road state, secondary risk, and recoverability — eliminating deceptive shortcuts that lead into dangerous traps.
          </p>
        </div>

        <ProvenanceBadge origin="SIMULATED" source="scenarios.ts Production Engine" />
      </div>

      {/* Scenario Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Corridor Scenario:</span>
          </label>
          <span className="text-xs font-mono font-bold text-slate-600">{scenario.name}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                sc.id === selectedScenarioId
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sc.name.split(':')[1] || sc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Law Callout */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-950 leading-relaxed">
          <span className="font-extrabold">Deterministic Safety Law: </span>
          TravelLord AI will never recommend an alternate detour if that detour introduces an unrecoverable secondary hazard (e.g. wildlife crossing, washout). The system favors genuine recoverability over mileage.
        </div>
      </div>

      {/* Candidate Alternatives Derived Dynamically from Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {decisionResult.candidateEvaluations.map((cand) => {
          const isRecommended = cand.action === decisionResult.action;
          const isFeasible = cand.feasible;

          return (
            <div
              key={cand.action}
              className={`rounded-2xl border p-6 flex flex-col justify-between space-y-5 transition shadow-xs ${
                isRecommended
                  ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                  : !isFeasible
                  ? 'bg-white border-slate-200 opacity-90'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-3">
                {/* Status Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      isRecommended
                        ? 'bg-emerald-600 text-white'
                        : !isFeasible
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {isRecommended ? 'RECOMMENDED DIRECTIVE' : isFeasible ? 'FEASIBLE ALTERNATIVE' : 'REJECTED ALTERNATIVE'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Window: ~{cand.decisionWindowMinutes}m
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {cand.action} {cand.targetRouteOrZone ? `— ${cand.targetRouteOrZone}` : ''}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {cand.consequence.description}
                </p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Feasibility</div>
                    <div className="text-xs font-mono font-bold text-slate-900">{(cand.feasibilityScore * 100).toFixed(0)}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Escape</div>
                    <div className="text-xs font-mono font-bold text-slate-900">{cand.consequence.escapeAvailability}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Recoverability</div>
                    <div className="text-xs font-bold text-slate-900">{cand.recoverability}</div>
                  </div>
                </div>

                {/* Rejection / Causal Reason */}
                {cand.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-medium">
                    <span className="font-bold">Rejection Reason: </span>
                    <span>{cand.rejectionReason}</span>
                  </div>
                )}
              </div>

              {/* Bottom Attribution */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Confidence: {(decisionResult.confidence * 100).toFixed(0)}%</span>
                <span className="font-mono text-slate-700">Future: {cand.consequence.futureOptionPreservation}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
