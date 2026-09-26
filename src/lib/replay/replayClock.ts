import { ReplaySpeed } from './replayTypes';
import { REPLAY_TIMESTAMPS } from './syntheticReplay';

export interface ReplayClockState {
  currentTimestamp: string;
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: ReplaySpeed;
}

export const SPEED_INTERVALS_MS: Record<ReplaySpeed, number> = {
  1: 12000, // 1x: 12s per step
  5: 6000,  // 5x: 6s per step
  15: 3000, // 15x: 3s per step
  30: 1500, // 30x: 1.5s per step (fast demo)
};

export class ReplayClock {
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private speed: ReplaySpeed = 15;
  private timer: NodeJS.Timeout | null = null;
  private listeners: Set<(state: ReplayClockState) => void> = new Set();

  constructor(initialTimestamp?: string, initialSpeed: ReplaySpeed = 15) {
    if (initialTimestamp) {
      const idx = REPLAY_TIMESTAMPS.indexOf(initialTimestamp);
      if (idx >= 0) this.currentIndex = idx;
    }
    this.speed = initialSpeed;
  }

  public getState(): ReplayClockState {
    return {
      currentTimestamp: REPLAY_TIMESTAMPS[this.currentIndex],
      currentIndex: this.currentIndex,
      totalSteps: REPLAY_TIMESTAMPS.length,
      isPlaying: this.isPlaying,
      speed: this.speed,
    };
  }

  public subscribe(listener: (state: ReplayClockState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  public play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNextTick();
    this.notify();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public next(): void {
    this.currentIndex = (this.currentIndex + 1) % REPLAY_TIMESTAMPS.length;
    this.notify();
  }

  public prev(): void {
    this.currentIndex = (this.currentIndex - 1 + REPLAY_TIMESTAMPS.length) % REPLAY_TIMESTAMPS.length;
    this.notify();
  }

  public reset(): void {
    this.currentIndex = 0;
    this.pause();
    this.notify();
  }

  public setTimestamp(timestamp: string): void {
    const idx = REPLAY_TIMESTAMPS.indexOf(timestamp);
    if (idx >= 0) {
      this.currentIndex = idx;
      this.notify();
    }
  }

  public setIndex(idx: number): void {
    if (idx >= 0 && idx < REPLAY_TIMESTAMPS.length) {
      this.currentIndex = idx;
      this.notify();
    }
  }

  public setSpeed(speed: ReplaySpeed): void {
    this.speed = speed;
    if (this.isPlaying) {
      if (this.timer) clearTimeout(this.timer);
      this.scheduleNextTick();
    }
    this.notify();
  }

  private scheduleNextTick(): void {
    if (!this.isPlaying) return;
    const interval = SPEED_INTERVALS_MS[this.speed] || 3000;
    this.timer = setTimeout(() => {
      if (!this.isPlaying) return;
      this.currentIndex = (this.currentIndex + 1) % REPLAY_TIMESTAMPS.length;
      this.notify();
      this.scheduleNextTick();
    }, interval);
  }
}
