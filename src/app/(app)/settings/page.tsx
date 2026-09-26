'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  Settings as SettingsIcon, 
  Bell, 
  MapPin, 
  WifiOff, 
  RefreshCw, 
  Globe, 
  ShieldCheck, 
  User, 
  LogOut, 
  Save, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  // Settings State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [criticalAudioAlerts, setCriticalAudioAlerts] = useState(true);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(true);
  const [offlineCacheEnabled, setOfflineCacheEnabled] = useState(true);
  const [dataRefreshInterval, setDataRefreshInterval] = useState('60');
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Application Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings & System Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Configure telemetry refresh frequencies, audio hazard alerts, offline map caching, and account security.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition shrink-0"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Preferences Saved' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Section 1: Alert & Notification Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Hazard Alert & Audio Directives</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition">
              <div>
                <div className="font-bold text-slate-800">Real-Time Threat Change Notifications</div>
                <div className="text-slate-500">Receive instant push notifications when action directive changes from CONTINUE to STOP/DIVERT.</div>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition">
              <div>
                <div className="font-bold text-slate-800">Critical Audio Override Tones</div>
                <div className="text-slate-500">Play distinctive alarm tone for imminent rockfall and active elephant herd crossing warnings.</div>
              </div>
              <input
                type="checkbox"
                checked={criticalAudioAlerts}
                onChange={(e) => setCriticalAudioAlerts(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Section 2: Telemetry & Connectivity Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>Telemetry & Offline Dead-Zone Cache</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Live Telemetry Poll Frequency</label>
              <select
                value={dataRefreshInterval}
                onChange={(e) => setDataRefreshInterval(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900"
              >
                <option value="30">Every 30 seconds (High Bandwidth / Real-Time)</option>
                <option value="60">Every 60 seconds (Standard Mountain Pass Mode)</option>
                <option value="180">Every 3 minutes (Low Battery / Weak Signal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Corridor Geometry & Map Units</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900"
              >
                <option value="metric">Metric (Kilometers, km/h, mm/hr)</option>
                <option value="imperial">Imperial (Miles, mph, in/hr)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Account & Session */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Account Security & Session</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-xs font-bold text-slate-800">Active Traveler Session</div>
              <div className="text-xs text-slate-500">Authenticated with Supabase Row-Level Security (RLS).</div>
            </div>

            <button
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Log out of TravelLord</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
