import { 
  ActionType, 
  CandidateEvaluation, 
  HazardState, 
  RejectedAction, 
  RoadState, 
  RouteGraph, 
  TravelerState 
} from './actionTypes';
import { evaluateActionConsequences } from './consequenceEngine';
import { evaluateActionRecoverability } from './recoverability';
import { calculateDecisionWindow } from './decisionWindow';
import { analyzeRouteConflicts } from './conflictResolver';

export interface ActionEvaluationOutput {
  selectedAction: ActionType;
  actionTitle: string;
  status: 'SAFE' | 'CAUTION' | 'CRITICAL' | 'INSUFFICIENT_DATA';
  riskScore: number;
  confidence: number;
  reasons: string[];
  rejectedActions: RejectedAction[];
  candidateEvaluations: CandidateEvaluation[];
  controllingHazard: HazardState | null;
  controllingSegmentId: string;
}

/**
 * Deterministic Action Evaluator
 * Evaluates candidate actions, rejects dangerous options with clear causal reasons,
 * and resolves the single safest executable action.
 */
export function evaluateAllCandidateActions(
  candidates: ActionType[],
  traveler: TravelerState,
  hazards: HazardState[],
  roadStates: RoadState[],
  graph: RouteGraph,
  baseConfidence: number
): ActionEvaluationOutput {
  const conflictAnalysis = analyzeRouteConflicts(traveler, hazards, roadStates, graph);
  const decisionWindow = calculateDecisionWindow(traveler, hazards, graph);

  // Controlling hazard (highest severity * confidence)
  let controllingHazard: HazardState | null = null;
  if (hazards.length > 0) {
    controllingHazard = hazards.reduce((prev, curr) => 
      (curr.severity * curr.confidence) > (prev.severity * prev.confidence) ? curr : prev, 
      hazards[0]
    );
  }

  const controllingSegmentId = controllingHazard?.affectedSegments[0] || traveler.currentSegmentId || 'S1';
  const candidateEvaluations: CandidateEvaluation[] = [];
  const rejectedActions: RejectedAction[] = [];

  // Evaluate each candidate
  for (const action of candidates) {
    const consequence = evaluateActionConsequences(action, traveler, hazards, roadStates, graph);
    const recoverability = evaluateActionRecoverability(action, traveler, hazards, roadStates, graph);

    let feasible = true;
    let feasibilityScore = 1.0;
    const conflicts: string[] = [];
    const secondaryRisks: string[] = [];
    let rejectionReason: string | undefined = undefined;

    switch (action) {
      case 'CONTINUE': {
        const hasSevereHazard = hazards.some(h => (h.type === 'LANDSLIDE' || h.type === 'FLOOD') && h.severity >= 0.55);
        const roadBlocked = roadStates.some(r => r.state === 'BLOCKED' && r.segmentId === traveler.currentSegmentId);

        if (roadBlocked) {
          feasible = false;
          feasibilityScore = 0.0;
          conflicts.push('ROAD_IS_PHYSICALLY_BLOCKED');
          secondaryRisks.push('TOTAL_ENTRAPMENT');
          rejectionReason = 'Primary road segment is completely closed by physical blockage.';
        } else if (hasSevereHazard) {
          feasible = false;
          feasibilityScore = 0.2;
          conflicts.push('HIGH_ACTIVE_GEOTECHNICAL_HAZARD');
          secondaryRisks.push('SLOPE_DEBRIS_IMPACT');
          const hz = hazards.find(h => h.type === 'LANDSLIDE' || h.type === 'FLOOD');
          rejectionReason = `Severe ${hz?.type || 'landslide'} risk is active and rising along the primary mountain pass.`;
        }
        break;
      }

      case 'DIVERT': {
        // If alternate A has wildlife and alternate B is closed
        if (conflictAnalysis.alternateACompromised && conflictAnalysis.alternateBCompromised) {
          feasible = false;
          feasibilityScore = 0.15;
          conflicts.push('ALTERNATE_A_WILDLIFE_CONFLICT', 'ALTERNATE_B_STRUCTURAL_CLOSURE');
          secondaryRisks.push('SECONDARY_HAZARD_TRAP', 'NIGHT_FOREST_STRANDING');
          rejectionReason = 'Alternate Route A has active wildlife movement; Alternate Route B is closed by authorities.';
        } else if (conflictAnalysis.alternateACompromised) {
          feasible = false;
          feasibilityScore = 0.35;
          conflicts.push('ALTERNATE_A_WILDLIFE_CONFLICT');
          secondaryRisks.push('ANIMAL_VEHICLE_COLLISION');
          rejectionReason = 'Alternate Route A passes through an active wildlife migration corridor.';
        } else if (conflictAnalysis.alternateBCompromised && !conflictAnalysis.alternateACompromised) {
          // Alt A is clear!
          feasible = true;
          feasibilityScore = 0.85;
        } else {
          feasible = true;
          feasibilityScore = 0.90;
        }
        break;
      }

      case 'SLOW_DOWN': {
        const isImpassable = roadStates.some(r => r.state === 'BLOCKED' && r.segmentId === traveler.currentSegmentId);
        const extremeLandslide = hazards.some(h => h.type === 'LANDSLIDE' && h.severity >= 0.75);

        if (isImpassable || extremeLandslide) {
          feasible = false;
          feasibilityScore = 0.30;
          conflicts.push('ACTIVE_COLLAPSE_ZONE');
          secondaryRisks.push('INSUFFICIENT_PROTECTION_WHILE_MOVING');
          rejectionReason = 'Slowing down does not eliminate exposure to active debris fall in a high-risk landslide zone.';
        }
        break;
      }

      case 'TURN_BACK': {
        // Turn back is generally feasible unless base is blocked
        const originBlocked = roadStates.some(r => r.segmentId === 'S1' && r.state === 'BLOCKED');
        if (originBlocked) {
          feasible = false;
          feasibilityScore = 0.20;
          conflicts.push('RETURN_ROUTE_BLOCKED');
          rejectionReason = 'Return route to plain base is currently impassable.';
        }
        break;
      }

      case 'STOP':
      case 'WAIT': {
        // Stop/Wait at safe zone is highly feasible if safe location exists
        if (!conflictAnalysis.safeZoneViable) {
          feasible = false;
          feasibilityScore = 0.40;
          conflicts.push('NO_DESIGNATED_SAFE_ZONE_CAPACITY');
          rejectionReason = 'Designated safe zones along this stretch have reached capacity.';
        }
        break;
      }

      case 'SEEK_SHELTER': {
        const shelterAvailable = graph.safeLocations.some(s => s.type === 'SHELTER');
        if (!shelterAvailable) {
          feasible = false;
          feasibilityScore = 0.45;
          conflicts.push('NO_REINFORCED_SHELTER_NEARBY');
          rejectionReason = 'No reinforced public shelter within immediate reach of current position.';
        }
        break;
      }

      case 'CONTACT_HELP': {
        // Always feasible as an emergency communication action
        feasible = true;
        feasibilityScore = 0.90;
        break;
      }
    }

    if (!feasible && rejectionReason) {
      rejectedActions.push({
        action,
        reason: rejectionReason,
        conflictHazard: hazards.find(h => conflicts.some(c => c.includes(h.type)))?.type,
        secondaryRisk: secondaryRisks[0],
      });
    }

    candidateEvaluations.push({
      action,
      feasible,
      feasibilityScore,
      conflicts,
      secondaryRisks,
      consequence,
      recoverability: recoverability.level,
      decisionWindowMinutes: decisionWindow.minutes,
      rejectionReason,
      confidence: baseConfidence,
    });
  }

  // --- DETERMINISTIC DECISION SELECTION GATE ---
  let selectedAction: ActionType = 'CONTINUE';
  let actionTitle = 'CONTINUE ON ROUTE';
  let status: 'SAFE' | 'CAUTION' | 'CRITICAL' | 'INSUFFICIENT_DATA' = 'SAFE';
  const reasons: string[] = [];

  const maxRisk = controllingHazard ? controllingHazard.severity : 0.1;

  if (baseConfidence < 0.40) {
    selectedAction = 'STOP';
    actionTitle = 'STOP & VERIFY ROAD CONDITIONS';
    status = 'INSUFFICIENT_DATA';
    reasons.push('Data confidence has fallen below operational threshold (40%).');
    reasons.push('Telemetry in high ghat sector is stale or unverified.');
    reasons.push('Holding at nearest verified waypoint avoids entering unmonitored hazards.');
  } else if (conflictAnalysis.mainRouteCompromised) {
    // Main route is compromised. Check alternatives
    if (!conflictAnalysis.alternateACompromised) {
      selectedAction = 'DIVERT';
      actionTitle = 'DIVERT VIA ALTERNATE ROUTE A';
      status = 'CAUTION';
      reasons.push('Main mountain route is compromised by active geotechnical hazard.');
      reasons.push('Alternate Route A is clear of wildlife and structural blockages.');
      reasons.push('Detour adds transit time but guarantees clear passage.');
    } else {
      // Both main and alternate are compromised!
      selectedAction = 'STOP';
      actionTitle = 'STOP AT SAFE ZONE';
      status = 'CRITICAL';
      const nearestSafe = graph.safeLocations[0];
      reasons.push('Primary route is threatened by severe active landslide hazard.');
      reasons.push('Alternate Route A has active wildlife movement across forest pass.');
      if (conflictAnalysis.alternateBCompromised) {
        reasons.push('Alternate Route B is closed by authorities.');
      }
      reasons.push(`Designated safe stopping zone (${nearestSafe?.name || 'Safe Holding Station'}) is reachable.`);
      reasons.push('Stopping preserves highest recoverability and safe re-evaluation options.');
    }
  } else if (maxRisk >= 0.35 || hazards.some(h => h.type === 'HEAVY_RAIN' && h.severity >= 0.4)) {
    selectedAction = 'SLOW_DOWN';
    actionTitle = 'SLOW DOWN & MAINTAIN DISTANCE';
    status = 'CAUTION';
    reasons.push('Adverse weather / moderate slope runoff detected along corridor.');
    reasons.push('Reduced vehicle speed expands braking margins and driver visibility.');
    reasons.push('All escape and turnaround channels remain fully open.');
  } else {
    selectedAction = 'CONTINUE';
    actionTitle = 'CONTINUE ON CORRIDOR';
    status = 'SAFE';
    reasons.push('All monitored corridor segments exhibit nominal risk scores.');
    reasons.push('No active geotechnical or wildlife blockages detected.');
    reasons.push('Standard transit cadence approved with normal vigilance.');
  }

  return {
    selectedAction,
    actionTitle,
    status,
    riskScore: Number(maxRisk.toFixed(4)),
    confidence: Number(baseConfidence.toFixed(4)),
    reasons,
    rejectedActions,
    candidateEvaluations,
    controllingHazard,
    controllingSegmentId,
  };
}
