import { 
  ActionType, 
  TravelerState, 
  RoadState, 
  RouteGraph, 
  HazardState
} from './actionTypes';

/**
 * Generates physically and logically possible Candidate Actions given traveler state,
 * road conditions, and corridor graph topology.
 *
 * Supported Actions:
 * - CONTINUE: Proceed on current active route.
 * - SLOW_DOWN: Reduce speed due to caution/weather/visibility.
 * - STOP: Halt vehicle at nearest accessible safe staging point.
 * - WAIT: Pause journey for a calculated window until conditions stabilize.
 * - TURN_BACK: Reverse direction to a known secure origin or base.
 * - DIVERT: Switch to a viable alternate corridor branch (e.g. Alternate A or B).
 * - SEEK_SHELTER: Immediately divert to designated emergency structure.
 * - CONTACT_HELP: Signal emergency rescue services if impassable/trapped.
 */
export function generateCandidateActions(
  traveler: TravelerState,
  roadStates: RoadState[],
  graph: RouteGraph,
  activeHazards: HazardState[]
): ActionType[] {
  const candidates: ActionType[] = [];

  // 1. CONTINUE is always considered unless physically blocked immediately at traveler's spot
  candidates.push('CONTINUE');

  // 2. SLOW DOWN is candidate if vehicle is moving and hazards or adverse weather exist
  if (traveler.speedKmh > 15 || activeHazards.length > 0) {
    candidates.push('SLOW_DOWN');
  }

  // 3. STOP is always a candidate if any safe stopping point or shoulder is available
  if (graph.safeLocations.length > 0) {
    candidates.push('STOP');
  }

  // 4. WAIT is candidate for transient hazards (heavy rain, active clearing, temporary herd crossing)
  const hasTransientHazard = activeHazards.some(
    h => h.type === 'HEAVY_RAIN' || h.type === 'WILDLIFE' || h.type === 'FLOOD' || h.trend === 'falling'
  );
  if (hasTransientHazard || activeHazards.length > 0) {
    candidates.push('WAIT');
  }

  // 5. TURN_BACK is candidate if return path edge exists in graph and origin is reachable
  const hasReturnPath = graph.edges.some(e => e.routeRole === 'RETURN_PATH');
  if (hasReturnPath) {
    candidates.push('TURN_BACK');
  }

  // 6. DIVERT is candidate if alternate route edges exist (Alternate A or Alternate B)
  const hasAlternateRoutes = graph.edges.some(
    e => e.routeRole === 'ALTERNATE_A' || e.routeRole === 'ALTERNATE_B'
  );
  if (hasAlternateRoutes) {
    candidates.push('DIVERT');
  }

  // 7. SEEK_SHELTER is candidate when severe hazards (landslide, flood, storm) threaten open road
  const hasSevereThreat = activeHazards.some(
    h => (h.type === 'LANDSLIDE' || h.type === 'FLOOD' || h.type === 'ROCKFALL') && h.severity >= 0.6
  );
  if (hasSevereThreat || graph.safeLocations.some(s => s.type === 'SHELTER')) {
    candidates.push('SEEK_SHELTER');
  }

  // 8. CONTACT_HELP is candidate when traveler is in critical trapped state or severe risk
  const isCriticalBlockage = roadStates.some(r => r.state === 'BLOCKED' && r.segmentId === traveler.currentSegmentId);
  const isCriticalSeverity = activeHazards.some(h => h.severity >= 0.85 && h.confidence >= 0.7);
  if (isCriticalBlockage || isCriticalSeverity) {
    candidates.push('CONTACT_HELP');
  }

  return Array.from(new Set(candidates));
}
