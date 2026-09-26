'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  ReplaySnapshot, 
  ReplaySpeed, 
  DecisionTimelineEvent 
} from './replayTypes';
import { 
  PRECOMPUTED_REPLAY, 
  REPLAY_TIMESTAMPS, 
} from './syntheticReplay';
import { SPEED_INTERVALS_MS } from './replayClock';
import { 
  Activity, 
  Clock, 
  Database,
} from 'lucide-react';

interface ReplayContextValue {
  currentSnapshot: ReplaySnapshot;
  allSnapshots: ReplaySnapshot[];
  timelineEvents: DecisionTimelineEvent[];
  currentTimestamp: string;
  currentIndex: number;
  totalTimestamps: number;
  isPlaying: boolean;
  speed: ReplaySpeed;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  setTimestamp: (ts: string) => void;
  setSpeed: (speed: ReplaySpeed) => void;
}

const ReplayContext = createContext<ReplayContextValue | null>(null);

export function ReplayProvider({ children }: { children: React.ReactNode }) {
  const [timelineData] = useState(() => PRECOMPUTED_REPLAY);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(15);

  const currentSnapshot = timelineData.snapshots[currentIndex] || timelineData.snapshots[0];
  const currentTimestamp = REPLAY_TIMESTAMPS[currentIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = SPEED_INTERVALS_MS[speed] || 3000;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % REPLAY_TIMESTAMPS.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const value: ReplayContextValue = useMemo(() => ({
    currentSnapshot,
    allSnapshots: timelineData.snapshots,
    timelineEvents: timelineData.events,
    currentTimestamp,
    currentIndex,
    totalTimestamps: REPLAY_TIMESTAMPS.length,
    isPlaying,
    speed,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    togglePlay: () => setIsPlaying(p => !p),
    next: () => setCurrentIndex(prev => (prev + 1) % REPLAY_TIMESTAMPS.length),
    prev: () => setCurrentIndex(prev => (prev - 1 + REPLAY_TIMESTAMPS.length) % REPLAY_TIMESTAMPS.length),
    reset: () => {
      setIsPlaying(false);
      setCurrentIndex(0);
    },
    setTimestamp: (ts: string) => {
      const idx = REPLAY_TIMESTAMPS.indexOf(ts);
      if (idx >= 0) setCurrentIndex(idx);
    },
    setSpeed: (s: ReplaySpeed) => setSpeed(s),
  }), [currentSnapshot, timelineData, currentTimestamp, currentIndex, isPlaying, speed]);

  return (
    <ReplayContext.Provider value={value}>
      {children}
    </ReplayContext.Provider>
  );
}

export function useReplay(): ReplayContextValue {
  const ctx = useContext(ReplayContext);
  if (!ctx) {
    // Fallback for isolated components outside provider
    const snap = PRECOMPUTED_REPLAY.snapshots[0];
    return {
      currentSnapshot: snap,
      allSnapshots: PRECOMPUTED_REPLAY.snapshots,
      timelineEvents: PRECOMPUTED_REPLAY.events,
      currentTimestamp: REPLAY_TIMESTAMPS[0],
      currentIndex: 0,
      totalTimestamps: REPLAY_TIMESTAMPS.length,
      isPlaying: false,
      speed: 15,
      play: () => {},
      pause: () => {},
      togglePlay: () => {},
      next: () => {},
      prev: () => {},
      reset: () => {},
      setTimestamp: () => {},
      setSpeed: () => {},
    };
  }
  return ctx;
}

/**
 * Compact "Current Intelligence" Status Area
 * Traveler-facing operational intelligence component displaying current observation state,
 * risk, confidence, trend, road state, provenance, and resolved protective directive without
 * manual simulation controls.
 */
export function CurrentIntelligenceBanner({ showDetails = true }: { showDetails?: boolean }) {
  const { currentSnapshot, currentTimestamp } = useReplay();

  const isCritical = currentSnapshot.corridorRisk >= 70;
  const isCaution = currentSnapshot.corridorRisk >= 40 && !isCritical;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md mb-6 text-white space-y-4">
      {/* Top Header: Current Intelligence & Provenance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-wide">Current Hazard Intelligence</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                SIMULATED REPLAY
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Database className="w-3 h-3 text-slate-500" />
              <span>Data source: Synthetic Replay Dataset &bull; Munnar &rarr; Valparai Corridor</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Observation: <strong className="text-emerald-400">{currentSnapshot.timeLabel}</strong> ({currentTimestamp})</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs">
        <div>
          <div className="text-slate-400 text-[11px]">Overall Exposure</div>
          <div className={`text-base font-extrabold ${isCritical ? 'text-rose-400' : isCaution ? 'text-amber-400' : 'text-emerald-400'}`}>
            {currentSnapshot.corridorRisk} / 100
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Risk Trend</div>
          <div className={`text-base font-extrabold ${currentSnapshot.corridorTrend === 'RISING' ? 'text-rose-400' : 'text-slate-200'}`}>
            {currentSnapshot.corridorTrend}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Evidence Confidence</div>
          <div className="text-base font-extrabold text-sky-400">
            {currentSnapshot.corridorConfidence}%
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Road State</div>
          <div className={`text-base font-extrabold ${
            currentSnapshot.roadStateSummary === 'BLOCKED'
              ? 'text-rose-400'
              : currentSnapshot.roadStateSummary === 'RESTRICTED'
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {currentSnapshot.roadStateSummary}
          </div>
        </div>
      </div>

      {/* Protective Directive & Why */}
      {showDetails && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>Recommended Protective Action:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                currentSnapshot.decisionResult.action === 'STOP' || currentSnapshot.decisionResult.action === 'SEEK_SHELTER' || currentSnapshot.decisionResult.action === 'TURN_BACK'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : currentSnapshot.decisionResult.action === 'DIVERT'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : currentSnapshot.decisionResult.action === 'SLOW_DOWN'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {currentSnapshot.decisionResult.actionTitle}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              <strong className="text-white">Why: </strong>
              {currentSnapshot.decisionResult.reasons && currentSnapshot.decisionResult.reasons.length > 0
                ? currentSnapshot.decisionResult.reasons[0]
                : 'Corridor telemetry nominal; proceed with standard highway caution.'}
            </p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 shrink-0 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/60">
            <div>Primary Hazard: <b className="text-white">{currentSnapshot.primaryHazard}</b></div>
            <div>Decision Window: <b className="text-emerald-400">{currentSnapshot.decisionResult.decisionWindowDescription || `~${currentSnapshot.decisionResult.decisionWindowMinutes} min`}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Retain alias for backwards compatibility
export const ReplayControlBanner = CurrentIntelligenceBanner;
