import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSegmentsBetween } from '@/lib/engine/corridor';
import { evaluateSegment, resolveRouteAction } from '@/lib/engine/safetyEngine';
import { HazardSegment, CrowdVerification, SegmentEvaluation } from '@/lib/engine/types';

/**
 * /api/resolve-action
 * 
 * Safety Critical Deterministic Decision Engine
 * ZERO AI / LLM calls here.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let segmentIds: string[] = [];

    if (Array.isArray(body.segment_ids) && body.segment_ids.length > 0) {
      segmentIds = body.segment_ids;
    } else if (body.source && body.destination) {
      segmentIds = getSegmentsBetween(body.source, body.destination);
    } else {
      return NextResponse.json(
        { error: 'Invalid request: please provide segment_ids array or source and destination.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch hazard segments in route order
    const { data: segmentsData, error: segError } = await supabase
      .from('hazard_segments')
      .select('*')
      .in('segment_id', segmentIds);

    if (segError || !segmentsData) {
      return NextResponse.json(
        { error: `Failed to fetch corridor hazard segments: ${segError?.message}` },
        { status: 500 }
      );
    }

    // Preserve route order and apply any test simulation overrides if provided
    const segmentMap = new Map<string, HazardSegment>();
    for (const rawSeg of segmentsData) {
      let seg = rawSeg as HazardSegment;
      if (body.segment_overrides && body.segment_overrides[seg.segment_id]) {
        seg = { ...seg, ...body.segment_overrides[seg.segment_id] };
      }
      segmentMap.set(seg.segment_id, seg);
    }

    const orderedSegments: HazardSegment[] = [];
    for (const id of segmentIds) {
      const seg = segmentMap.get(id);
      if (seg) orderedSegments.push(seg);
    }

    if (orderedSegments.length === 0) {
      return NextResponse.json(
        { error: 'No matching hazard segments found along the specified route.' },
        { status: 404 }
      );
    }

    // 2. Fetch crowd verifications from the last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: verificationsData, error: verError } = await supabase
      .from('crowd_verifications')
      .select('*')
      .in('segment_id', segmentIds)
      .gte('created_at', twoHoursAgo);

    const crowdVerifications: CrowdVerification[] = (verificationsData || []) as CrowdVerification[];

    // 3. Evaluate each segment using deterministic formulas
    const evaluations: SegmentEvaluation[] = orderedSegments.map(segment => 
      evaluateSegment(segment, crowdVerifications)
    );

    // 4. Resolve controlling segment and action via decision gate
    const decision = resolveRouteAction(evaluations);

    return NextResponse.json(decision);
  } catch (error: any) {
    console.error('Error in /api/resolve-action:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error resolving safety action.' },
      { status: 500 }
    );
  }
}
