import { 
  ActionType, 
  RecoverabilityLevel, 
  HazardState, 
  RoadState, 
  RouteGraph, 
  TravelerState, 
  SafeLocation 
} from './actionTypes';

export interface RecoverabilityAssessment {
  level: RecoverabilityLevel;
  score: number; // 0.0 (Irreversible/Trapped) to 1.0 (Fully Reversible/Protected)
  nearestSafeLocation: SafeLocation | null;
  escapeRoutesCount: number;
  reason: string;
}

/**
 * Deterministic Action Recoverability Engine
 * Evaluates whether an action leaves escape options or risks trapping the traveler.
 */
export function evaluateActionRecoverability(
  action: ActionType,
  traveler: TravelerState,
  hazards: HazardState[],
  roadStates: RoadState[],
  graph: RouteGraph
): RecoverabilityAssessment {
  const safeLocations = graph.safeLocations;
  const nearestSafe = safeLocations.length > 0 ? safeLocations[0] : null;

  switch (action) {
    case 'STOP':
    case 'WAIT': {
      // Stopping at or near a designated safe zone has highest recoverability
      return {
        level: 'HIGH',
        score: 0.95,
        nearestSafeLocation: nearestSafe,
        escapeRoutesCount: 2,
        reason: 'Holding at safe staging location preserves complete maneuverability, communication links, and full future routing options.',
      };
    }

    case 'SEEK_SHELTER': {
      return {
        level: 'HIGH',
        score: 0.90,
        nearestSafeLocation: nearestSafe,
        escapeRoutesCount: 1,
        reason: 'Shelter protects physical occupants; reversibility is preserved once hazard peak subsides.',
      };
    }

    case 'TURN_BACK': {
      return {
        level: 'HIGH',
        score: 0.88,
        nearestSafeLocation: nearestSafe,
        escapeRoutesCount: 2,
        reason: 'Reversing toward plain foothills moves traveler away from escalating mountain hazard zones with open retreat routes.',
      };
    }

    case 'SLOW_DOWN': {
      const activeHigh = hazards.filter(h => h.severity >= 0.7 && h.trend === 'rising');
      if (activeHigh.length > 0) {
        return {
          level: 'MODERATE',
          score: 0.60,
          nearestSafeLocation: nearestSafe,
          escapeRoutesCount: 1,
          reason: 'Slowing down preserves braking distance, but remaining on the active slope keeps traveler in the hazard trajectory.',
        };
      }
      return {
        level: 'HIGH',
        score: 0.85,
        nearestSafeLocation: nearestSafe,
        escapeRoutesCount: 2,
        reason: 'Low speed preserves control and vehicle turnaround capability on wide road sections.',
      };
    }

    case 'DIVERT': {
      // Check if diversion enters an unpaved or wildlife corridor where turnaround is difficult
      const wildlifeHazard = hazards.find(h => h.type === 'WILDLIFE' && h.severity >= 0.4);
      const blockedRoad = roadStates.find(r => r.state === 'BLOCKED');

      if (wildlifeHazard && blockedRoad) {
        return {
          level: 'LOW',
          score: 0.25,
          nearestSafeLocation: nearestSafe,
          escapeRoutesCount: 0,
          reason: 'Alternate routes are constrained by wildlife crossing and secondary closures. Turnarounds on narrow forest tracks are severely limited.',
        };
      }

      if (wildlifeHazard) {
        return {
          level: 'MODERATE',
          score: 0.45,
          nearestSafeLocation: nearestSafe,
          escapeRoutesCount: 1,
          reason: 'Diversion through forest pass has sparse safe shelters and limited vehicle turnaround space at night.',
        };
      }

      return {
        level: 'HIGH',
        score: 0.80,
        nearestSafeLocation: nearestSafe,
        escapeRoutesCount: 2,
        reason: 'Diversion utilizes viable paved bypass with regular emergency access points.',
      };
    }

    case 'CONTINUE': {
      const risingLandslide = hazards.find(h => h.type === 'LANDSLIDE' && (h.trend === 'rising' || h.severity >= 0.7));
      const roadBlocked = roadStates.some(r => r.state === 'BLOCKED' && r.segmentId === traveler.currentSegmentId);

      if (roadBlocked) {
        return {
          level: 'CRITICAL_TRAP_RISK',
          score: 0.05,
          nearestSafeLocation: nearestSafe,
          escapeRoutesCount: 0,
          reason: 'Advancing directly into closed road segment risks complete vehicle entrapment between debris blockages.',
        };
      }

      if (risingLandslide) {
        return {
          level: 'LOW',
          score: 0.20,
          nearestSafeLocation: nearestSafe,
          escapeRoutesCount: 0,
          reason: 'Proceeding along active landslide slope with rising trend drastically reduces escape options as mud and debris accumulate.',
        };
      }

      return {
        level: 'HIGH',
        score: 0.85,
        nearestSafeLocation: nearestSafe,
        escapeRoutesCount: 2,
        reason: 'Proceeding along open route maintains standard forward and backward escape options.',
      };
    }

    case 'CONTACT_HELP': {
      return {
        level: 'MODERATE',
        score: 0.50,
        nearestSafeLocation: nearestSafe,
        escapeRoutesCount: 0,
        reason: 'Traveler is stationary awaiting emergency services; recovery depends on external rescue dispatch.',
      };
    }

    default:
      return {
        level: 'MODERATE',
        score: 0.50,
        nearestSafeLocation: null,
        escapeRoutesCount: 1,
        reason: 'Standard recoverability profile.',
      };
  }
}
