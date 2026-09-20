'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { HazardSegment } from '@/lib/engine/types';
import { 
  Shield, 
  LogOut, 
  MapPin, 
  Navigation, 
  Calendar, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  Mountain
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
  const [sourceId, setSourceId] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [mode, setMode] = useState<string>('Car');
  const [travelTime, setTravelTime] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set default travel time to local current time
  useEffect(() => {
    const now = new Date();
    // Offset for local ISO string YYYY-MM-DDTHH:mm
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

  // 2. Fetch corridor hazard segments from Supabase (NEVER hardcoded)
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
          // Set sensible defaults (S1 Adivaram as default source, S6 Kalpetta as default destination)
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation: Destination must differ from Source
    if (!sourceId || !destinationId) {
      setFormError('Please select both a source and a destination.');
      return;
    }

    if (sourceId === destinationId) {
      setFormError('Destination must differ from Source along the corridor.');
      return;
    }

    if (!travelTime) {
      setFormError('Please select a planned travel time.');
      return;
    }

    setSubmitting(true);

    try {
      const sourceSegment = segments.find(s => s.segment_id === sourceId);
      const destSegment = segments.find(s => s.segment_id === destinationId);

      const sourceName = sourceSegment ? sourceSegment.name : sourceId;
      const destName = destSegment ? destSegment.name : destinationId;

      // Save row to Supabase trips table for the logged-in user
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
        console.error('Trip insert error:', tripError);
        setFormError(`Failed to save trip: ${tripError.message}`);
        setSubmitting(false);
        return;
      }

      // Navigate to /result with the trip parameters
      router.push(`/result?trip_id=${tripData.id}&source=${sourceId}&destination=${destinationId}`);
    } catch (err: any) {
      console.error('Trip submission exception:', err);
      setFormError(err.message || 'An unexpected error occurred while saving your trip.');
      setSubmitting(false);
    }
  };

  if (authLoading || loadingSegments) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading NH-766 corridor data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Corridor: NH-766 Wayanad Mountain Pass
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Check Route Safety
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as <span className="font-medium text-slate-800">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-logout-btn"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 shadow-sm transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Trip Input Form Card */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Mountain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Plan Corridor Transit</h2>
            <p className="text-xs text-slate-500">Evaluates all 6 hazard checkpoints along NH-766</p>
          </div>
        </div>

        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleTripSubmit} className="space-y-6">
          {/* Source & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Source */}
            <div>
              <label htmlFor="source-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Source Segment</span>
              </label>
              <div className="relative">
                <select
                  id="source-select"
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition appearance-none cursor-pointer"
                >
                  {segments.map((seg) => (
                    <option key={`src-${seg.segment_id}`} value={seg.segment_id}>
                      {seg.name} ({seg.segment_id})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <Navigation className="w-4 h-4 rotate-90" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Starting point of your mountain transit</p>
            </div>

            {/* Destination */}
            <div>
              <label htmlFor="destination-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Destination Segment</span>
              </label>
              <div className="relative">
                <select
                  id="destination-select"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition appearance-none cursor-pointer"
                >
                  {segments.map((seg) => (
                    <option key={`dest-${seg.segment_id}`} value={seg.segment_id}>
                      {seg.name} ({seg.segment_id})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
                  <Navigation className="w-4 h-4 rotate-90" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Must differ from source checkpoint</p>
            </div>
          </div>

          {/* Mode & Travel Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Mode Selection */}
            <div>
              <label htmlFor="mode-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Travel Mode
              </label>
              <select
                id="mode-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                required
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition cursor-pointer"
              >
                <option value="Car">🚗 Car</option>
                <option value="Bike">🏍️ Bike / Two-Wheeler</option>
                <option value="Bus">🚌 Bus / Heavy Vehicle</option>
                <option value="On Foot">🚶 On Foot</option>
              </select>
            </div>

            {/* Travel Time */}
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safety advisories are 100% mathematically deterministic.</span>
            </div>

            <button
              id="check-route-btn"
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Trip & Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Check My Route</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
