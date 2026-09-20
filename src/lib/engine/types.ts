export interface HazardSegment {
  segment_id: string;
  name: string;
  lat: number;
  lng: number;
  hazard_type: string;
  severity: number;
  base_confidence: number;
  source: string;
  trend: 'rising' | 'stable' | 'falling';
  last_updated: string;
}

export interface CrowdVerification {
  id: string;
  segment_id: string;
  user_id: string;
  status: 'cleared' | 'still_blocked';
  created_at: string;
}

export interface SegmentEvaluation {
  segment_id: string;
  name: string;
  hazard_type: string;
  source: string;
  severity: number;
  base_confidence: number;
  trend: string;
  source_agreement: number;
  data_recency: number;
  historical_reliability: number;
  confidence: number;
  risk_score: number;
  action_candidate: string;
}

export type SafetyAction = 
  | 'Turn Back / Divert'
  | 'Wait'
  | 'Slow Down'
  | 'Continue'
  | 'ELEVATED_CAUTION'
  | 'INSUFFICIENT_DATA';

export interface DecisionResult {
  action: SafetyAction;
  risk_score: number;
  confidence: number;
  controlling_segment: SegmentEvaluation;
  segment_scores: SegmentEvaluation[];
  valid_until: string;
  trip_id?: string;
}
