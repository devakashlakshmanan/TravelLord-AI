import { HazardSegment, CrowdVerification, SegmentEvaluation, DecisionResult, SafetyAction } from './types';

/**
 * Pure deterministic safety engine for TravelLord AI NH-766 Wayanad Corridor.
 * CRITICAL RULE: ZERO AI / LLM INVOLVEMENT.
 * Pure deterministic math and rule-based decision gates.
 */

export function calculateSegmentRecency(lastUpdatedIso: string): number {
  const lastUpdated = new Date(lastUpdatedIso).getTime();
  const now = Date.now();
  const elapsedMinutes = Math.max(0, (now - lastUpdated) / (1000 * 60));

  if (elapsedMinutes <= 30) {
    return 1.0;
  } else if (elapsedMinutes <= 210) {
    // Linearly decays to 0.0 over the next 3 hours (180 minutes)
    return Math.max(0, 1.0 - (elapsedMinutes - 30) / 180);
  } else {
    return 0.0;
  }
}

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

  // historical_reliability: hardcode 0.7 for all segments
  // Note: this is a placeholder until real historical accuracy data exists per MVP specifications
  const historical_reliability = 0.7;

  // confidence formula: (source_agreement * 0.4) + (data_recency * 0.3) + (historical_reliability * 0.3)
  const rawConfidence = (source_agreement * 0.4) + (data_recency * 0.3) + (historical_reliability * 0.3);
  const confidence = Math.max(0, Math.min(1, Number(rawConfidence.toFixed(4))));

  // trend multiplier
  let trend_multiplier = 1.0;
  if (segment.trend === 'rising') {
    trend_multiplier = 1.2;
  } else if (segment.trend === 'falling') {
    trend_multiplier = 0.8;
  }

  // risk_score = severity * (0.5 + 0.5 * confidence) * trend_multiplier
  const rawRiskScore = segment.severity * (0.5 + 0.5 * confidence) * trend_multiplier;
  const risk_score = Math.max(0, Math.min(1, Number(rawRiskScore.toFixed(4))));

  // Candidate action for this individual segment
  let action_candidate = 'Continue';
  if (confidence >= 0.75) {
    if (risk_score >= 0.7) action_candidate = 'Turn Back / Divert';
    else if (risk_score >= 0.5) action_candidate = 'Wait';
    else if (risk_score >= 0.3) action_candidate = 'Slow Down';
    else action_candidate = 'Continue';
  } else if (confidence >= 0.4) {
    action_candidate = 'ELEVATED_CAUTION';
  } else {
    action_candidate = 'INSUFFICIENT_DATA';
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

export function resolveRouteAction(
  evaluations: SegmentEvaluation[]
): DecisionResult {
  if (!evaluations || evaluations.length === 0) {
    throw new Error('Cannot resolve action for empty route segment list.');
  }

  // Identify the single highest-risk_score segment along the route as the "controlling segment"
  let controlling = evaluations[0];
  for (let i = 1; i < evaluations.length; i++) {
    if (evaluations[i].risk_score > controlling.risk_score) {
      controlling = evaluations[i];
    } else if (evaluations[i].risk_score === controlling.risk_score && evaluations[i].severity > controlling.severity) {
      controlling = evaluations[i];
    }
  }

  // Apply exact decision gate to the controlling segment
  let action: SafetyAction;
  if (controlling.confidence >= 0.75) {
    if (controlling.risk_score >= 0.7) {
      action = 'Turn Back / Divert';
    } else if (controlling.risk_score >= 0.5) {
      action = 'Wait';
    } else if (controlling.risk_score >= 0.3) {
      action = 'Slow Down';
    } else {
      action = 'Continue';
    }
  } else if (controlling.confidence >= 0.4) {
    action = 'ELEVATED_CAUTION';
  } else {
    action = 'INSUFFICIENT_DATA';
  }

  // Valid until timestamp (now + 30 minutes for MVP)
  const valid_until = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  return {
    action,
    risk_score: controlling.risk_score,
    confidence: controlling.confidence,
    controlling_segment: controlling,
    segment_scores: evaluations,
    valid_until,
  };
}
