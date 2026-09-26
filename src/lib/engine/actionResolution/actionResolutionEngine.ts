import { 
  ActionDecisionResult, 
  HazardState, 
  RoadState, 
  RouteGraph, 
  TravelerState 
} from './actionTypes';
import { WAYANAD_NH766_GRAPH, MUNNAR_VALPARAI_GRAPH } from './corridorGraph';
import { generateCandidateActions } from './actionCandidates';
import { evaluateAllCandidateActions } from './actionEvaluator';
import { calculateDecisionWindow } from './decisionWindow';
import { evaluateActionRecoverability } from './recoverability';

export interface ResolveActionParams {
  travelerState?: Partial<TravelerState>;
  hazards?: HazardState[];
  roadStates?: RoadState[];
  corridorType?: 'WAYANAD_NH766' | 'MUNNAR_VALPARAI';
  baseConfidence?: number;
  isSimulatedScenario?: boolean;
  scenarioName?: string;
}

/**
 * Unified Action Resolution Engine
 *
 * Core Pipeline:
 * Traveler + Hazards + Road States
 *  -> Candidate Generation
 *  -> Consequence Analysis
 *  -> Action Recoverability
 *  -> Decision Window Computation
 *  -> Multi-Hazard Conflict Resolution
 *  -> ONE Clear Executable Action
 */
export function resolveProtectiveAction(params: ResolveActionParams = {}): ActionDecisionResult {
  const corridorType = params.corridorType || 'WAYANAD_NH766';
  const graph: RouteGraph = corridorType === 'MUNNAR_VALPARAI' ? MUNNAR_VALPARAI_GRAPH : WAYANAD_NH766_GRAPH;

  // 1. Build default Traveler State if partial
  const nowIso = new Date().toISOString();
  const traveler: TravelerState = {
    currentLocation: params.travelerState?.currentLocation || graph.nodes[Object.keys(graph.nodes)[0]],
    destination: params.travelerState?.destination || graph.nodes[Object.keys(graph.nodes)[Object.keys(graph.nodes).length - 1]],
    currentSegmentId: params.travelerState?.currentSegmentId || Object.keys(graph.nodes)[0],
    travelMode: params.travelerState?.travelMode || 'Car',
    speedKmh: params.travelerState?.speedKmh ?? 35,
    direction: params.travelerState?.direction || 'Northbound Ascent',
    departureTime: params.travelerState?.departureTime || nowIso,
    currentTime: params.travelerState?.currentTime || nowIso,
    isSimulatedGps: params.travelerState?.isSimulatedGps ?? true,
  };

  // 2. Default Active Hazards if none provided
  const hazards: HazardState[] = params.hazards || [];

  // 3. Default Road States
  const roadStates: RoadState[] = params.roadStates || graph.edges.map(e => e.roadState);

  // 4. Base Confidence
  const baseConfidence = params.baseConfidence ?? 0.82;

  // 5. Generate Action Candidates
  const candidates = generateCandidateActions(traveler, roadStates, graph, hazards);

  // 6. Evaluate all Candidate Actions & Resolve Selected Action
  const evaluationOutput = evaluateAllCandidateActions(
    candidates,
    traveler,
    hazards,
    roadStates,
    graph,
    baseConfidence
  );

  // 7. Decision Window calculation
  const decisionWindow = calculateDecisionWindow(traveler, hazards, graph);

  // 8. Recoverability of selected action
  const recoverability = evaluateActionRecoverability(
    evaluationOutput.selectedAction,
    traveler,
    hazards,
    roadStates,
    graph
  );

  // 9. Valid until calculation (30 minutes default)
  const validUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  // 10. Summary description
  let recommendationSummary = `${evaluationOutput.actionTitle}: ${evaluationOutput.reasons[0] || 'Proceed with standard vigilance.'}`;
  if (evaluationOutput.rejectedActions.length > 0) {
    const firstRejection = evaluationOutput.rejectedActions[0];
    recommendationSummary += ` (${firstRejection.action} rejected: ${firstRejection.reason})`;
  }

  return {
    action: evaluationOutput.selectedAction,
    actionTitle: evaluationOutput.actionTitle,
    status: evaluationOutput.status,
    riskScore: evaluationOutput.riskScore,
    confidence: evaluationOutput.confidence,
    decisionWindowMinutes: decisionWindow.minutes,
    decisionWindowDescription: decisionWindow.description,
    reasons: evaluationOutput.reasons,
    rejectedActions: evaluationOutput.rejectedActions,
    candidateEvaluations: evaluationOutput.candidateEvaluations,
    recoverability: recoverability.level,
    controllingHazard: evaluationOutput.controllingHazard,
    controllingSegmentId: evaluationOutput.controllingSegmentId,
    activeHazards: hazards,
    safeLocations: graph.safeLocations,
    dataFreshnessMinutes: 2,
    isSimulatedScenario: params.isSimulatedScenario ?? false,
    scenarioName: params.scenarioName,
    validUntil,
    recommendationSummary,
  };
}
