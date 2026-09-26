'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Hospital, 
  Shield, 
  Building2, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  Fuel, 
  ExternalLink 
} from 'lucide-react';
import { SafeZoneAdapter, NormalizedSafeZone } from '@/lib/dataAdapters';

export default function SafeZonesPage() {
  const [selectedCorridor, setSelectedCorridor] = useState<'NH766' | 'MUNNAR_VALPARAI'>('NH766');
  const safeZones: NormalizedSafeZone[] = SafeZoneAdapter.getAllSafeZones();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Designated Staging & Rescue Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Safe Zones & Shelters Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Verified emergency shelters, trauma centers, and district staging points along mountain passes. The Action Resolver routes travelers here when road corridors fail multi-hazard safety constraints.
          </p>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value as any)}
            className="text-xs font-bold bg-transparent text-slate-800 focus:outline-hidden"
          >
            <option value="NH766">NH-766 Kozhikode–Wayanad Pass</option>
            <option value="MUNNAR_VALPARAI">Munnar–Valparai High Range</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {safeZones.map((zone) => {
          const isHospital = zone.type === 'HOSPITAL';
          const isShelter = zone.type === 'SHELTER';
          const isPolice = zone.type === 'POLICE_STATION';

          return (
            <div
              key={zone.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition"
            >
              <div className="space-y-3">
                {/* Header row: Type badge + Distance */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isHospital
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isShelter
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {zone.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Capacity: {zone.capacityStatus}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-900">
                    {zone.distanceKm} km • ~{zone.estimatedReachMinutes} min
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {isHospital ? (
                    <Hospital className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : isShelter ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Shield className="w-4 h-4 text-sky-600 shrink-0" />
                  )}
                  <span>{zone.name}</span>
                </h3>

                {/* Road Accessibility */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Road Transit State:</span>
                  <span className={`font-bold ${zone.roadAccessibility === 'OPEN' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {zone.roadAccessibility}
                  </span>
                </div>

                {/* Available Facilities list */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Verified Facilities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.facilities.map((fac, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                {zone.contactNumber && (
                  <a
                    href={`tel:${zone.contactNumber}`}
                    className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{zone.contactNumber}</span>
                  </a>
                )}
                
                <span className="text-[11px] text-slate-400">Verified {zone.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
