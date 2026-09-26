'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  Play,
  Activity,
  Radio
} from 'lucide-react';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/engine/actionResolution/scenarios';
import { CandidateActionEvaluation } from '@/lib/engine/actionResolution/actionTypes';
import { useReplay, ReplayControlBanner } from '@/lib/replay/replayState';
import ProvenanceBadge from '@/components/ProvenanceBadge';

export default function ActionResolverPage() {
  const { currentSnapshot, currentTimestamp } = useReplay();
  const [activeEngineMode, setActiveEngineMode] = useState<'REPLAY_TIMELINE' | 'SCENARIO_PRESETS'>('REPLAY_TIMELINE');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEMO_SCENARIOS[2].id);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const currentScenario: DemoScenario = DEMO_SCENARIOS.find(s => s.id === selectedScenarioId) || DEMO_SCENARIOS[2];

  // In Replay mode, decisions come directly from currentSnapshot.decisionResult; in Preset mode from scenarios.ts params
  const decisionResult = activeEngineMode === 'REPLAY_TIMELINE'
    ? currentSnapshot.decisionResult
    : resolveProtectiveAction(currentScenario.params);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Deterministic Action Engine &amp; Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Action Resolver
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Evaluates candidate actions against immediate hazard exposure, decision window, road accessibility, secondary risk, and recoverability — eliminating unsafe alternatives to output ONE executable directive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveEngineMode('REPLAY_TIMELINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeEngineMode === 'REPLAY_TIMELINE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time Replay Mode</span>
          </button>
          <button
            onClick={() => setActiveEngineMode('SCENARIO_PRESETS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeEngineMode === 'SCENARIO_PRESETS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Scenario Presets ({DEMO_SCENARIOS.length})</span>
          </button>
        </div>
      </div>

      {/* Real-Time Replay Control Banner when in Replay Mode */}
      {activeEngineMode === 'REPLAY_TIMELINE' && (
        <ReplayControlBanner />
      )}

      {/* Scenario Selector Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Scenario Preset from scenarios.ts</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {DEMO_SCENARIOS.length} Presets Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DEMO_SCENARIOS.map((sc) => {
            const active = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setExpandedAction(null);
                }}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold truncate">{sc.name.split(':')[1] || sc.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {sc.badge}
                  </span>
                </div>
                <p className={`text-[11px] line-clamp-2 ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Headline Directive Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Deterministic Output: {currentScenario.name.split(':')[0]}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Confidence: <b className="text-white">{(decisionResult.confidence * 100).toFixed(0)}%</b></span>
            <span className="text-slate-400">Decision Window: <b className="text-emerald-400">~{decisionResult.decisionWindowMinutes} min</b></span>
            <span className="text-slate-400">Recoverability: <b className="text-emerald-400">{decisionResult.recoverability}</b></span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Resolved Protective Directive:
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ⚡
            </span>
            <span>{decisionResult.actionTitle}</span>
          </div>
        </div>

        {/* Primary Causal Reasons */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Why this decision was resolved:
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5">
            {decisionResult.reasons.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Candidate Action Resolution Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <span>Candidate Action Evaluations ({decisionResult.candidateEvaluations.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Scored dynamically via actionResolutionEngine.ts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {decisionResult.candidateEvaluations.map((cand: CandidateActionEvaluation) => {
            const isExpanded = expandedAction === cand.action;
            const isRec = cand.action === decisionResult.action;
            const isFeas = cand.feasible;

            return (
              <div
                key={cand.action}
                className={`rounded-2xl border transition-all ${
                  isRec
                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : !isFeas
                    ? 'bg-slate-50/70 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedAction(isExpanded ? null : cand.action)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="shrink-0">
                      {isRec ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : !isFeas ? (
                        <XCircle className="w-6 h-6 text-rose-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isRec
                              ? 'bg-emerald-600 text-white'
                              : !isFeas
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {isRec ? 'RECOMMENDED' : isFeas ? 'FEASIBLE' : 'REJECTED'}
                        </span>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {cand.action} {cand.targetRouteOrZone ? `(${cand.targetRouteOrZone})` : ''}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Recoverability</div>
                      <div className="text-xs font-mono font-bold text-slate-800">{cand.recoverability}</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-200/60 space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Feasibility Score</div>
                        <div className="font-semibold text-slate-800">{(cand.feasibilityScore * 100).toFixed(0)}%</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Decision Window</div>
                        <div className="font-semibold text-slate-800">~{cand.decisionWindowMinutes} min</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Escape Availability</div>
                        <div className="font-semibold text-slate-800">{cand.consequence.escapeAvailability}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Future Options</div>
                        <div className="font-semibold text-slate-800">{cand.consequence.futureOptionPreservation}</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                      <div className="font-bold text-slate-900">Consequence Analysis:</div>
                      <p className="text-slate-600 leading-relaxed">{cand.consequence.description}</p>
                      {cand.rejectionReason && (
                        <p className="text-rose-700 font-semibold pt-1 border-t border-slate-100">
                          Rejection Reason: {cand.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
