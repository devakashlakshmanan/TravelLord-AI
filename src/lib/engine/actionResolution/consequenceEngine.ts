import { 
  ActionType, 
  ConsequenceAnalysis, 
  HazardState, 
  RoadState, 
  RouteGraph, 
  TravelerState 
} from './actionTypes';

/**
 * Consequence Engine: Deterministic State-Transition Reasoning
 * Answers: "If traveler takes action X, what exact scenario will they enter next?"
 */
export function evaluateActionConsequences(
  action: ActionType,
  traveler: TravelerState,
  hazards: HazardState[],
  roadStates: RoadState[],
  graph: RouteGraph,
  targetRouteName?: string
): ConsequenceAnalysis {
  switch (action) {
    case 'CONTINUE': {
      // Find hazards on the main route
      const mainEdge = graph.edges.find(e => e.routeRole === 'MAIN_ROUTE');
      const mainHazards = hazards.filter(h => 
        mainEdge?.hazards.some(eh => eh.id === h.id) ||
        h.affectedSegments.includes(traveler.currentSegmentId) ||
        h.affectedSegments.some(s => s === 'S1' || s === 'S3' || s === 'N_GAP_ROAD')
      );

      const severeLandslide = mainHazards.find(h => h.type === 'LANDSLIDE' && h.severity >= 0.6);
      const roadBlocked = roadStates.some(r => r.state === 'BLOCKED' && r.segmentId === traveler.currentSegmentId);

      if (roadBlocked) {
        return {
          projectedState: 'PHYSICAL_IMPASSE',
          secondaryHazards: ['ROAD_CLOSURE'],
          escapeAvailability: 'NONE',
          futureOptionPreservation: 'POOR',
          description: 'Continuing leads straight into an impassable road blockage with no immediate bypass.',
        };
      }

      if (severeLandslide) {
        return {
          projectedState: 'ACTIVE_SLOPE_EXPOSURE',
          secondaryHazards: ['LANDSLIDE', 'ROCKFALL'],
          escapeAvailability: severeLandslide.trend === 'rising' ? 'NONE' : 'LIMITED',
          futureOptionPreservation: 'POOR',
          description: `Continuing exposes the vehicle to active ${severeLandslide.type} slope failures where escape channels are rapidly narrowing.`,
        };
      }

      return {
        projectedState: 'NOMINAL_CORRIDOR_TRANSIT',
        secondaryHazards: [],
        escapeAvailability: 'AMPLE',
        futureOptionPreservation: 'HIGH',
        description: 'Continuing maintains standard corridor transit with normal stopping and turnaround options.',
      };
    }

    case 'SLOW_DOWN': {
      return {
        projectedState: 'CONTROLLED_DEFENSIVE_TRANSIT',
        secondaryHazards: [],
        escapeAvailability: 'AMPLE',
        futureOptionPreservation: 'HIGH',
        description: 'Reducing speed expands driver reaction time, increases braking headroom, and preserves escape margins.',
      };
    }

    case 'DIVERT': {
      // Check if Alternate A or Alternate B has active hazards
      const altA = graph.edges.find(e => e.routeRole === 'ALTERNATE_A');
      const altB = graph.edges.find(e => e.routeRole === 'ALTERNATE_B');

      const altAHazards = hazards.filter(h => 
        h.type === 'WILDLIFE' || (altA && altA.hazards.some(ah => ah.id === h.id)) || h.affectedSegments.includes('S4') || h.affectedSegments.includes('N_ANAMUDI_PASS')
      );

      const altBHazards = hazards.filter(h =>
        h.type === 'ROAD_CLOSURE' || (altB && altB.hazards.some(bh => bh.id === h.id)) || h.affectedSegments.includes('S6') || h.affectedSegments.includes('N_MATTUPETTY')
      );

      const altARoadState = roadStates.find(r => r.segmentId === altA?.roadState.segmentId);
      const altBRoadState = roadStates.find(r => r.segmentId === altB?.roadState.segmentId);

      const hasWildlifeConflict = altAHazards.some(h => h.type === 'WILDLIFE' && h.severity >= 0.4);
      const isAltABlocked = altARoadState?.state === 'BLOCKED';
      const isAltBBlocked = altBRoadState?.state === 'BLOCKED' || altBHazards.some(h => h.type === 'ROAD_CLOSURE');

      if (hasWildlifeConflict && targetRouteName?.includes('Alternate Route A')) {
        return {
          projectedState: 'SECONDARY_WILDLIFE_CONFLICT_ZONE',
          secondaryHazards: ['WILDLIFE'],
          escapeAvailability: 'LIMITED',
          futureOptionPreservation: 'POOR',
          description: 'Diverting to Alternate Route A enters active wildlife corridor with high animal movement across unlit ghat curves.',
        };
      }

      if (isAltBBlocked && targetRouteName?.includes('Alternate Route B')) {
        return {
          projectedState: 'CLOSED_DETOUR_TRAP',
          secondaryHazards: ['ROAD_CLOSURE'],
          escapeAvailability: 'NONE',
          futureOptionPreservation: 'POOR',
          description: 'Diverting to Alternate Route B leads into an unpassable structural closure.',
        };
      }

      if (hasWildlifeConflict && isAltBBlocked) {
        return {
          projectedState: 'DUAL_SECONDARY_HAZARD_TRAP',
          secondaryHazards: ['WILDLIFE', 'ROAD_CLOSURE'],
          escapeAvailability: 'NONE',
          futureOptionPreservation: 'POOR',
          description: 'All alternate detours are compromised (Alternate A has active wildlife movement, Alternate B is blocked). Diverting creates severe secondary risk.',
        };
      }

      return {
        projectedState: 'VIABLE_ALTERNATE_CORRIDOR',
        secondaryHazards: [],
        escapeAvailability: 'AMPLE',
        futureOptionPreservation: 'HIGH',
        description: 'Alternate bypass is clear, structural integrity is verified, and detour preserves safe travel.',
      };
    }

    case 'STOP':
    case 'WAIT': {
      const nearestSafe = graph.safeLocations[0];
      return {
        projectedState: 'STABILIZED_SAFE_HOLDING',
        secondaryHazards: [],
        escapeAvailability: 'AMPLE',
        futureOptionPreservation: 'HIGH',
        description: `Holding at ${nearestSafe?.name || 'verified safe staging area'} isolates the traveler from active hazard zones while preserving full future routing flexibility.`,
      };
    }

    case 'TURN_BACK': {
      return {
        projectedState: 'RETREAT_TO_SAFE_BASE',
        secondaryHazards: [],
        escapeAvailability: 'AMPLE',
        futureOptionPreservation: 'HIGH',
        description: 'Reversing transit direction retreats from mountain hazards to accessible plains base.',
      };
    }

    case 'SEEK_SHELTER': {
      return {
        projectedState: 'REINFORCED_SHELTER_OCCUPANCY',
        secondaryHazards: [],
        escapeAvailability: 'LIMITED',
        futureOptionPreservation: 'MODERATE',
        description: 'Entering reinforced civil shelter protects against direct geotechnical and meteorological impact.',
      };
    }

    case 'CONTACT_HELP': {
      return {
        projectedState: 'EMERGENCY_DISPATCH_WAIT',
        secondaryHazards: [],
        escapeAvailability: 'NONE',
        futureOptionPreservation: 'MODERATE',
        description: 'Alerting rescue dispatch initiates rapid emergency response while vehicle remains static.',
      };
    }

    default:
      return {
        projectedState: 'UNKNOWN',
        secondaryHazards: [],
        escapeAvailability: 'LIMITED',
        futureOptionPreservation: 'MODERATE',
        description: 'Unspecified state transition.',
      };
  }
}
