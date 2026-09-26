import { ActionResolutionResult, HazardState, RoadState, CandidateActionEvaluation } from '../engine/actionResolution/actionTypes';

export type ReplayDataOrigin = 'SIMULATED_REPLAY';
export type ReplaySourceStatus = 'SYNTHETIC_NOT_LIVE';
export type ReplaySpeed = 1 | 5 | 15 | 30;

export interface ReplayObservationRaw {
  timestamp: string; // '2026-09-25 06:00'
  segment_id: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
  from_location: string;
  to_location: string;
  latitude: number;
  longitude: number;
  slope_deg: number;
  rainfall_1h_mm: number;
  rainfall_24h_mm: number;
  soil_saturation_pct: number;
  water_level_pct: number;
  wildlife_activity_0_1: number;
  wildlife_sightings_6h: number;
  traffic_density_pct: number;
  road_state: 'OPEN' | 'PARTIALLY_ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN';
  // Expected / Reference values from dataset for validation:
  landslide_risk_0_100?: number;
  flood_risk_0_100?: number;
  wildlife_risk_0_100?: number;
  road_risk_0_100?: number;
  overall_risk_0_100?: number;
  confidence_0_100?: number;
  trend?: 'STABLE' | 'RISING' | 'FALLING';
  data_origin: ReplayDataOrigin;
  source_status: ReplaySourceStatus;
}

export interface CalculatedSegmentState {
  segment_id: 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
  from_location: string;
  to_location: string;
  name: string;
  latitude: number;
  longitude: number;
  slope_deg: number;
  
  // Raw measurements
  rainfall_1h_mm: number;
  rainfall_24h_mm: number;
  soil_saturation_pct: number;
  water_level_pct: number;
  wildlife_activity_0_1: number;
  wildlife_sightings_6h: number;
  traffic_density_pct: number;
  road_state: 'OPEN' | 'PARTIALLY_ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN';

  // Deterministically calculated metrics
  landslideSignal: number; // 0 to 1
  landslideRisk: number;   // 0 to 100
  floodRisk: number;       // 0 to 100
  wildlifeRisk: number;    // 0 to 100
  roadRisk: number;        // 0 to 100
  overallRisk: number;     // 0 to 100 (Multi-hazard exposure indicator)
  
  confidence: number;      // 0 to 100 (Evidence quality)
  trend: 'STABLE' | 'RISING' | 'FALLING';
  previousRisk?: number;

  // Expected reference value for validation
  referenceOverallRisk?: number;

  data_origin: ReplayDataOrigin;
  source_status: ReplaySourceStatus;
}

export interface ReplayProvenance {
  dataOrigin: ReplayDataOrigin;
  sourceStatus: ReplaySourceStatus;
  label: string;
  badgeText: string;
  provenanceDescription: string;
  recencyFormula: string;
  isLive: false;
}

export interface ReplaySnapshot {
  timestamp: string; // '2026-09-25 06:00'
  timeLabel: string; // '06:00'
  timelineIndex: number;
  totalTimestamps: number;
  
  segments: Record<string, CalculatedSegmentState>;
  segmentList: CalculatedSegmentState[];
  controllingSegment: CalculatedSegmentState;
  
  // Corridor Level Aggregates
  corridorRisk: number;
  corridorConfidence: number;
  corridorTrend: 'STABLE' | 'RISING' | 'FALLING';
  primaryHazard: string;
  roadStateSummary: 'OPEN' | 'PARTIALLY_ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED';

  // Engine inputs & outputs
  normalizedHazardState: HazardState[];
  roadStates: RoadState[];
  decisionResult: ActionResolutionResult;

  provenance: ReplayProvenance;
}

export interface DecisionTimelineEvent {
  timestamp: string;
  timeLabel: string;
  previousRisk: number;
  newRisk: number;
  previousRoadState: string;
  newRoadState: string;
  previousTrend: string;
  newTrend: string;
  previousAction: string;
  newAction: string;
  actionChanged: boolean;
  reasonForChange: string;
  controllingSegment: string;
  candidateEvaluations: CandidateActionEvaluation[];
}
