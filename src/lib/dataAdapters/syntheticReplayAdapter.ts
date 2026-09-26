import { HazardState, RoadState } from '../engine/actionResolution/actionTypes';
import { ReplaySnapshot } from '../replay/replayTypes';
import { buildReplaySnapshot, REPLAY_TIMESTAMPS } from '../replay/syntheticReplay';

export interface NormalizedCorridorTelemetry {
  timestamp: string;
  corridorType: 'MUNNAR_VALPARAI' | 'WAYANAD_NH766';
  hazards: HazardState[];
  roadStates: RoadState[];
  corridorRisk: number;
  corridorConfidence: number;
  corridorTrend: 'STABLE' | 'RISING' | 'FALLING';
  dataOrigin: 'SIMULATED_REPLAY' | 'LIVE' | 'MODELLED' | 'HISTORICAL' | 'COMMUNITY_REPORTED';
  sourceStatus: 'SYNTHETIC_NOT_LIVE' | 'OFFICIAL_LIVE_FEED';
}

/**
 * Synthetic Replay Adapter
 * Converts synthetic replay observations into normalized HazardState[] & RoadState[].
 * Designed with the exact same output interface as genuine external feed adapters.
 */
export class SyntheticReplayAdapter {
  private currentTimestamp: string;

  constructor(initialTimestamp: string = REPLAY_TIMESTAMPS[0]) {
    this.currentTimestamp = initialTimestamp;
  }

  public setTimestamp(timestamp: string): void {
    this.currentTimestamp = timestamp;
  }

  public getNormalizedTelemetry(): NormalizedCorridorTelemetry {
    const snapshot: ReplaySnapshot = buildReplaySnapshot(this.currentTimestamp);
    return {
      timestamp: snapshot.timestamp,
      corridorType: 'MUNNAR_VALPARAI',
      hazards: snapshot.normalizedHazardState,
      roadStates: snapshot.roadStates,
      corridorRisk: snapshot.corridorRisk,
      corridorConfidence: snapshot.corridorConfidence,
      corridorTrend: snapshot.corridorTrend,
      dataOrigin: 'SIMULATED_REPLAY',
      sourceStatus: 'SYNTHETIC_NOT_LIVE',
    };
  }
}
