'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  Share2, 
  Hospital, 
  Check, 
  Copy,
  ExternalLink,
  BookOpen,
  Mountain,
  Trees,
  CheckCircle2
} from 'lucide-react';
import { SafeZoneAdapter, NormalizedSafeZone } from '@/lib/dataAdapters';
import { EMERGENCY_CONTACTS, SURVIVAL_GUIDES } from '@/lib/data/emergencyContacts';

export default function EmergencyCenterPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'SOS' | 'SAFE_ZONES' | 'SAFETY_GUIDES'>('SOS');

  const safeZones: NormalizedSafeZone[] = SafeZoneAdapter.getAllSafeZones();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords({ lat: 11.5760, lng: 76.0980 })
      );
    } else {
      setCoords({ lat: 11.5760, lng: 76.0980 });
    }
  }, []);

  const shareText = coords
    ? `EMERGENCY ALERT: I am stranded on the mountain pass corridor. My GPS Coordinates: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}. Google Maps Link: https://maps.google.com/?q=${coords.lat},${coords.lng}`
    : `EMERGENCY ALERT: I am stranded on NH-766 Wayanad Ghat Pass. Please send rescue.`;

  const handleCopyLocation = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSMSShare = () => {
    window.open(`sms:?&body=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top SOS Banner */}
      <div className="p-6 rounded-2xl bg-rose-600 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Emergency Center &amp; SOS
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 mt-0.5">
                Immediate disaster rescue dispatchers, verified shelters, and GPS broadcaster.
              </p>
            </div>
          </div>

          <a
            href="tel:112"
            className="px-6 py-3.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-black text-base flex items-center justify-center gap-2.5 shadow-md transition shrink-0"
          >
            <Phone className="w-5 h-5 animate-bounce" />
            <span>DIAL 112 NOW</span>
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('SOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'SOS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Emergency Helplines &amp; GPS</span>
        </button>

        <button
          onClick={() => setActiveTab('SAFE_ZONES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'SAFE_ZONES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Hospital className="w-3.5 h-3.5" />
          <span>Shelters &amp; Hospitals ({safeZones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SAFETY_GUIDES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'SAFETY_GUIDES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Survival Guides ({SURVIVAL_GUIDES.length})</span>
        </button>
      </div>

      {/* Tab 1: SOS & Helplines */}
      {activeTab === 'SOS' && (
        <div className="space-y-6">
          {/* GPS Location Broadcaster */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                <span>Live Emergency GPS Broadcaster</span>
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Live Coordinate Lock
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs sm:text-sm space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Broadcasting Coordinates:</div>
              <div className="text-emerald-400 font-extrabold text-base sm:text-lg">
                {coords ? `${coords.lat.toFixed(6)}° N, ${coords.lng.toFixed(6)}° E` : 'Acquiring GPS fix...'}
              </div>
              <div className="text-slate-400 text-[11px]">Location: NH-766 Wayanad Mountain Pass Corridor</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                onClick={handleCopyLocation}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Coordinates Copied' : 'Copy SOS Text'}</span>
              </button>

              <button
                onClick={handleSMSShare}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Broadcast via SMS</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Broadcast WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Directory of Emergency Dispatchers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Official 24/7 Disaster Toll-Free Helplines
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EMERGENCY_CONTACTS.map((contact) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition hover:shadow-sm ${
                    contact.number === '112' || contact.number === '1077'
                      ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/80 text-rose-950'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${contact.number === '112' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{contact.title}</div>
                      <div className="text-sm font-mono font-extrabold text-rose-700 mt-0.5">{contact.number}</div>
                      <div className="text-[10px] text-slate-500 truncate">{contact.jurisdiction}</div>
                    </div>
                  </div>

                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Integrated Safe Zones & Shelters */}
      {activeTab === 'SAFE_ZONES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {safeZones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {zone.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {zone.distanceKm} km • ~{zone.estimatedReachMinutes} min
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900">{zone.name}</h3>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Road State:</span>
                  <span className={`font-bold ${zone.roadAccessibility === 'OPEN' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {zone.roadAccessibility}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {zone.facilities.map((fac, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {zone.contactNumber && (
                <div className="pt-3 border-t border-slate-100">
                  <a href={`tel:${zone.contactNumber}`} className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Facility: {zone.contactNumber}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Integrated Safety & Survival Guides */}
      {activeTab === 'SAFETY_GUIDES' && (
        <div className="space-y-6 animate-fade-in">
          {SURVIVAL_GUIDES.map((guide) => (
            <div key={guide.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                  {guide.category === 'LANDSLIDE' ? (
                    <Mountain className="w-5 h-5 text-emerald-400" />
                  ) : guide.category === 'WILDLIFE' ? (
                    <Trees className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{guide.title}</h3>
                  <p className="text-xs text-slate-500">{guide.summary}</p>
                </div>
              </div>

              <ul className="text-xs text-slate-700 space-y-2 pt-1 border-t border-slate-100">
                {guide.protocol.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
