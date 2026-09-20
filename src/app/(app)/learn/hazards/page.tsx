'use client';

import React from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Mountain, 
  Waves, 
  Trees, 
  ShieldAlert, 
  ArrowRight, 
  Eye
} from 'lucide-react';

const HAZARD_TYPES = [
  {
    id: 'landslide',
    title: 'Landslides & Debris Flow',
    badge: 'High Impact Hazard',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: Mountain,
    iconBg: 'bg-rose-50 text-rose-700',
    borderColor: 'border-rose-200',
    whatItLooksLike: 'Sudden collapse of uphill rock, mud, and vegetation sliding across the roadway. Ranging from small rockfalls obstructing single lanes to massive debris avalanches.',
    warningSigns: [
      'Small rocks, gravel, or pebbles tumbling onto the asphalt ahead.',
      'Sudden muddy water or new springs seeping out of the slope face.',
      'Tilting roadside trees, bent metal guardrails, or newly formed tarmac fissures.',
      'Low rumbling or cracking sounds from higher elevation slopes.'
    ],
    whyDangerousOnGhats: 'The Thamarassery ghat section has 9 hairpin curves cut into steep Western Ghats gneiss. Landslides sever access instantly, leaving vehicles trapped between impassable road sections with hundreds of feet of vertical drop-off.'
  },
  {
    id: 'flood',
    title: 'Flash Floods & Inundation',
    badge: 'Seasonal Hydrological Risk',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Waves,
    iconBg: 'bg-blue-50 text-blue-700',
    borderColor: 'border-blue-200',
    whatItLooksLike: 'Rapidly rising water rushing across culverts, low-lying bridges, and junction points (such as Meppadi), carrying mud and debris.',
    warningSigns: [
      'Discolored, muddy surge water overflowing roadside culverts.',
      'Rapidly rising water levels near natural streams alongside the road.',
      'Standing water obscuring lane markings or eroding the road shoulder.'
    ],
    whyDangerousOnGhats: 'Just 6 inches of fast-moving mountain runoff can sweep small cars and two-wheelers over cliff shoulders. Submerged tarmac often conceals collapsed road edges.'
  },
  {
    id: 'wildlife',
    title: 'Wildlife Crossing Corridors',
    badge: 'Ecological Caution Zone',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Trees,
    iconBg: 'bg-amber-50 text-amber-700',
    borderColor: 'border-amber-200',
    whatItLooksLike: 'Wild elephants, spotted deer, or gaur crossing the highway between sanctuary zones (notably Muthanga Wildlife Sanctuary and Bandipur corridor).',
    warningSigns: [
      'Fresh elephant dung or trampled forest vegetation along roadside shoulders.',
      'Forest department warning boards and reduced speed signage.',
      'Other motorists flashing hazard lights or stopping quietly.'
    ],
    whyDangerousOnGhats: 'Elephants are often startled by high-beam headlights and horns. Encountering an aggressive herd on a narrow two-lane corridor leaves virtually zero turning space.'
  },
  {
    id: 'road_closure',
    title: 'Road Closures & Bottlenecks',
    badge: 'Operational Blockage',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: ShieldAlert,
    iconBg: 'bg-slate-100 text-slate-700',
    borderColor: 'border-slate-200',
    whatItLooksLike: 'Police or revenue authority barricades redirecting traffic due to emergency road repairs, heavy vehicle breakdowns, or bypass diversions.',
    warningSigns: [
      'Long queues of stopped trucks and buses extending for kilometers.',
      'Official Kerala Police or SDMA advisory notices posted at checkposts.',
      'Absence of oncoming vehicles descending the ghat section.'
    ],
    whyDangerousOnGhats: 'Breakdowns or diversions on single-lane ghat stretches cause massive multi-hour deadlocks with zero food, water, or phone signal for miles.'
  }
];

export default function HazardGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
          <AlertTriangle className="w-3 h-3 text-emerald-400" />
          <span>Mountain Road Hazard Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          NH-766 Wayanad Hazard Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Understanding what each hazard category actually means on high-altitude mountain highways. Learn to recognize visual warning signs before encountering dangerous conditions.
        </p>
      </div>

      {/* Hazard Cards */}
      <div className="space-y-6">
        {HAZARD_TYPES.map((hazard) => {
          const Icon = hazard.icon;

          return (
            <div
              key={hazard.id}
              className={`bg-white rounded-2xl border ${hazard.borderColor} p-6 sm:p-7 shadow-xs space-y-4`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${hazard.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {hazard.title}
                    </h2>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${hazard.badgeColor}`}>
                      {hazard.badge}
                    </span>
                  </div>
                </div>
              </div>

              {/* What It Looks Like */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  What It Looks Like
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {hazard.whatItLooksLike}
                </p>
              </div>

              {/* Warning Signs */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Early Warning Indicators on the Road</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {hazard.warningSigns.map((sign, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Why Dangerous on Ghat Roads */}
              <div className="pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800/90 mb-1">
                  Why It&apos;s Dangerous on the Ghats
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                  {hazard.whyDangerousOnGhats}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Plan Safe Transit</h3>
          <p className="text-xs text-slate-500">Check verified real-time safety scores for your route.</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
        >
          <span>Trip Planner</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
