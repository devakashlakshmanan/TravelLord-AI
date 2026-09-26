'use client';

import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ActionType, CandidateEvaluation, RejectedAction } from '@/lib/engine/actionResolution/actionTypes';

interface ActionResolutionTreeProps {
  selectedAction: string;
  actionTitle?: string;
  candidateEvaluations?: CandidateEvaluation[];
  rejectedActions?: RejectedAction[];
  reasons?: string[];
  decisionWindowMinutes?: number;
  recoverability?: string;
}

export default function ActionResolutionTree({
  selectedAction,
  actionTitle,
  candidateEvaluations = [],
  rejectedActions = [],
  reasons = [],
  decisionWindowMinutes = 15,
  recoverability = 'HIGH',
}: ActionResolutionTreeProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Default candidate actions if none provided
  const displayCandidates = candidateEvaluations.length > 0 
    ? candidateEvaluations 
    : [
        {
          action: 'CONTINUE' as ActionType,
          feasible: !rejectedActions.some(r => r.action === 'CONTINUE'),
          feasibilityScore: rejectedActions.some(r => r.action === 'CONTINUE') ? 0.2 : 0.9,
          conflicts: rejectedActions.find(r => r.action === 'CONTINUE')?.conflictHazard ? [rejectedActions.find(r => r.action === 'CONTINUE')!.conflictHazard!] : [],
          secondaryRisks: ['Primary Slope Saturation'],
          consequence: {
            projectedState: 'ACTIVE_SLOPE_EXPOSURE',
            secondaryHazards: [],
            escapeAvailability: 'LIMITED' as const,
            futureOptionPreservation: 'POOR' as const,
            description: 'Direct transit across active hazard sector.',
          },
          recoverability: 'LOW' as const,
          decisionWindowMinutes,
          rejectionReason: rejectedActions.find(r => r.action === 'CONTINUE')?.reason,
          confidence: 0.85,
        },
        {
          action: 'DIVERT' as ActionType,
          feasible: !rejectedActions.some(r => r.action === 'DIVERT'),
          feasibilityScore: rejectedActions.some(r => r.action === 'DIVERT') ? 0.3 : 0.85,
          conflicts: rejectedActions.find(r => r.action === 'DIVERT')?.conflictHazard ? [rejectedActions.find(r => r.action === 'DIVERT')!.conflictHazard!] : [],
          secondaryRisks: ['Wildlife Intersection / Structural Closure'],
          consequence: {
            projectedState: 'SECONDARY_CONFLICT',
            secondaryHazards: [],
            escapeAvailability: 'LIMITED' as const,
            futureOptionPreservation: 'POOR' as const,
            description: 'Detour intersects unmonitored animal pass or blocked bypass.',
          },
          recoverability: 'MODERATE' as const,
          decisionWindowMinutes,
          rejectionReason: rejectedActions.find(r => r.action === 'DIVERT')?.reason,
          confidence: 0.82,
        },
        {
          action: 'STOP' as ActionType,
          feasible: true,
          feasibilityScore: 0.95,
          conflicts: [],
          secondaryRisks: [],
          consequence: {
            projectedState: 'SAFE_ZONE_HOLDING',
            secondaryHazards: [],
            escapeAvailability: 'AMPLE' as const,
            futureOptionPreservation: 'HIGH' as const,
            description: 'Vehicle isolated at reinforced civil waypoint.',
          },
          recoverability: 'HIGH' as const,
          decisionWindowMinutes,
          confidence: 0.90,
        },
      ];

  return (
    <div className="w-full bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight text-white">
                Protective Action Resolution Engine
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                Deterministic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates all candidate actions &rarr; Rejects unsafe branches with causal reasons &rarr; Outputs ONE executable action.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Decision Window: ~{decisionWindowMinutes}m</span>
        </div>
      </div>

      {/* Visual Resolution Pipeline */}
      <div className="mt-6 space-y-6">
        {/* Step 1: Situation Banner */}
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Phase 1: Multi-Hazard Interacting State
          </span>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simultaneous Geotechnical, Wildlife &amp; Road Constraints Detected</span>
          </div>
        </div>

        {/* Down Connector */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-slate-700 to-emerald-500/40"></div>
        </div>

        {/* Step 2: Candidate Actions Evaluation Matrix */}
        <div>
          <div className="text-center mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Phase 2: Candidate Feasibility &amp; Consequence Analysis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {displayCandidates.map((cand) => {
              const isSelected = selectedAction.toUpperCase().includes(cand.action);
              const isRejected = !cand.feasible || !!cand.rejectionReason;
              const isExpanded = expandedAction === cand.action;

              return (
                <div
                  key={cand.action}
                  onClick={() => setExpandedAction(isExpanded ? null : cand.action)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : isRejected
                      ? 'bg-slate-800/50 border-rose-900/50 hover:border-rose-700/60'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold tracking-wider text-slate-200">
                      {cand.action}
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>RESOLVED ACTION</span>
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-900">
                        <XCircle className="w-3 h-3" />
                        <span>REJECTED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        <span>CONSIDERED</span>
                      </span>
                    )}
                  </div>

                  {/* Causal reason / rejection note */}
                  <div className="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                    {isRejected ? (
                      <span className="text-rose-300/90">
                        <strong className="text-rose-400">Why Rejected:</strong> {cand.rejectionReason || 'Unsafe secondary consequence.'}
                      </span>
                    ) : isSelected ? (
                      <span className="text-emerald-300/90">
                        <strong className="text-emerald-400">Why Chosen:</strong> Preserves maximum recoverability and isolates traveler from active hazards.
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Feasible under stabilized conditions.
                      </span>
                    )}
                  </div>

                  {/* Recoverability & Option preservation */}
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Recoverability:</span>
                    <span className={`font-bold ${
                      cand.recoverability === 'HIGH' 
                        ? 'text-emerald-400' 
                        : cand.recoverability === 'MODERATE' 
                        ? 'text-amber-400' 
                        : 'text-rose-400'
                    }`}>
                      {cand.recoverability}
                    </span>
                  </div>

                  {/* Accordion toggle */}
                  <div className="mt-2 text-right">
                    <span className="text-[10px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-0.5">
                      <span>{isExpanded ? 'Hide Details' : 'View Reasoning'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-700 text-[11px] space-y-1.5 text-slate-300 animate-fade-in">
                      <p><strong>Projected State:</strong> {cand.consequence?.projectedState || 'NOMINAL'}</p>
                      <p><strong>Consequence:</strong> {cand.consequence?.description}</p>
                      <p><strong>Escape Availability:</strong> {cand.consequence?.escapeAvailability || 'LIMITED'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Down Connector */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-slate-700 to-emerald-500"></div>
        </div>

        {/* Step 3: Final Executable Decision Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-2 border-emerald-500/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                Phase 3: Final Executable Action Directive
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {actionTitle || selectedAction}
              </h2>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                {reasons.slice(0, 3).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Action Recoverability</span>
              <p className="text-base font-extrabold text-emerald-400 font-mono">
                {recoverability} (Reversible)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero AI override. 100% deterministic rule math.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
