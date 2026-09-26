import { HazardState, RoadState, RouteGraph, TravelerState } from './actionTypes';

export interface RouteHazardProfile {
  routeRole: 'MAIN_ROUTE' | 'ALTERNATE_A' | 'ALTERNATE_B' | 'RETURN_PATH';
  routeName: string;
  isPassable: boolean;
  maxHazardSeverity: number;
  hazards: HazardState[];
  roadState: RoadState | undefined;
  conflictNotes: string[];
}

export interface MultiHazardConflictAnalysis {
  hasCrossRouteConflict: boolean;
  mainRouteCompromised: boolean;
  alternateACompromised: boolean;
  alternateBCompromised: boolean;
  safeZoneViable: boolean;
  routeProfiles: RouteHazardProfile[];
  conflictSummary: string;
}

/**
 * Multi-Hazard Conflict Resolver
 * Detects interacting threats across the road graph to prevent diverting the traveler into secondary traps.
 */
export function analyzeRouteConflicts(
  traveler: TravelerState,
  hazards: HazardState[],
  roadStates: RoadState[],
  graph: RouteGraph
): MultiHazardConflictAnalysis {
  const routeProfiles: RouteHazardProfile[] = graph.edges.map(edge => {
    // Find road state for edge
    const rState = roadStates.find(r => r.segmentId === edge.roadState.segmentId) || edge.roadState;

    // Hazards matching this edge
    const edgeHazards = hazards.filter(h => 
      h.affectedSegments.includes(edge.fromSegmentId) ||
      h.affectedSegments.includes(edge.toSegmentId) ||
      h.affectedSegments.includes(edge.roadState.segmentId) ||
      (edge.routeRole === 'ALTERNATE_A' && h.type === 'WILDLIFE') ||
      (edge.routeRole === 'ALTERNATE_B' && h.type === 'ROAD_CLOSURE') ||
      (edge.routeRole === 'MAIN_ROUTE' && (h.type === 'LANDSLIDE' || h.type === 'HEAVY_RAIN' || h.type === 'FLOOD'))
    );

    const isBlocked = rState?.state === 'BLOCKED';
    const hasHighHazard = edgeHazards.some(h => h.severity >= 0.55 && h.confidence >= 0.6);
    const maxSeverity = edgeHazards.reduce((max, h) => Math.max(max, h.severity), 0);

    const conflictNotes: string[] = [];
    if (isBlocked) {
      conflictNotes.push(`Road is physically blocked (${rState?.source || 'advisory'})`);
    }
    edgeHazards.forEach(h => {
      if (h.severity >= 0.4) {
        conflictNotes.push(`Active ${h.type} hazard (Severity: ${(h.severity * 100).toFixed(0)}%, Trend: ${h.trend})`);
      }
    });

    return {
      routeRole: edge.routeRole,
      routeName: edge.name,
      isPassable: !isBlocked && !hasHighHazard,
      maxHazardSeverity: maxSeverity,
      hazards: edgeHazards,
      roadState: rState,
      conflictNotes,
    };
  });

  const mainProfile = routeProfiles.find(p => p.routeRole === 'MAIN_ROUTE');
  const altAProfile = routeProfiles.find(p => p.routeRole === 'ALTERNATE_A');
  const altBProfile = routeProfiles.find(p => p.routeRole === 'ALTERNATE_B');

  const mainRouteCompromised = mainProfile ? !mainProfile.isPassable : false;
  const alternateACompromised = altAProfile ? !altAProfile.isPassable : false;
  const alternateBCompromised = altBProfile ? !altBProfile.isPassable : false;

  const safeZoneViable = graph.safeLocations.some(s => s.capacityStatus === 'AVAILABLE');

  const hasCrossRouteConflict = 
    (mainRouteCompromised && (alternateACompromised || alternateBCompromised));

  let conflictSummary = 'Nominal corridor routing. No conflicting secondary hazard traps detected.';
  if (mainRouteCompromised && alternateACompromised && alternateBCompromised) {
    conflictSummary = 'CRITICAL MULTI-HAZARD CONFLICT: Main route has active geotechnical hazard, Alternate A has wildlife movement, and Alternate B is closed. All moving routes are compromised.';
  } else if (mainRouteCompromised && alternateACompromised) {
    conflictSummary = 'MULTI-HAZARD CONFLICT: Main route is restricted by geotechnical risk and primary detour (Alternate A) intersects active wildlife movement.';
  } else if (mainRouteCompromised && alternateBCompromised) {
    conflictSummary = 'DETOUR CONFLICT: Main route is restricted and secondary detour (Alternate B) is blocked.';
  }

  return {
    hasCrossRouteConflict,
    mainRouteCompromised,
    alternateACompromised,
    alternateBCompromised,
    safeZoneViable,
    routeProfiles,
    conflictSummary,
  };
}
