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
  buildReplaySnapshot, 
  generateFullReplayTimeline 
} from './syntheticReplay';
import { SPEED_INTERVALS_MS } from './replayClock';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  FastForward, 
  Activity, 
  Clock, 
  ShieldAlert, 
  Database,
  Layers
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
 * Global Replay Control Bar
 * Visually displays the timeline scrub bar, play/pause controls, speed selector,
 * and prominent data authenticity provenance badges.
 */
export function ReplayControlBanner() {
  const { 
    currentSnapshot, 
    currentTimestamp, 
    currentIndex, 
    isPlaying, 
    speed, 
    togglePlay, 
    next, 
    reset, 
    setTimestamp, 
    setSpeed 
  } = useReplay();

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md rounded-2xl p-4 shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Replay Mode Title & Provenance */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Real-Time Replay Mode</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                SIMULATED REPLAY
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Data source: Synthetic Replay Dataset (Munnar → Valparai Corridor)</span>
            </p>
          </div>
        </div>

        {/* Center: Timeline Step Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {REPLAY_TIMESTAMPS.map((ts, idx) => {
            const timeStr = ts.split(' ')[1];
            const isSelected = idx === currentIndex;
            return (
              <button
                key={ts}
                onClick={() => setTimestamp(ts)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>{timeStr}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Playback Controls & Speed */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={togglePlay}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto Play</span>
              </>
            )}
          </button>

          <button
            onClick={next}
            title="Next Update"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={reset}
            title="Reset to 06:00"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-[11px] font-semibold">
            {([1, 5, 15, 30] as ReplaySpeed[]).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  speed === s
                    ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic State Status Ribbon */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Current Replay Time:</span>
            <span className="font-bold text-emerald-400">{currentSnapshot.timeLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Calculated Risk:</span>
            <span className={`font-bold ${
              currentSnapshot.corridorRisk >= 70 ? 'text-rose-400' : currentSnapshot.corridorRisk >= 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {currentSnapshot.corridorRisk} / 100
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Trend:</span>
            <span className={`font-bold ${
              currentSnapshot.corridorTrend === 'RISING' ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {currentSnapshot.corridorTrend}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Evidence Confidence:</span>
            <span className="font-bold text-sky-400">{currentSnapshot.corridorConfidence}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Engine Recommendation:</span>
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
      </div>
    </div>
  );
}
