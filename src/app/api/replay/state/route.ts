import { NextRequest, NextResponse } from 'next/server';
import { buildReplaySnapshot, REPLAY_TIMESTAMPS, PRECOMPUTED_REPLAY } from '@/lib/replay/syntheticReplay';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timestampParam = searchParams.get('timestamp');

    let timestamp = timestampParam || REPLAY_TIMESTAMPS[0];
    if (!REPLAY_TIMESTAMPS.includes(timestamp)) {
      // Find matching time string like '18:00' or '06:00'
      const matched = REPLAY_TIMESTAMPS.find(t => t.includes(timestamp));
      if (matched) {
        timestamp = matched;
      } else {
        timestamp = REPLAY_TIMESTAMPS[0];
      }
    }

    const snapshot = buildReplaySnapshot(timestamp);

    return NextResponse.json({
      success: true,
      replayTimestamp: snapshot.timestamp,
      timeLabel: snapshot.timeLabel,
      timelineIndex: snapshot.timelineIndex,
      totalTimestamps: snapshot.totalTimestamps,
      segments: snapshot.segments,
      segmentList: snapshot.segmentList,
      controllingSegment: snapshot.controllingSegment,
      corridorRisk: snapshot.corridorRisk,
      corridorConfidence: snapshot.corridorConfidence,
      corridorTrend: snapshot.corridorTrend,
      primaryHazard: snapshot.primaryHazard,
      roadStateSummary: snapshot.roadStateSummary,
      normalizedHazardState: snapshot.normalizedHazardState,
      roadStates: snapshot.roadStates,
      decisionResult: {
        action: snapshot.decisionResult.action,
        actionTitle: snapshot.decisionResult.actionTitle,
        riskScore: snapshot.decisionResult.riskScore,
        confidence: snapshot.decisionResult.confidence,
        decisionWindowMinutes: snapshot.decisionResult.decisionWindowMinutes,
        decisionWindowDescription: snapshot.decisionResult.decisionWindowDescription,
        reasons: snapshot.decisionResult.reasons,
        rejectedActions: snapshot.decisionResult.rejectedActions,
        recoverability: snapshot.decisionResult.recoverability,
        candidateEvaluations: snapshot.decisionResult.candidateEvaluations,
        recommendationSummary: snapshot.decisionResult.recommendationSummary,
      },
      provenance: snapshot.provenance,
      allAvailableTimestamps: REPLAY_TIMESTAMPS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate replay state' },
      { status: 500 }
    );
  }
}
