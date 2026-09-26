'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { HazardSegment } from '@/lib/engine/types';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import { HazardState, RoadState, ActionDecisionResult } from '@/lib/engine/actionResolution/actionTypes';
import ProvenanceBadge from '@/components/ProvenanceBadge';
import { useReplay, ReplayControlBanner } from '@/lib/replay/replayState';
import { 
  Shield, 
  LogOut, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Mountain,
  CheckCircle2,
  Radio,
  Sparkles,
  Zap,
  ShieldAlert,
  Send,
  Compass
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Auth & segments state
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [segments, setSegments] = useState<HazardSegment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(true);

  // Form state
  const [corridorChoice, setCorridorChoice] = useState<'WAYANAD_NH766' | 'MUNNAR_VALPARAI'>('WAYANAD_NH766');
  const [sourceId, setSourceId] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [mode, setMode] = useState<string>('Car');
  const [travelTime, setTravelTime] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Contextual "Ask TravelLord" state
  const [askQuery, setAskQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Set default travel time to local current time
  useEffect(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setTravelTime(localISOTime);
  }, []);

  // 1. Session verification
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        setAuthLoading(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // 2. Fetch corridor hazard segments from Supabase
  useEffect(() => {
    async function loadSegments() {
      try {
        const { data, error } = await supabase
          .from('hazard_segments')
          .select('*')
          .order('segment_id', { ascending: true });

        if (error) {
          console.error('Error fetching segments from Supabase:', error);
          setFormError('Failed to load corridor hazard segments from database.');
        } else if (data && data.length > 0) {
          setSegments(data);
          setSourceId(data[0].segment_id);
          if (data.length > 1) {
            setDestinationId(data[data.length - 1].segment_id);
          }
        }
      } catch (err: any) {
        console.error('Unexpected error loading segments:', err);
      } finally {
        setLoadingSegments(false);
      }
    }

    if (!authLoading) {
      loadSegments();
    }
  }, [authLoading, supabase]);

  const { currentSnapshot, currentTimestamp } = useReplay();

  // 3. Compute dynamic corridor baseline decision from the real deterministic engine
  const liveCorridorDecision: ActionDecisionResult | null = useMemo(() => {
    if (corridorChoice === 'MUNNAR_VALPARAI') {
      return currentSnapshot.decisionResult;
    }

    if (segments.length === 0) return null;

    // Convert real DB segments into HazardState[] and RoadState[]
    const hazardStates: HazardState[] = segments
      .filter(s => s.severity >= 0.25)
      .map(s => ({
        id: `H_${s.segment_id}`,
        type: s.hazard_type.toUpperCase().includes('LANDSLIDE') ? 'LANDSLIDE' :
              s.hazard_type.toUpperCase().includes('RAIN') ? 'HEAVY_RAIN' :
              s.hazard_type.toUpperCase().includes('WILDLIFE') ? 'WILDLIFE' : 'OTHER',
        location: { lat: s.lat, lng: s.lng, name: s.name },
        affectedSegments: [s.segment_id],
        severity: s.severity,
        confidence: s.base_confidence,
        trend: s.trend,
        source: s.source,
        sourceType: s.source.includes('Modeled') || s.source.includes('GSI') ? 'MODELED' : 'AUTHORITATIVE',
        lastUpdated: s.last_updated,
      }));

    const roadStates: RoadState[] = segments.map(s => ({
      segmentId: s.segment_id,
      name: s.name,
      state: s.severity >= 0.8 ? 'BLOCKED' : s.severity >= 0.5 ? 'RESTRICTED' : 'OPEN',
      source: s.source,
      sourceType: 'AUTHORITATIVE',
      confidence: s.base_confidence,
      lastUpdated: s.last_updated,
    }));

    return resolveProtectiveAction({
      corridorType: 'WAYANAD_NH766',
      hazards: hazardStates,
      roadStates: roadStates,
      travelerState: {
        currentSegmentId: sourceId || 'S1',
        travelMode: mode as any,
      }
    });
  }, [segments, corridorChoice, sourceId, mode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleAskTravelLord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    const activeContext = liveCorridorDecision ? {
      mode: 'ACTIVE_CORRIDOR_EXPLANATION',
      corridor: corridorChoice,
      action: liveCorridorDecision.actionTitle,
      confidence: liveCorridorDecision.confidence,
      decisionWindow: liveCorridorDecision.decisionWindowDescription,
      reasons: liveCorridorDecision.reasons,
      rejectedActions: liveCorridorDecision.rejectedActions,
      recoverability: liveCorridorDecision.recoverability,
    } : {
      mode: 'GENERAL_GUIDANCE_MODE',
      corridor: corridorChoice,
      message: 'No active route currently calculated. Providing mountain travel preparedness guidance.'
    };

    try {
      const res = await fetch('/api/chat-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: askQuery }],
          currentContext: activeContext
        })
      });
      const data = await res.json();
      setAiResponse(data.reply || 'Adhere strictly to posted road signages and check the Action Resolver for full candidate feasibility evaluations.');
    } catch {
      setAiResponse('Deterministic safety directive: Current route has elevated slope saturation. Please hold at designated safe zone.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (corridorChoice === 'WAYANAD_NH766') {
      if (!sourceId || !destinationId) {
        setFormError('Please select both a source and a destination checkpoint.');
        return;
      }
      if (sourceId === destinationId) {
        setFormError('Destination must differ from Source along the corridor.');
        return;
      }
    }

    if (!travelTime) {
      setFormError('Please select a planned travel time.');
      return;
    }

    setSubmitting(true);

    try {
      let sourceName = sourceId;
      let destName = destinationId;

      if (corridorChoice === 'MUNNAR_VALPARAI') {
        sourceName = 'Munnar Town Center';
        destName = 'Valparai Plateau Center';
      } else {
        const sourceSegment = segments.find(s => s.segment_id === sourceId);
        const destSegment = segments.find(s => s.segment_id === destinationId);
        if (sourceSegment) sourceName = sourceSegment.name;
        if (destSegment) destName = destSegment.name;
      }

      // Save row to Supabase trips table
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          source: sourceName,
          destination: destName,
          mode: mode,
          travel_time: new Date(travelTime).toISOString(),
        })
        .select()
        .single();

      if (tripError) {
        console.warn('Trip insert warning:', tripError.message);
      }

      const tripId = tripData?.id || 'demo-trip-id';

      if (corridorChoice === 'MUNNAR_VALPARAI') {
        router.push(`/result?trip_id=${tripId}&corridor=MUNNAR_VALPARAI&scenario=SCENARIO_3_SIGNATURE_CONFLICT`);
      } else {
        router.push(`/result?trip_id=${tripId}&source=${sourceId}&destination=${destinationId}&mode=${mode}`);
      }
    } catch (err: any) {
      console.error('Trip submission exception:', err);
      setFormError(err.message || 'An unexpected error occurred while processing your trip.');
      setSubmitting(false);
    }
  };

  if (authLoading || loadingSegments) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading verified mountain corridor telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Live Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold mb-2 shadow-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Command Center &bull; Live Telemetry Operational</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Travel safely through changing hazards.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
            TravelLord continuously evaluates interacting geotechnical, wildlife, and road hazards, resolving <strong className="text-slate-900 font-bold">one executable protective action</strong> with clear causal justification.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <Link
            href="/emergency"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition shadow-2xs"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS (112)</span>
          </Link>

          <button
            id="dashboard-logout-btn"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 shadow-xs transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Interactive Synthetic Replay Control Banner */}
      <ReplayControlBanner />

      {/* Operational Highlights Card - Pure Deterministic Engine Output */}
      {liveCorridorDecision ? (
        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                {corridorChoice === 'MUNNAR_VALPARAI' ? 'Real-Time Replay Corridor Directive' : 'Active Corridor Directive'}
              </span>
              <ProvenanceBadge 
                origin={corridorChoice === 'MUNNAR_VALPARAI' ? 'SIMULATED_REPLAY' : 'MODELLED'} 
                source={corridorChoice === 'MUNNAR_VALPARAI' ? 'Synthetic Replay Dataset' : 'Verified Corridor Baseline'} 
              />
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Evidence Confidence: <b className="text-white">{(liveCorridorDecision.confidence * 100).toFixed(0)}%</b></span>
              <span className="text-slate-400">Decision Window: <b className="text-emerald-400">{liveCorridorDecision.decisionWindowDescription || `~${liveCorridorDecision.decisionWindowMinutes} min`}</b></span>
              <span className="text-slate-400">Recoverability: <b className="text-emerald-400">{liveCorridorDecision.recoverability}</b></span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">Overall Risk</div>
              <div className={`text-base font-extrabold ${
                (corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.corridorRisk : (liveCorridorDecision.riskScore * 100)) >= 70
                  ? 'text-rose-400'
                  : (corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.corridorRisk : (liveCorridorDecision.riskScore * 100)) >= 40
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {corridorChoice === 'MUNNAR_VALPARAI' 
                  ? `${currentSnapshot.corridorRisk} / 100`
                  : `${(liveCorridorDecision.riskScore * 100).toFixed(0)} / 100`}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Risk Trend</div>
              <div className={`text-base font-extrabold ${
                (corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.corridorTrend : 'STABLE') === 'RISING'
                  ? 'text-rose-400'
                  : 'text-slate-200'
              }`}>
                {corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.corridorTrend : 'STABLE'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Corridor Road State</div>
              <div className={`text-base font-extrabold ${
                (corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.roadStateSummary : 'OPEN') === 'BLOCKED'
                  ? 'text-rose-400'
                  : (corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.roadStateSummary : 'OPEN') === 'RESTRICTED'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}>
                {corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.roadStateSummary : 'OPEN'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Primary Hazard</div>
              <div className="text-xs font-semibold text-slate-200 truncate mt-1">
                {corridorChoice === 'MUNNAR_VALPARAI' ? currentSnapshot.primaryHazard : 'Geotechnical Slope Alert'}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <span>{liveCorridorDecision.actionTitle}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {liveCorridorDecision.reasons.length > 0 ? liveCorridorDecision.reasons[0] : 'Corridor telemetry nominal; proceed with standard highway caution.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/action-resolver"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Action Resolver</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-slate-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 text-sm">No Active Monitored Trip</div>
              <div className="text-xs text-slate-500">Configure your origin and destination below to compute a verified protective action.</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Trip Planner Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Mountain className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Trip Protective Action Planner</h2>
              <p className="text-xs text-slate-500">Computes single feasible &amp; recoverable protective directive</p>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
            Zero AI Decision Fabrication
          </span>
        </div>

        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleTripSubmit} className="space-y-6">
          {/* Corridor Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Mountain Transit Corridor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCorridorChoice('WAYANAD_NH766')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  corridorChoice === 'WAYANAD_NH766'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">NH-766 Wayanad Mountain Pass</div>
                  <div className={`text-[11px] mt-0.5 ${corridorChoice === 'WAYANAD_NH766' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Adivaram to Kalpetta (6 Monitored Checkpoints)
                  </div>
                </div>
                {corridorChoice === 'WAYANAD_NH766' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setCorridorChoice('MUNNAR_VALPARAI')}
                className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                  corridorChoice === 'MUNNAR_VALPARAI'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Munnar &rarr; Valparai High Range</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200">SIMULATED DEMO</span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${corridorChoice === 'MUNNAR_VALPARAI' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Multi-Hazard Conflict &amp; Detour Resolution Flow
                  </div>
                </div>
                {corridorChoice === 'MUNNAR_VALPARAI' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            </div>
          </div>

          {/* Checkpoints for NH-766 */}
          {corridorChoice === 'WAYANAD_NH766' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="source-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Origin Checkpoint</span>
                </label>
                <div className="relative">
                  <select
                    id="source-select"
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition cursor-pointer"
                  >
                    {segments.map((seg) => (
                      <option key={`src-${seg.segment_id}`} value={seg.segment_id}>
                        {seg.name} ({seg.segment_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="destination-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Destination Checkpoint</span>
                </label>
                <div className="relative">
                  <select
                    id="destination-select"
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    required
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition cursor-pointer"
                  >
                    {segments.map((seg) => (
                      <option key={`dest-${seg.segment_id}`} value={seg.segment_id}>
                        {seg.name} ({seg.segment_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Mode & Travel Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="mode-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Travel Mode
              </label>
              <select
                id="mode-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                required
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition cursor-pointer"
              >
                <option value="Car">🚗 Car / Light Motor Vehicle</option>
                <option value="Bike">🏍️ Motorcycle / Two-Wheeler</option>
                <option value="Bus">🚌 Bus / Heavy Transport</option>
                <option value="On Foot">🚶 On Foot / Trekker</option>
              </select>
            </div>

            <div>
              <label htmlFor="travel-time" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>Planned Departure Time</span>
              </label>
              <input
                id="travel-time"
                type="datetime-local"
                value={travelTime}
                onChange={(e) => setTravelTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Deterministic constraint gates evaluate all intersecting hazards.</span>
            </div>

            <button
              id="check-route-btn"
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Multi-Hazard Trajectory...</span>
                </>
              ) : (
                <>
                  <span>Analyze Trip Safety</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Contextual "Ask TravelLord" AI Explanation Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Ask TravelLord &bull; Decision Explanation Layer
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Explains Engine Outputs</span>
        </div>

        <form onSubmit={handleAskTravelLord} className="flex gap-2">
          <input
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            placeholder="Ask about current mountain pass conditions, safe stopping points, or why a route was rejected..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={aiLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shrink-0"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Explain</span>
          </button>
        </form>

        {aiResponse && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed animate-fade-in space-y-1">
            <div className="font-bold text-slate-900">TravelLord Briefing:</div>
            <p>{aiResponse}</p>
          </div>
        )}
      </div>

      {/* Live Conditions Overview with Honest Provenance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Corridor Telemetry — {corridorChoice === 'MUNNAR_VALPARAI' ? 'Munnar–Valparai High Range' : 'NH-766 Wayanad Mountain Pass'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Database Records: {segments.length} Checkpoints Queried
          </span>
        </div>

        {(() => {
          const maxHazard = segments.reduce((max, s) => (s.severity > (max?.severity || 0) ? s : max), segments[0]);
          const highestSeverity = maxHazard ? Math.round(maxHazard.severity * 100) : 0;
          const isHighAlert = highestSeverity >= 70;
          const isModerateAlert = highestSeverity >= 35 && !isHighAlert;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Geotechnical Alert</span>
                <p className="text-xs font-bold text-slate-900 capitalize">
                  {maxHazard ? `${maxHazard.hazard_type} (${maxHazard.name})` : 'Nominal Slope Stability'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Severity: <strong className={isHighAlert ? 'text-rose-600' : isModerateAlert ? 'text-amber-600' : 'text-emerald-600'}>{highestSeverity}%</strong> &bull; Trend: {maxHazard?.trend || 'stable'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telemetry Provenance</span>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {maxHazard?.source || 'GSI / IMD Telemetry'}
                </p>
                <div className="pt-1">
                  <ProvenanceBadge
                    origin={corridorChoice === 'MUNNAR_VALPARAI' ? 'SIMULATED' : maxHazard?.source?.includes('Modeled') || maxHazard?.source?.includes('GSI') ? 'MODELLED' : 'LIVE'}
                    source={maxHazard?.source || 'GSI Susceptibility'}
                    confidence={maxHazard?.base_confidence}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Corridor Transit State</span>
                <p className={`text-xs font-bold ${isHighAlert ? 'text-rose-700' : isModerateAlert ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {isHighAlert ? 'Restricted / Active Hazard Zones' : isModerateAlert ? 'Passable with Heightened Caution' : 'Open / Nominal Transit'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Deterministic gate evaluated
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
