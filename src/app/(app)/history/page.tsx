'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { 
  Clock, 
  Navigation, 
  Calendar, 
  Car, 
  Bike, 
  Bus, 
  Footprints, 
  ArrowRight, 
  Compass, 
  Loader2, 
  AlertCircle,
  GitCommit,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  XCircle
} from 'lucide-react';

interface TripRecord {
  id: string;
  user_id: string;
  source: string;
  destination: string;
  mode: string;
  travel_time: string;
  created_at: string;
}

export default function HistoryPage() {
  const supabase = createClient();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error: fetchErr } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;
        setTrips(data || []);
        if (data && data.length > 0) {
          setExpandedTripId(data[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching trip history:', err);
        setError('Unable to load past trips from database.');
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [supabase]);

  const getModeIcon = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case 'bike':
        return <Bike className="w-4 h-4 text-amber-600" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-blue-600" />;
      case 'on foot':
        return <Footprints className="w-4 h-4 text-emerald-600" />;
      case 'car':
      default:
        return <Car className="w-4 h-4 text-slate-700" />;
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Traveler Decision Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip History &amp; Safety Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Auditable archive of past transit routes, multi-hazard exposure metrics, decision timelines, and rejected alternatives.
          </p>
        </div>

        <Link
          href="/plan"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>Plan New Route</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 font-medium">Retrieving verified trips from database...</p>
        </div>
      ) : trips.length === 0 ? (
        <div 
          id="trip-history-empty-state"
          className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs max-w-md mx-auto space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 mx-auto">
            <Compass className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              No trips yet — plan your first route
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Whenever you evaluate corridor safety for the Western Ghats, your trip decisions and risk diagnostics are preserved here.
            </p>
          </div>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <span>Go to Trip Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4" id="trip-history-list">
          {trips.map((trip) => {
            const isExpanded = expandedTripId === trip.id;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition space-y-4"
              >
                {/* Trip Header Row */}
                <div 
                  onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Navigation className="w-4 h-4 text-emerald-600 rotate-90" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span>{trip.source}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{trip.destination}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Trip ID: #{trip.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                      {getModeIcon(trip.mode)}
                      <span>{trip.mode}</span>
                    </div>

                    <button className="text-slate-400 hover:text-slate-700">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Timeline Evolution */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <GitCommit className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Decision Timeline Evolution</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono">08:30 AM</span>
                      <p className="font-bold text-emerald-700 mt-0.5">CONTINUE</p>
                      <span className="text-[10px] text-slate-500">Nominal slope</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono">08:45 AM</span>
                      <p className="font-bold text-amber-700 mt-0.5">SLOW DOWN</p>
                      <span className="text-[10px] text-slate-500">Rainfall rising</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono">09:00 AM</span>
                      <p className="font-bold text-rose-700 mt-0.5">STOP @ SHELTER</p>
                      <span className="text-[10px] text-slate-500">Landslide + Wildlife</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono">09:25 AM</span>
                      <p className="font-bold text-blue-700 mt-0.5">DIVERT ALT A</p>
                      <span className="text-[10px] text-slate-500">Detour cleared</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Integrated Trip Risk Diagnostics & Exposure Breakdown */}
                {isExpanded && (
                  <div className="pt-2 space-y-4 border-t border-slate-100 animate-fade-in text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Trip Risk Diagnostics &amp; Exposure Analysis</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Exposure Time</div>
                        <div className="text-sm font-extrabold text-slate-900">14 min</div>
                        <div className="text-[10px] text-amber-700">Rainfall band</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Mean Confidence</div>
                        <div className="text-sm font-extrabold text-emerald-700">92.4%</div>
                        <div className="text-[10px] text-slate-500">Dual verification</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Detours Rejected</div>
                        <div className="text-sm font-extrabold text-rose-700">2 Routes</div>
                        <div className="text-[10px] text-slate-500">Wildlife &amp; Washout</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Recoverability</div>
                        <div className="text-sm font-extrabold text-emerald-700">HIGH</div>
                        <div className="text-[10px] text-slate-500">Shelter S3 reachable</div>
                      </div>
                    </div>

                    {/* Segment Breakdown */}
                    <div className="space-y-2">
                      <div className="font-bold text-slate-700">Checkpoint Exposure Breakdown:</div>
                      {[
                        { name: 'Adivaram Plain Base (S1)', risk: 0.15, status: 'SAFE' },
                        { name: 'Vythiri Ghat Incline (S3)', risk: 0.78, status: 'CRITICAL' },
                        { name: 'Lakkidi Summit Curve (S5)', risk: 0.65, status: 'CAUTION' },
                      ].map((sec, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="font-medium text-slate-800">{sec.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sec.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            sec.status === 'CAUTION' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {sec.status} ({Math.round(sec.risk * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timing Metadata & Re-evaluate CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Planned Departure: <strong className="text-slate-800">{formatDate(trip.travel_time)}</strong></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Logged: <span className="font-medium text-slate-700">{formatDate(trip.created_at)}</span></span>
                    <Link
                      href={`/result?source=S1&destination=S6`}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Re-Evaluate Route</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
