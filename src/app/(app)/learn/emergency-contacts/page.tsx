'use client';

import React from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Flame, 
  Trees, 
  Hospital, 
  WifiOff, 
  MapPin
} from 'lucide-react';

const EMERGENCY_CONTACTS = [
  {
    service: 'Disaster Management',
    name: 'Kerala State Disaster Management Authority (SDMA)',
    number: '1077',
    altNumber: '0471-2331645',
    description: 'Direct state control room for landslide alerts, river inundation, and emergency highway clearance.',
    icon: ShieldAlert,
    iconBg: 'bg-rose-50 text-rose-700',
    borderColor: 'border-rose-200'
  },
  {
    service: 'Police Assistance',
    name: 'Wayanad Highway Police & Control Room',
    number: '112',
    altNumber: '04936-202525',
    description: 'Ghat patrol, accident response, and live traffic diversion coordination between Adivaram and Lakkidi.',
    icon: PhoneCall,
    iconBg: 'bg-blue-50 text-blue-700',
    borderColor: 'border-blue-200'
  },
  {
    service: 'Medical & Ambulance',
    name: 'National Ambulance Emergency Service',
    number: '108',
    altNumber: '04936-202441',
    description: 'Dispatches 4x4 mountain-capable ambulances from Vythiri and Kalpetta general hospitals.',
    icon: Hospital,
    iconBg: 'bg-emerald-50 text-emerald-700',
    borderColor: 'border-emerald-200'
  },
  {
    service: 'Forest Department',
    name: 'Wayanad Wildlife Division (Muthanga Checkpost)',
    number: '04936-220454',
    altNumber: '1800-425-4733',
    description: 'Elephant crossing interventions, wildlife conflicts, and fallen tree removals in forest stretches.',
    icon: Trees,
    iconBg: 'bg-amber-50 text-amber-700',
    borderColor: 'border-amber-200'
  },
  {
    service: 'Fire & Rescue',
    name: 'Kalpetta Fire & Mountain Rescue Station',
    number: '101',
    altNumber: '04936-202101',
    description: 'Debris clearance, hydraulic rescue equipment, and cliff-side recovery operations.',
    icon: Flame,
    iconBg: 'bg-orange-50 text-orange-700',
    borderColor: 'border-orange-200'
  }
];

export default function EmergencyContactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-900 text-white text-[11px] font-semibold mb-2">
          <PhoneCall className="w-3 h-3 text-rose-300" />
          <span>Verified Emergency Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          NH-766 Emergency Contacts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Official toll-free helplines and district emergency centers along the Kozhikode–Wayanad mountain highway.
        </p>
      </div>

      {/* Critical Real-World Fallback Notice */}
      <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
          <WifiOff className="w-4 h-4 text-amber-700" />
          <span>Critical Dead-Zone Protocol (When Phones Have No Signal)</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
          The 9 hairpin curves between Adivaram and Lakkidi contain severe mobile dead zones. If you encounter an emergency with zero mobile network, <strong>do not rely on phone calls or apps</strong>. Immediately signal the nearest physical outpost:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-amber-900 font-semibold">
          <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Base: Adivaram Police Checkpost (Ghat Entry)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Summit: Lakkidi Forest & Highway Police Booth</span>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EMERGENCY_CONTACTS.map((contact, idx) => {
          const Icon = contact.icon;

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border ${contact.borderColor} p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-9 h-9 rounded-xl ${contact.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      {contact.service}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 leading-snug">
                      {contact.name}
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {contact.description}
                </p>
              </div>

              {/* Call Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${contact.number.replace(/\D/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-400" />
                  <span>Call {contact.number}</span>
                </a>

                {contact.altNumber && (
                  <a
                    href={`tel:${contact.altNumber.replace(/\D/g, '')}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                  >
                    Alt: {contact.altNumber}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
