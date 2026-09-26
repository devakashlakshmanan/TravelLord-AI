import { HazardState, TravelerState, RouteGraph } from './actionTypes';

export interface DecisionWindowResult {
  minutes: number;
  description: string;
  isUrgent: boolean;
  controllingFactor: string;
}

/**
 * Calculates the operational Decision Window before critical hazard transition occurs.
 * Does not present false precision: clearly states estimates and confidence basis.
 */
export function calculateDecisionWindow(
  traveler: TravelerState,
  hazards: HazardState[],
  graph: RouteGraph
): DecisionWindowResult {
  if (hazards.length === 0) {
    return {
      minutes: 30,
      description: 'Reassess in approximately 30 minutes under nominal corridor conditions.',
      isUrgent: false,
      controllingFactor: 'Nominal monitoring cadence',
    };
  }

  // Find most severe active hazard
  const primaryHazard = hazards.reduce((prev, curr) => (curr.severity > prev.severity ? curr : prev), hazards[0]);

  // If landslide is rising rapidly
  if (primaryHazard.type === 'LANDSLIDE' && primaryHazard.trend === 'rising') {
    const estimatedDeteriorationMinutes = primaryHazard.severity >= 0.8 ? 10 : 15;
    return {
      minutes: estimatedDeteriorationMinutes,
      description: `Reassess in approximately ${estimatedDeteriorationMinutes} minutes. Rapid slope saturation is deteriorating the route.`,
      isUrgent: true,
      controllingFactor: `Rising ${primaryHazard.type} severity (${(primaryHazard.severity * 100).toFixed(0)}%)`,
    };
  }

  // If wildlife herd movement is active
  if (primaryHazard.type === 'WILDLIFE') {
    const durationMinutes = primaryHazard.trend === 'falling' ? 12 : 20;
    return {
      minutes: durationMinutes,
      description: `Reassess in approximately ${durationMinutes} minutes. Forest wildlife herd crossing typically takes 15–20 minutes to clear.`,
      isUrgent: false,
      controllingFactor: 'Wildlife crossing window',
    };
  }

  // If road closure with clearing operations
  if (primaryHazard.type === 'ROAD_CLOSURE') {
    return {
      minutes: 20,
      description: 'Reassess in approximately 20 minutes for updated PWD / Traffic Police clearance bulletin.',
      isUrgent: false,
      controllingFactor: 'Clearance bulletin cadence',
    };
  }

  // If heavy rainfall
  if (primaryHazard.type === 'HEAVY_RAIN' || primaryHazard.type === 'FLOOD') {
    return {
      minutes: 15,
      description: 'Reassess in approximately 15 minutes as rainfall telemetry and runoff evolve.',
      isUrgent: primaryHazard.severity >= 0.7,
      controllingFactor: 'Rainfall runoff model',
    };
  }

  return {
    minutes: 20,
    description: 'Reassess in approximately 20 minutes based on updated sensor readings.',
    isUrgent: false,
    controllingFactor: 'Standard monitoring interval',
  };
}
