/**
 * Normalized Action Resolution Types for TravelLord AI
 * Core source of truth for deterministic multi-hazard protective-action resolution.
 */

export type ActionType =
  | 'CONTINUE'
  | 'SLOW_DOWN'
  | 'STOP'
  | 'WAIT'
  | 'TURN_BACK'
  | 'DIVERT'
  | 'SEEK_SHELTER'
  | 'CONTACT_HELP';

export type RoadAccessibilityState =
  | 'OPEN'
  | 'RESTRICTED'
  | 'PARTIALLY_ACCESSIBLE'
  | 'BLOCKED'
  | 'UNKNOWN';

export type HazardType =
  | 'LANDSLIDE'
  | 'FLOOD'
  | 'FLASH_FLOOD'
  | 'HEAVY_RAIN'
  | 'WILDLIFE'
  | 'ROAD_CLOSURE'
  | 'ACCIDENT'
  | 'PROTEST'
  | 'CROWD'
  | 'ROCKFALL'
  | 'OTHER';

export type HazardTrend = 'rising' | 'stable' | 'falling';

export type SourceType = 'AUTHORITATIVE' | 'MODELED' | 'CROWD' | 'SIMULATED';

export type TravelMode = 'Car' | 'Bike' | 'Bus' | 'On Foot';

export type RecoverabilityLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'CRITICAL_TRAP_RISK';

export interface LocationPoint {
  lat: number;
  lng: number;
  name: string;
}

export interface TravelerState {
  currentLocation: LocationPoint;
  destination: LocationPoint;
  currentSegmentId: string;
  travelMode: TravelMode;
  speedKmh: number;
  direction: string;
  departureTime: string;
  currentTime: string;
  isSimulatedGps: boolean;
}

export interface RoadState {
  segmentId: string;
  name: string;
  state: RoadAccessibilityState;
  source: string;
  sourceType: SourceType;
  confidence: number;
  lastUpdated: string;
  lanePassableCount?: number;
  blockageReason?: string;
}

export interface HazardState {
  id: string;
  type: HazardType;
  location: LocationPoint;
  affectedSegments: string[];
  severity: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  trend: HazardTrend;
  onsetTime?: string;
  expectedEndTime?: string;
  source: string;
  sourceType: SourceType;
  lastUpdated: string;
  details?: string;
}

export interface SafeLocation {
  id: string;
  name: string;
  location: LocationPoint;
  type: 'SAFE_ZONE' | 'SHELTER' | 'POLICE_STATION' | 'HOSPITAL' | 'REST_AREA';
  capacityStatus: 'AVAILABLE' | 'CROWDED' | 'FULL';
  distanceKm: number;
  estimatedReachMinutes: number;
  nearestSegmentId: string;
}

export interface RouteEdge {
  id: string;
  fromSegmentId: string;
  toSegmentId: string;
  name: string;
  routeRole: 'MAIN_ROUTE' | 'ALTERNATE_A' | 'ALTERNATE_B' | 'RETURN_PATH';
  distanceKm: number;
  travelTimeMinutes: number;
  hazards: HazardState[];
  roadState: RoadState;
}

export interface RouteGraph {
  corridorName: string;
  nodes: { [segmentId: string]: LocationPoint };
  edges: RouteEdge[];
  safeLocations: SafeLocation[];
}

export interface ConsequenceAnalysis {
  projectedState: string;
  secondaryHazards: HazardType[];
  escapeAvailability: 'AMPLE' | 'LIMITED' | 'NONE';
  futureOptionPreservation: 'HIGH' | 'MODERATE' | 'POOR';
  description: string;
}

export interface CandidateEvaluation {
  action: ActionType;
  targetRouteOrZone?: string;
  feasible: boolean;
  feasibilityScore: number; // 0.0 to 1.0
  conflicts: string[];
  secondaryRisks: string[];
  consequence: ConsequenceAnalysis;
  recoverability: RecoverabilityLevel;
  decisionWindowMinutes: number;
  rejectionReason?: string;
  confidence: number;
}

export type CandidateActionEvaluation = CandidateEvaluation;

export interface RejectedAction {
  action: ActionType;
  routeOrTarget?: string;
  reason: string;
  conflictHazard?: HazardType;
  secondaryRisk?: string;
}

export interface ActionDecisionResult {
  action: ActionType;
  actionTitle: string;
  status: 'SAFE' | 'CAUTION' | 'CRITICAL' | 'INSUFFICIENT_DATA';
  riskScore: number;
  confidence: number;
  decisionWindowMinutes: number;
  decisionWindowDescription: string;
  reasons: string[];
  rejectedActions: RejectedAction[];
  candidateEvaluations: CandidateEvaluation[];
  recoverability: RecoverabilityLevel;
  controllingHazard: HazardState | null;
  controllingSegmentId: string;
  activeHazards: HazardState[];
  safeLocations: SafeLocation[];
  dataFreshnessMinutes?: number;
  isSimulatedScenario?: boolean;
  scenarioName?: string;
  validUntil: string;
  recommendationSummary: string;
}

export type ActionResolutionResult = ActionDecisionResult;

export interface ResolveActionParams {
  travelerState?: Partial<TravelerState>;
  hazards?: HazardState[];
  roadStates?: RoadState[];
  corridorType?: 'WAYANAD_NH766' | 'MUNNAR_VALPARAI';
  baseConfidence?: number;
  isSimulatedScenario?: boolean;
  scenarioName?: string;
}
