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
  WifiOff
} from 'lucide-react';

interface SafetyCardProps {
  action: SafetyAction;
  riskScore: number;
  confidence: number; // Raw confidence 0 to 1
  displayedConfidence?: number; // Decayed confidence for display
  controllingSegment: SegmentEvaluation;
  explanation: string;
  validUntil: string; // ISO string
  isOffline?: boolean;
  cachedAt?: number; // ms timestamp
}

export default function SafetyCard({
  action,
  confidence,
  displayedConfidence,
  controllingSegment,
  explanation,
  validUntil,
  isOffline = false,
  cachedAt,
}: SafetyCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Use displayedConfidence if provided (for offline decay), else use raw confidence
  const effectiveConfidence = displayedConfidence !== undefined ? displayedConfidence : confidence;
  const confidencePct = Math.round(effectiveConfidence * 100);

  // Check if offline decay caused confidence to drop below 40% threshold
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

  // Format valid until time
  const validUntilFormatted = new Date(validUntil).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const cachedAtFormatted = cachedAt
    ? new Date(cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'earlier';

  // Effective action for rendering
  const effectiveAction = isDecayedBelowThreshold ? 'INSUFFICIENT_DATA' : action;

  // Color System Definition
  const getColorStyles = () => {
    switch (effectiveAction) {
      case 'Continue':
        return {
          border: 'border-emerald-500',
          bg: 'bg-emerald-50/40',
          accentText: 'text-emerald-700',
          headlineText: 'text-emerald-900',
          barColor: 'bg-emerald-500',
          barTrack: 'bg-emerald-100',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: ShieldCheck,
        };
      case 'Slow Down':
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-50/40',
          accentText: 'text-amber-700',
          headlineText: 'text-amber-900',
          barColor: 'bg-amber-500',
          barTrack: 'bg-amber-100',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertTriangle,
        };
      case 'Wait':
        return {
          border: 'border-amber-600',
          bg: 'bg-amber-50/60',
          accentText: 'text-amber-800',
          headlineText: 'text-amber-950',
          barColor: 'bg-amber-600',
          barTrack: 'bg-amber-200',
          badgeBg: 'bg-amber-200 text-amber-900 border-amber-300',
          icon: Clock,
        };
      case 'Turn Back / Divert':
        return {
          border: 'border-rose-600',
          bg: 'bg-rose-50/40',
          accentText: 'text-rose-700',
          headlineText: 'text-rose-950',
          barColor: 'bg-rose-600',
          barTrack: 'bg-rose-100',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: ShieldAlert,
        };
      case 'ELEVATED_CAUTION':
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-50/30',
          accentText: 'text-amber-700',
          headlineText: 'text-amber-900',
          barColor: 'bg-amber-500',
          barTrack: 'bg-amber-100',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: AlertTriangle,
        };
      case 'INSUFFICIENT_DATA':
      default:
        return {
          border: 'border-slate-300',
          bg: 'bg-slate-50',
          accentText: 'text-slate-600',
          headlineText: 'text-slate-800',
          barColor: 'bg-slate-400',
          barTrack: 'bg-slate-200',
          badgeBg: 'bg-slate-200 text-slate-700 border-slate-300',
          icon: HelpCircle,
        };
    }
  };

  const theme = getColorStyles();
  const IconComponent = theme.icon;

  return (
    <div className={`w-full bg-white rounded-2xl border-2 ${theme.border} shadow-sm overflow-hidden transition-all duration-300`}>
      {/* Top Banner Accent */}
      <div className={`px-6 py-4 ${theme.bg} border-b border-slate-100 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2">
          <IconComponent className={`w-5 h-5 ${theme.accentText}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Controlling Hazard Checkpoint: <span className="text-slate-900">{controllingSegment.name}</span>
          </span>
        </div>
        
        {/* Valid until badge */}
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Valid until {validUntilFormatted}</span>
          <span className="text-slate-400 font-mono text-[11px]">({timeLeft})</span>
        </div>
      </div>

      {/* Main Card Content */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Action Headline */}
        {isDecayedBelowThreshold ? (
          // Switched to INSUFFICIENT_DATA state due to offline decay below 40%
          <div id="offline-decayed-fallback-state">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold mb-3">
              <WifiOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Offline Confidence Decay Alert</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              No fresh data since {cachedAtFormatted}. Proceed on local judgment and posted signage.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Confidence has decayed below safe operational thresholds (40%) due to prolonged offline duration in the ghats. Do not rely on stale advisories.
            </p>
            {/* SDMA Helpline link */}
            <div className="mt-3.5 inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <a href="tel:1077" className="underline hover:text-emerald-950">
                Kerala SDMA Helpline (Toll-Free 1077)
              </a>
              <span className="text-slate-400 font-normal">| 0471-2331645</span>
            </div>
          </div>
        ) : effectiveAction === 'INSUFFICIENT_DATA' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold mb-3">
              Data Sufficiency Alert
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Not enough verified data for this segment
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Recent reports are stale or incomplete. Never risk high mountain passes on assumptions.
            </p>
            <div className="mt-3.5 inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <a href="tel:1077" className="underline hover:text-emerald-950">
                Kerala SDMA Helpline (Toll-Free 1077)
              </a>
              <span className="text-slate-400 font-normal">| 0471-2331645</span>
            </div>
          </div>
        ) : effectiveAction === 'ELEVATED_CAUTION' ? (
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              HEIGHTENED AWARENESS ZONE
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight">
              Elevated Hazard Observed
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Data confidence is moderate ({confidencePct}%). Exercise extreme alertness along this ghat curve.
            </p>
          </div>
        ) : (
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
              Safety Directive
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black ${theme.headlineText} tracking-tight`}>
              {effectiveAction}
            </h1>
          </div>
        )}

        {/* Confidence Horizontal Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <span>Data Confidence Level</span>
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

          <div className={`w-full h-3.5 rounded-full ${theme.barTrack} overflow-hidden p-0.5 border border-slate-200`}>
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

        {/* Data Provenance Badge */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <ProvenanceBadge
            source={controllingSegment.source}
            segmentName={controllingSegment.name}
            segmentId={controllingSegment.segment_id}
          />
          <div className="text-[11px] text-slate-400">
            Hazard: <span className="font-semibold uppercase text-slate-600">{controllingSegment.hazard_type}</span> ({controllingSegment.trend})
          </div>
        </div>
      </div>
    </div>
  );
}
