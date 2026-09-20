'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Gauge, 
  AlertCircle, 
  Moon, 
  Ban, 
  Fuel, 
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

const SAFETY_TIPS = [
  {
    category: 'Speed & Gear Control',
    icon: Gauge,
    iconBg: 'bg-emerald-50 text-emerald-700',
    title: 'Controlled Descending in Low Gear',
    items: [
      'Shift into 2nd or 3rd gear when descending the Thamarassery ghats to engage engine braking.',
      'Never ride the brakes continuously down multiple hairpins — brake pads overheat and fail rapidly.',
      'Maintain 25–35 km/h maximum speed on wet asphalt; mountain tarmac loses up to 50% traction during monsoon downpours.'
    ]
  },
  {
    category: 'Debris & Rockfall Response',
    icon: AlertCircle,
    iconBg: 'bg-rose-50 text-rose-700',
    title: 'Immediate Action on Fresh Debris',
    items: [
      'If you observe fresh loose stones or mud streaks across the road, do not stop directly beneath the slope to inspect.',
      'Reverse or retreat to a wide curve with a cleared overhead canopy if the road is blocked.',
      'Turn on hazard blinkers immediately to alert following mountain traffic before they round blind hairpins.'
    ]
  },
  {
    category: 'Wildlife Encounters',
    icon: Moon,
    iconBg: 'bg-amber-50 text-amber-700',
    title: 'Dusk & Night Corridor Rules (Muthanga)',
    items: [
      'Avoid driving through sanctuary stretches after twilight (6:00 PM – 6:00 AM) when elephant activity peaks.',
      'If you spot an elephant herd, dim high-beam headlights to low beams immediately and kill the engine horn.',
      'Maintain at least 50 meters distance. Never step out of the vehicle for photographs.'
    ]
  },
  {
    category: 'Overtaking Discipline',
    icon: Ban,
    iconBg: 'bg-indigo-50 text-indigo-700',
    title: 'Zero Overtaking on Hairpin Bends',
    items: [
      'Never overtake on any of the 9 hairpin curves or blind corners. Descending heavy trucks require the entire road radius.',
      'Always give ascending vehicles the right of way on steep gradients.',
      'Honk briefly before entering blind bends during daylight; flash headlights before entering at night.'
    ]
  },
  {
    category: 'Emergency Preparation',
    icon: Fuel,
    iconBg: 'bg-slate-100 text-slate-800',
    title: 'Preparation for Dead Zones',
    items: [
      'Top up fuel at Adivaram (base) before ascending — there are no fuel stations along the steep ghat section.',
      'Carry minimum 2 liters of drinking water and warm clothing in the vehicle in case of multi-hour traffic blockades.',
      'Download offline route data or take note of physical mile markers before mobile reception drops between hairpin curves.'
    ]
  }
];

export default function SafetyTipsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Preventive Mountain Driving Checklist</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ghat Road Safety Tips
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Essential guidelines for navigating the NH-766 Western Ghat mountain corridor safely, independent of live hazard alerts.
        </p>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-6">
        {SAFETY_TIPS.map((tip, idx) => {
          const Icon = tip.icon;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${tip.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {tip.category}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    {tip.title}
                  </h2>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                {tip.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Cross Link to Emergency Contacts */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Need emergency assistance right now?
          </h3>
          <p className="text-xs text-amber-800/90 mt-0.5">
            Quick-dial disaster management, police, ambulance, and forest checkposts.
          </p>
        </div>
        <Link
          href="/learn/emergency-contacts"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold transition shadow-xs shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Emergency Contacts</span>
        </Link>
      </div>
    </div>
  );
}
