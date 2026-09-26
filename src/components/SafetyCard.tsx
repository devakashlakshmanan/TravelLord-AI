'use client';

import React, { useEffect, useState } from 'react';
import { SafetyAction, SegmentEvaluation } from '@/lib/engine/types';
import ProvenanceBadge from './ProvenanceBadge';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  PhoneCall, 
  HelpCircle,
  Sparkles,
  WifiOff,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';

interface SafetyCardProps {
  action: SafetyAction | string;
  actionTitle?: string;
  riskScore: number;
  confidence: number;
  displayedConfidence?: number;
  controllingSegment: SegmentEvaluation;
  explanation: string;
  validUntil: string;
  isOffline?: boolean;
  cachedAt?: number;
  reasons?: string[];
  rejectedActions?: Array<{
    action: string;
    reason: string;
    conflictHazard?: string;
    secondaryRisk?: string;
  }>;
  decisionWindowMinutes?: number;
  decisionWindowDescription?: string;
  recoverability?: string;
  isSimulatedScenario?: boolean;
  scenarioName?: string;
}

export default function SafetyCard({
  action,
  actionTitle,
  confidence,
  displayedConfidence,
  controllingSegment,
  explanation,
  validUntil,
  isOffline = false,
  cachedAt,
  reasons = [],
  rejectedActions = [],
  decisionWindowMinutes = 15,
  decisionWindowDescription,
  recoverability = 'HIGH',
  isSimulatedScenario = false,
  scenarioName,
}: SafetyCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const effectiveConfidence = displayedConfidence !== undefined ? displayedConfidence : confidence;
  const confidencePct = Math.round(effectiveConfidence * 100);
  const isDecayedBelowThreshold = isOffline && confidencePct < 40;

  // Live countdown timer
  useEffect(() => {
    function updateCountdown() {
      const target = new Date(validUntil).getTime();
      const now = Date.now();
      const diffMs = target - now;

      if (diffMs <= 0) {
        setTimeLeft('Expired — Refreshing');
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [validUntil]);

  const validUntilFormatted = new Date(validUntil).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const cachedAtFormatted = cachedAt
    ? new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'earlier';

  const normalizedAction = (actionTitle || action || '').toUpperCase();
  const effectiveAction = isDecayedBelowThreshold ? 'INSUFFICIENT_DATA' : action;

  // Visual styling based on action
  const getColorStyles = () => {
    if (isDecayedBelowThreshold || effectiveAction === 'INSUFFICIENT_DATA') {
      return {
        border: 'border-slate-300',
        bg: 'bg-slate-50',
        accentText: 'text-slate-600',
        headlineText: 'text-slate-800',
        barColor: 'bg-slate-400',
        barTrack: 'bg-slate-200',
        badgeBg: 'bg-slate-200 text-slate-700 border-slate-300',
        statusLabel: 'INSUFFICIENT DATA',
        icon: HelpCircle,
      };
    }

    if (normalizedAction.includes('STOP') || normalizedAction.includes('TURN BACK') || normalizedAction.includes('CRITICAL')) {
      return {
        border: 'border-rose-600',
        bg: 'bg-rose-50/50',
        accentText: 'text-rose-700',
        headlineText: 'text-rose-950',
        barColor: 'bg-rose-600',
        barTrack: 'bg-rose-100',
        badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
        statusLabel: 'PROTECTIVE ACTION REQUIRED',
        icon: ShieldAlert,
      };
    }

    if (normalizedAction.includes('DIVERT') || normalizedAction.includes('SLOW') || normalizedAction.includes('WAIT') || normalizedAction.includes('CAUTION')) {
      return {
        border: 'border-amber-500',
        bg: 'bg-amber-50/50',
        accentText: 'text-amber-700',
        headlineText: 'text-amber-950',
        barColor: 'bg-amber-500',
        barTrack: 'bg-amber-100',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        statusLabel: 'ELEVATED CAUTION / DETOUR',
        icon: AlertTriangle,
      };
    }

    return {
      border: 'border-emerald-500',
      bg: 'bg-emerald-50/40',
      accentText: 'text-emerald-700',
      headlineText: 'text-emerald-950',
      barColor: 'bg-emerald-500',
      barTrack: 'bg-emerald-100',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      statusLabel: 'NOMINAL TRANSIT APPROVED',
      icon: ShieldCheck,
    };
  };

  const theme = getColorStyles();
  const IconComponent = theme.icon;

  return (
    <div className={`w-full bg-white rounded-2xl border-2 ${theme.border} shadow-md overflow-hidden transition-all duration-300`}>
      {/* Top Banner Accent */}
      <div className={`px-6 py-4 ${theme.bg} border-b border-slate-100 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${theme.accentText}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Controlling Sector: <span className="text-slate-950 font-extrabold">{controllingSegment.name}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isSimulatedScenario && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
              Demo Scenario
            </span>
          )}
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Valid until {validUntilFormatted}</span>
            <span className="text-slate-400 font-mono text-[11px]">({timeLeft})</span>
          </div>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Action Headline & Directive */}
        {isDecayedBelowThreshold ? (
          <div id="offline-decayed-fallback-state">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold mb-3">
              <WifiOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Offline Confidence Decay Alert</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              No fresh telemetry since {cachedAtFormatted}. Proceed on local judgment and posted signage.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Confidence has decayed below safe operational thresholds (40%) due to prolonged offline duration in the ghats.
            </p>
            <div className="mt-3.5 inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <a href="tel:1077" className="underline hover:text-emerald-950">
                Kerala SDMA Helpline (Toll-Free 1077)
              </a>
              <span className="text-slate-400 font-normal">| 0471-2331645</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                Resolved Safety Action
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badgeBg}`}>
                {theme.statusLabel}
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black ${theme.headlineText} tracking-tight`}>
              {actionTitle || effectiveAction}
            </h1>
          </div>
        )}

        {/* Causal Reasoning & Rejected Alternatives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Why this Action */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Why This Action?</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
              {(reasons.length > 0 ? reasons : [
                `Primary hazard (${controllingSegment.hazard_type}) evaluated with risk score ${(controllingSegment.risk_score * 100).toFixed(0)}%.`,
                `Preserves maximum driver control and safe waypoint access.`,
                `Adheres to deterministic safety corridor thresholds.`
              ]).map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rejected Alternatives */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Rejected Unsafe Alternatives</span>
            </div>
            {rejectedActions.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                {rejectedActions.map((rej, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">&times;</span>
                    <span>
                      <strong className="text-slate-900">{rej.action}:</strong> {rej.reason}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Nominal corridor conditions; standard transit alternatives are safely available.
              </p>
            )}
          </div>
        </div>

        {/* Operational Metrics: Decision Window & Recoverability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="font-bold text-slate-800">Decision Window</span>
              <p className="text-slate-500 text-[11px]">
                {decisionWindowDescription || `Reassess in approximately ${decisionWindowMinutes} minutes.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="font-bold text-slate-800">Action Recoverability</span>
              <p className="text-slate-500 text-[11px]">
                <strong className="text-emerald-700 font-semibold">{recoverability}</strong> &mdash; Preserves vehicle retreat and escape channels.
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Meter Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <span>Telemetry Confidence Level</span>
              {isOffline && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Offline Decayed
                </span>
              )}
            </span>
            <span className={`font-mono text-sm font-bold ${theme.accentText}`}>
              {confidencePct}%
            </span>
          </div>

          <div className={`w-full h-3 rounded-full ${theme.barTrack} overflow-hidden p-0.5 border border-slate-200`}>
            <div 
              id="confidence-bar-fill"
              className={`h-full rounded-full ${theme.barColor} transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(100, Math.max(0, confidencePct))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>0% (No data)</span>
            <span className={confidencePct < 40 ? 'font-bold text-rose-600' : ''}>40% (Threshold)</span>
            <span>75% (High certainty)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Groq AI Explanation Text */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Traveler Safety Briefing</span>
          </div>
          <p id="safety-explanation-text" className="text-sm text-slate-700 leading-relaxed font-normal">
            {explanation || 'Calculating real-time route explanation...'}
          </p>
        </div>

        {/* Data Provenance & Source Transparency */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <ProvenanceBadge
            source={controllingSegment.source}
            segmentName={controllingSegment.name}
            segmentId={controllingSegment.segment_id}
          />
          <div className="text-[11px] text-slate-500">
            Hazard: <span className="font-semibold uppercase text-slate-700">{controllingSegment.hazard_type}</span> ({controllingSegment.trend})
          </div>
        </div>
      </div>
    </div>
  );
}
