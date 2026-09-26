/**
 * Hazard State Adapter
 * Converts raw Supabase database records (hazard_segments, crowd_verifications)
 * into normalized HazardState[] and RoadState[] structures for the Protective Action Resolution Engine.
 *
 * OWNERSHIP PRINCIPLE:
 * This module is solely responsible for data adaptation, recency decay, and crowd weighting.
 * 100% of the actual action decision logic is owned by actionResolutionEngine.ts.
 */

import { HazardSegment, CrowdVerification, SegmentEvaluation, DecisionResult } from './types';
import { resolveProtectiveAction } from './actionResolution/actionResolutionEngine';
import { HazardState, RoadState, HazardType, HazardTrend } from './actionResolution/actionTypes';

/**
 * Calculates temporal recency decay factor (1.0 to 0.0) based on last updated timestamp.
 * - <= 30 mins: 1.0 (Fresh)
 * - 30 to 210 mins: Linear decay to 0.0
 * - > 210 mins: 0.0 (Stale)
 */
export function calculateSegmentRecency(lastUpdatedIso: string): number {
  const lastUpdated = new Date(lastUpdatedIso).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.max(0, (now - lastUpdated) / (1000 * 60));

  if (elapsedMinutes <= 30) {
    return 1.0;
  } else if (elapsedMinutes <= 210) {
    return Math.max(0, 1.0 - (elapsedMinutes - 30) / 180);
  } else {
    return 0.0;
  }
}

/**
 * Evaluates individual segment telemetry, incorporating crowd reports and recency decay.
 */
export function evaluateSegment(
  segment: HazardSegment,
  crowdVerifications: CrowdVerification[]
): SegmentEvaluation {
  // 1. Crowd verification adjustment: last 2 hours
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  const recentTaps = crowdVerifications.filter(cv => {
    return cv.segment_id === segment.segment_id && new Date(cv.created_at).getTime() >= twoHoursAgo;
  });

  let adjustment = 0;
  for (const tap of recentTaps) {
    if (tap.status === 'still_blocked') {
      adjustment += 0.05;
    } else if (tap.status === 'cleared') {
      adjustment -= 0.05;
    }
  }

  // Cap total adjustment at +0.2 and -0.2
  const cappedAdjustment = Math.max(-0.2, Math.min(0.2, adjustment));

  // source_agreement = base_confidence + cappedAdjustment
  const source_agreement = Math.max(0, Math.min(1, segment.base_confidence + cappedAdjustment));

  // data_recency
  const data_recency = calculateSegmentRecency(segment.last_updated);

  // historical_reliability baseline
  const historical_reliability = 0.7;

  // Confidence formula: (source_agreement * 0.4) + (data_recency * 0.3) + (historical_reliability * 0.3)
  const rawConfidence = (source_agreement * 0.4) + (data_recency * 0.3) + (historical_reliability * 0.3);
  const confidence = Math.max(0, Math.min(1, Number(rawConfidence.toFixed(4))));

  // Trend multiplier
  let trend_multiplier = 1.0;
  if (segment.trend === 'rising') {
    trend_multiplier = 1.2;
  } else if (segment.trend === 'falling') {
    trend_multiplier = 0.8;
  }

  // Risk score formula: severity * (0.5 + 0.5 * confidence) * trend_multiplier
  const rawRiskScore = segment.severity * (0.5 + 0.5 * confidence) * trend_multiplier;
  const risk_score = Math.max(0, Math.min(1, Number(rawRiskScore.toFixed(4))));

  // Candidate action candidate label for this isolated segment
  let action_candidate = 'Continue';
  if (confidence < 0.4) {
    action_candidate = 'INSUFFICIENT_DATA';
  } else if (confidence < 0.75) {
    action_candidate = 'ELEVATED_CAUTION';
  } else if (risk_score >= 0.7) {
    action_candidate = 'Turn Back / Divert';
  } else if (risk_score >= 0.5) {
    action_candidate = 'Wait';
  } else if (risk_score >= 0.3) {
    action_candidate = 'Slow Down';
  } else {
    action_candidate = 'Continue';
  }

  return {
    segment_id: segment.segment_id,
    name: segment.name,
    hazard_type: segment.hazard_type,
    source: segment.source,
    severity: segment.severity,
    base_confidence: segment.base_confidence,
    trend: segment.trend,
    source_agreement: Number(source_agreement.toFixed(4)),
    data_recency: Number(data_recency.toFixed(4)),
    historical_reliability,
    confidence,
    risk_score,
    action_candidate,
  };
}

