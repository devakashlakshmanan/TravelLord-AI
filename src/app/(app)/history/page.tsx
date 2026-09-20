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
  AlertCircle
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

  useEffect(() => {
    async function loadTrips() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch user's trips ordered by created_at DESC (scoped by RLS)
        const { data, error: fetchErr } = await supabase
          .from('trips')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;
        setTrips(data || []);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Traveler Activity Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Read-only log of your previously planned routes across the NH-766 corridor.
          </p>
        </div>

        <Link
          href="/dashboard"
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
        /* Friendly Empty State */
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
              Whenever you check route safety for the Wayanad ghats, your planned trips are securely archived here.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
          >
            <span>Go to Trip Planner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        /* Trip Cards List */
        <div className="space-y-3.5" id="trip-history-list">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                {/* Route */}
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

                {/* Mode badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 shrink-0 self-start sm:self-auto">
                  {getModeIcon(trip.mode)}
                  <span>{trip.mode}</span>
                </div>
              </div>

              {/* Timing Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Planned Travel Time: <strong className="text-slate-800">{formatDate(trip.travel_time)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Submitted: <span className="font-medium text-slate-700">{formatDate(trip.created_at)}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
