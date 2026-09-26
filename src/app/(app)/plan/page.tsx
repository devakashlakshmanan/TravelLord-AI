'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Calendar, 
  Car, 
  Bike, 
  Bus, 
  Footprints, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Info,
  ShieldAlert
} from 'lucide-react';
import { WAYANAD_CHECKPOINTS, HazardSegment } from '@/lib/engine/types';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import { ActionDecisionResult, HazardState, RoadState } from '@/lib/engine/actionResolution/actionTypes';
import ProvenanceBadge from '@/components/ProvenanceBadge';

export default function PlanTripPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [corridor, setCorridor] = useState<'NH766' | 'MUNNAR_VALPARAI'>('NH766');
  const [origin, setOrigin] = useState('S1');
  const [destination, setDestination] = useState('S6');
  const [departureTime, setDepartureTime] = useState('Now');
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split('T')[0]);
  const [travelMode, setTravelMode] = useState<'Car' | 'Bike' | 'Bus' | 'On Foot'>('Car');
  const [avoidNightTravel, setAvoidNightTravel] = useState(true);
  const [hasVulnerableTravelers, setHasVulnerableTravelers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbSegments, setDbSegments] = useState<HazardSegment[]>([]);

  // Initial Pre-Trip Assessment preview
  const [assessmentResult, setAssessmentResult] = useState<ActionDecisionResult | null>(null);

  // Load corridor segments from DB
  useEffect(() => {
    async function fetchSegments() {
      const { data } = await supabase.from('hazard_segments').select('*').order('segment_id', { ascending: true });
      if (data && data.length > 0) {
        setDbSegments(data);
      }
    }
    fetchSegments();
  }, [supabase]);

  const handleGenerateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (corridor === 'MUNNAR_VALPARAI') {
        const res = resolveProtectiveAction({
          corridorType: 'MUNNAR_VALPARAI',
          travelerState: {
            currentLocation: { lat: 10.0889, lng: 77.0595, name: 'Munnar Town Center' },
            destination: { lat: 10.3264, lng: 76.9554, name: 'Valparai Center' },
            travelMode: travelMode as any,
            currentSegmentId: 'N_GAP_ROAD',
            speedKmh: travelMode === 'On Foot' ? 5 : travelMode === 'Bike' ? 30 : 40,
            direction: 'NORTH_EAST',
            departureTime: `${travelDate}T10:00:00.000Z`,
            currentTime: new Date().toISOString(),
            isSimulatedGps: false,
          },
          hazards: [
            {
              id: 'H_LANDSLIDE_GAP',
              type: 'LANDSLIDE',
              location: { lat: 10.0520, lng: 77.1420, name: 'Lockhart Gap' },
              affectedSegments: ['N_GAP_ROAD'],
              severity: 0.88,
              confidence: 0.92,
              trend: 'rising',
              source: 'GSI Slope Alert (Modeled)',
              sourceType: 'MODELED',
              lastUpdated: new Date().toISOString(),
            },
            {
              id: 'H_WILDLIFE_SHOLA',
              type: 'WILDLIFE',
              location: { lat: 10.2010, lng: 77.0120, name: 'Anamudi Shola Reserve' },
              affectedSegments: ['N_ANAMUDI_PASS'],
              severity: 0.82,
              confidence: 0.89,
              trend: 'stable',
              source: 'Forest Department RRT Radio',
              sourceType: 'AUTHORITATIVE',
              lastUpdated: new Date().toISOString(),
            }
          ],
          roadStates: [
            {
              segmentId: 'N_GAP_ROAD',
              name: 'Lockhart Gap Cliffside',
              state: 'RESTRICTED',
              source: 'PWD Highway Engineers',
              sourceType: 'AUTHORITATIVE',
              confidence: 0.90,
              lastUpdated: new Date().toISOString(),
            },
            {
              segmentId: 'N_ANAMUDI_PASS',
              name: 'Anamudi Shola Reserve Link',
              state: 'OPEN',
              source: 'Forest Checkpost',
              sourceType: 'AUTHORITATIVE',
              confidence: 0.88,
              lastUpdated: new Date().toISOString(),
            },
            {
              segmentId: 'N_MATTUPETTY',
              name: 'Mattupetty Bypass Section',
              state: 'BLOCKED',
              source: 'State Highways Authority',
              sourceType: 'AUTHORITATIVE',
              confidence: 0.95,
              lastUpdated: new Date().toISOString(),
            }
          ]
        });
        setAssessmentResult(res);
      } else {
        // Wayanad NH-766 evaluation
        const hazardStates: HazardState[] = (dbSegments.length > 0 ? dbSegments : []).map(s => ({
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

        const roadStates: RoadState[] = (dbSegments.length > 0 ? dbSegments : []).map(s => ({
          segmentId: s.segment_id,
          name: s.name,
          state: s.severity >= 0.8 ? 'BLOCKED' : s.severity >= 0.5 ? 'RESTRICTED' : 'OPEN',
          source: s.source,
          sourceType: 'AUTHORITATIVE',
          confidence: s.base_confidence,
          lastUpdated: s.last_updated,
        }));

        const res = resolveProtectiveAction({
          corridorType: 'WAYANAD_NH766',
          hazards: hazardStates,
          roadStates,
          travelerState: {
            currentSegmentId: origin,
            travelMode: travelMode as any,
          }
        });
        setAssessmentResult(res);
      }
    } catch (err) {
      console.error('Assessment generation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartMonitoredTrip = async () => {
    let tripId = 'demo-trip';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const originName = WAYANAD_CHECKPOINTS.find(c => c.id === origin)?.name || origin;
        const destName = WAYANAD_CHECKPOINTS.find(c => c.id === destination)?.name || destination;
        const { data: newTrip } = await supabase.from('trips').insert({
          user_id: session.user.id,
          source: corridor === 'MUNNAR_VALPARAI' ? 'Munnar Town Center' : originName,
          destination: corridor === 'MUNNAR_VALPARAI' ? 'Valparai Center' : destName,
          mode: travelMode,
          travel_time: new Date().toISOString(),
        }).select().single();
        if (newTrip) tripId = newTrip.id;
      }
    } catch (e) {
      console.warn('Trip create warning:', e);
    }

    if (corridor === 'MUNNAR_VALPARAI') {
      router.push(`/result?trip_id=${tripId}&corridor=MUNNAR_VALPARAI&scenario=SCENARIO_3_SIGNATURE_CONFLICT`);
    } else {
      const params = new URLSearchParams({
        trip_id: tripId,
        source: origin,
        destination: destination,
        mode: travelMode,
        nightAvoid: avoidNightTravel ? '1' : '0',
        vulnerable: hasVulnerableTravelers ? '1' : '0',
      });
      router.push(`/result?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Trip Safety Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plan a Safe Trip
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Input departure time, route checkpoints, and travel mode. The engine geocodes the corridor, identifies active geotechnical/wildlife hazards, and builds an executable protective action before you depart.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Trip Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleGenerateAssessment} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>1. Route & Corridor Selection</span>
              </h2>
              <span className="text-[11px] font-medium text-slate-400">Step 1 of 2</span>
            </div>

            {/* Corridor Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Monitored Mountain Corridor</label>
              <select
                value={corridor}
                onChange={(e) => setCorridor(e.target.value as any)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="NH766">NH-766 Kozhikode–Wayanad Ghat Pass (Primary Live Corridor)</option>
                <option value="MUNNAR_VALPARAI">Munnar–Valparai High Range Pass (Multi-Hazard Conflict Demo)</option>
              </select>
            </div>

            {/* Origin & Destination Checkpoints */}
            {corridor === 'NH766' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Origin Checkpoint</label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {WAYANAD_CHECKPOINTS.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.name} ({cp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Destination Checkpoint</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {WAYANAD_CHECKPOINTS.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.name} ({cp.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>2. Timing & Travel Mode</span>
              </h2>
              <span className="text-[11px] font-medium text-slate-400">Step 2 of 2</span>
            </div>

            {/* Date & Departure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Travel Date</span>
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Departure Time</span>
                </label>
                <select
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Now">Depart Immediately (Live Telemetry)</option>
                  <option value="In 1 hour">In 1 Hour (Forecast Adjusted)</option>
                  <option value="In 3 hours">In 3 Hours (Monsoon Outlook)</option>
                  <option value="Evening (18:00)">Evening Transit (18:00 - Night Rules)</option>
                  <option value="Tomorrow Morning">Tomorrow Morning (06:00)</option>
                </select>
              </div>
            </div>

            {/* Mode of Transport */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Mode of Transport</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Car', label: 'Car / SUV', icon: Car, desc: 'High shelter' },
                  { id: 'Bike', label: 'Motorcycle', icon: Bike, desc: 'High exposure' },
                  { id: 'Bus', label: 'Bus / Heavy', icon: Bus, desc: 'Restricted turns' },
                  { id: 'On Foot', label: 'Trek / Foot', icon: Footprints, desc: 'Slow retreat' },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = travelMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTravelMode(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col items-start gap-1.5 ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-xs font-bold leading-tight">{item.label}</div>
                        <div className={`text-[10px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                <Info className="w-3 h-3 text-slate-400" />
                <span>Travel mode alters recoverability scoring and wildlife escape thresholds.</span>
              </p>
            </div>

            {/* Preferences */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700">Traveler Safety Preferences</label>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={avoidNightTravel}
                    onChange={(e) => setAvoidNightTravel(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 font-medium">Enforce nocturnal ghat ban and dusk wildlife alerts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVulnerableTravelers}
                    onChange={(e) => setHasVulnerableTravelers(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700 font-medium">Traveling with children/elderly (favor safe shelters with medical aid)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Evaluating Route Geotechnical Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Generate Pre-Trip Safety Assessment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Instant Safety Assessment Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Initial Safety Assessment</span>
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Deterministic
              </span>
            </div>

            {assessmentResult ? (
              <div className="space-y-4 animate-fade-in">
                {/* Result summary banner */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                      Calculated Directive
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-800">
                      {(assessmentResult.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{assessmentResult.actionTitle}</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-normal">
                    {assessmentResult.reasons.length > 0 ? assessmentResult.reasons[0] : 'Route conditions evaluated by deterministic engine.'}
                  </p>
                </div>

                {/* Pre-Trip Key Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Decision Window</div>
                    <div className="text-sm font-extrabold text-slate-900">~{assessmentResult.decisionWindowMinutes} min</div>
                    <div className="text-[10px] text-slate-500">Before state evolves</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Recoverability</div>
                    <div className="text-sm font-extrabold text-slate-900">{assessmentResult.recoverability}</div>
                    <div className="text-[10px] text-slate-500">Fallback capacity</div>
                  </div>
                </div>

                {/* Provenance Badge */}
                <div>
                  <ProvenanceBadge
                    origin={corridor === 'MUNNAR_VALPARAI' ? 'SIMULATED' : 'MODELLED'}
                    source={corridor === 'MUNNAR_VALPARAI' ? 'Simulated Multi-Hazard Fixture' : 'GSI Slope Telemetry & PWD Advisory'}
                    confidence={assessmentResult.confidence}
                  />
                </div>

                <button
                  onClick={handleStartMonitoredTrip}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <span>Start Live Trip Monitoring</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <Compass className="w-10 h-10 stroke-1 text-slate-300" />
                <div className="text-xs font-medium max-w-xs text-slate-500">
                  Select your checkpoints and transport mode, then click Generate to produce a verified pre-departure safety assessment.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
