'use client';

import React, { useState } from 'react';
import { PhoneCall, MapPin, Share2, Check } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/data/emergencyContacts';

export default function EmergencyPanel() {
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsError('GPS permission was denied or unavailable.');
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleShareLocation = async () => {
    if (!gpsLocation) return;
    const shareText = `EMERGENCY ALERT: I am traveling through the Western Ghats. My coordinates are: https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Traveler Location',
          text: shareText,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Emergency Directory</h3>
            <p className="text-[11px] text-slate-500">Government disaster management &amp; rescue helplines</p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          Toll-Free 24/7
        </span>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {EMERGENCY_CONTACTS.slice(0, 4).map((contact) => (
          <a
            key={contact.id}
            href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
            className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition flex items-start justify-between gap-2 group"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                {contact.title}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">{contact.desc}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {contact.number}
                </span>
                {contact.tollFree && (
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Toll-Free
                  </span>
                )}
              </div>
            </div>
            <PhoneCall className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1" />
          </a>
        ))}
      </div>

      {/* Share GPS Location Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-800">
              {gpsLocation 
                ? `GPS: ${gpsLocation.lat}° N, ${gpsLocation.lng}° E` 
                : 'Need to broadcast exact position to rescue services?'}
            </span>
            {gpsError && <p className="text-[11px] text-rose-600 mt-0.5">{gpsError}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!gpsLocation ? (
            <button
              onClick={handleGetLocation}
              disabled={gpsLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs disabled:opacity-50"
            >
              {gpsLoading ? 'Acquiring GPS...' : 'Get Live Coordinates'}
            </button>
          ) : (
            <button
              onClick={handleShareLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link!' : 'Share Location Link'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