/**
 * Resolves full route protective action across all corridor segments.
 * UNIFIED ARCHITECTURE:
 * Evaluates individual segments -> converts to normalized HazardState[] & RoadState[]
 * -> passes 100% of decision authority to resolveProtectiveAction().
 */
export function resolveRouteAction(
  evaluations: SegmentEvaluation[]
): DecisionResult {
  if (!evaluations || evaluations.length === 0) {
    throw new Error('Cannot resolve action for empty route segment list.');
  }

  // 1. Identify controlling segment by highest risk/severity
  let controlling = evaluations[0];
  for (let i = 1; i < evaluations.length; i++) {
    if (evaluations[i].risk_score > controlling.risk_score) {
      controlling = evaluations[i];
    } else if (evaluations[i].risk_score === controlling.risk_score && evaluations[i].severity > controlling.severity) {
      controlling = evaluations[i];
    }
  }

  // 2. Map segment evaluations into normalized HazardStates
  const hazardStates: HazardState[] = evaluations
    .filter(e => e.risk_score >= 0.2 || e.severity >= 0.2)
    .map(e => ({
      id: `H_${e.segment_id}`,
      type: (e.hazard_type.toUpperCase().replace(/\s+/g, '_') as HazardType) || 'OTHER',
      location: { lat: 11.5, lng: 76.1, name: e.name },
      affectedSegments: [e.segment_id],
      severity: e.severity,
      confidence: e.confidence,
      trend: (e.trend as HazardTrend) || 'stable',
      source: e.source,
      sourceType: e.source.includes('Modeled') ? 'MODELED' : e.source.includes('Simulated') ? 'SIMULATED' : 'AUTHORITATIVE',
      lastUpdated: new Date().toISOString(),
    }));

  // 3. Map road states
  const roadStates: RoadState[] = evaluations.map(e => ({
    segmentId: e.segment_id,
    name: e.name,
    state: e.risk_score >= 0.85 ? 'BLOCKED' : e.risk_score >= 0.5 ? 'RESTRICTED' : 'OPEN',
    source: e.source,
    sourceType: 'MODELED',
    confidence: e.confidence,
    lastUpdated: new Date().toISOString(),
  }));

  // 4. Resolve action through the Unified Action Resolution Engine
  const actionRes = resolveProtectiveAction({
    corridorType: 'WAYANAD_NH766',
    baseConfidence: controlling.confidence,
    hazards: hazardStates,
    roadStates,
    travelerState: {
      currentSegmentId: controlling.segment_id,
    },
  });

  const valid_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  // FIX-1: action is strictly derived from actionRes.action (NO independent recomputation)
  return {
    action: actionRes.action,
    risk_score: actionRes.riskScore,
    confidence: actionRes.confidence,
    controlling_segment: controlling,
    segment_scores: evaluations,
    valid_until,
    actionTitle: actionRes.actionTitle,
    decisionWindowMinutes: actionRes.decisionWindowMinutes,
    decisionWindowDescription: actionRes.decisionWindowDescription,
    reasons: actionRes.reasons,
    rejectedActions: actionRes.rejectedActions.map(r => ({
      action: r.action,
      reason: r.reason,
      conflictHazard: r.conflictHazard,
      secondaryRisk: r.secondaryRisk,
    })),
    recoverability: actionRes.recoverability,
    activeHazardsCount: hazardStates.length,
    recommendationSummary: actionRes.recommendationSummary,
  };
}
