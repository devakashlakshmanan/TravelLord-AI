'use client';

import React from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  MapPin, 
  WifiOff 
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/lib/data/emergencyContacts';

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
          Mountain Pass Emergency Contacts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Official toll-free helplines and district emergency coordination centers along the Western Ghats mountain corridors.
        </p>
      </div>

      {/* Critical Real-World Fallback Notice */}
      <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
          <WifiOff className="w-4 h-4 text-amber-700" />
          <span>Critical Dead-Zone Protocol (When Phones Have No Signal)</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
          Ghat hairpin curves contain severe mobile dead zones. If you encounter an emergency with zero mobile network, <strong>do not rely on phone calls or apps</strong>. Immediately signal the nearest physical outpost:
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
        {EMERGENCY_CONTACTS.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {contact.category.replace('_', ' ')}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 leading-snug">
                    {contact.title}
                  </h2>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {contact.desc}
              </p>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                Jurisdiction: {contact.jurisdiction}
              </div>
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

              {contact.tollFree && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Toll-Free 24/7
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
