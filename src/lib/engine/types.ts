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
  | 'INSUFFICIENT_DATA'
  | 'STOP'
  | 'WAIT'
  | 'SLOW_DOWN'
  | 'CONTINUE'
  | 'TURN_BACK'
  | 'DIVERT'
  | 'SEEK_SHELTER'
  | 'CONTACT_HELP';

export interface DecisionResult {
  action: SafetyAction;
  risk_score: number;
  confidence: number;
  controlling_segment: SegmentEvaluation;
  segment_scores: SegmentEvaluation[];
  valid_until: string;
  trip_id?: string;
  
  // Enhanced Action Resolution fields (backward-compatible extensions)
  actionTitle?: string;
  decisionWindowMinutes?: number;
  decisionWindowDescription?: string;
  reasons?: string[];
  rejectedActions?: Array<{
    action: string;
    reason: string;
    conflictHazard?: string;
    secondaryRisk?: string;
  }>;
  recoverability?: string;
  activeHazardsCount?: number;
  isSimulatedScenario?: boolean;
  scenarioName?: string;
  recommendationSummary?: string;
}

export const WAYANAD_CHECKPOINTS = [
  { id: 'S1', name: 'Adivaram (Base Checkpoint)', lat: 11.4880, lng: 76.1220 },
  { id: 'S5', name: 'Lakkidi Viewpoint Curve', lat: 11.5000, lng: 75.9980 },
  { id: 'S3', name: 'Vythiri Ghat Incline', lat: 11.5760, lng: 76.0980 },
  { id: 'S2', name: 'Meppadi Junction Bypass', lat: 11.5480, lng: 76.2790 },
  { id: 'S6', name: 'Kalpetta Bypass Link', lat: 11.6090, lng: 76.0830 },
  { id: 'S4', name: 'Muthanga / Padinjarethara Sector', lat: 11.6280, lng: 76.4310 },
];

// Re-export all rich types from actionTypes
export * from './actionResolution/actionTypes';
