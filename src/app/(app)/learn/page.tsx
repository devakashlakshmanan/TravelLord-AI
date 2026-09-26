'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Mountain, 
  Trees, 
  ShieldAlert, 
  PhoneCall, 
  HelpCircle, 
  ArrowRight, 
  AlertTriangle,
  Compass,
  Radio
} from 'lucide-react';

export default function SafetyHubPage() {
  const guideCategories = [
    {
      title: 'Geotechnical & Landslide Safety',
      description: 'Understanding slope saturation, identifying early mud creep, escape protocols when rock slips occur on hairpin bends.',
      href: '/learn/hazards',
      icon: Mountain,
      tag: 'Critical Guide'
    },
    {
      title: 'Mountain Road & Ghat Driving Tips',
      description: 'Downhill engine braking, headlight etiquette in heavy fog, overtaking rules on hairpin turns, avoiding brake fade.',
      href: '/learn/safety-tips',
      icon: ShieldAlert,
      tag: 'Driving Directives'
    },
    {
      title: 'Wildlife Encounter Response',
      description: 'Protocols for wild elephant crossings on forest routes: vehicle stopping distance, avoiding horn honking, maintaining reverse buffer.',
      href: '/learn/hazards',
      icon: Trees,
      tag: 'Forest Protocols'
    },
    {
      title: 'Emergency Contact Directory',
      description: 'Verified regional emergency numbers: Kerala SDMA 1077, 112, Forest Flying Squad, District Ambulance Control Rooms.',
      href: '/learn/emergency-contacts',
      icon: PhoneCall,
      tag: '24/7 Helplines'
    },
    {
      title: 'How the Protective Action Engine Works',
      description: 'Mathematical architecture behind candidate generation, conflict resolution, recoverability analysis, and zero-AI decision authority.',
      href: '/learn/how-it-works',
      icon: HelpCircle,
      tag: 'System Architecture'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span>Knowledge & Preparedness</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Safety Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Comprehensive practical guides for mountain pass survival, geotechnical hazard preparedness, wildlife encounter protocols, and deterministic decision system mechanics.
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guideCategories.map((guide) => {
          const Icon = guide.icon;

          return (
            <Link
              key={guide.title}
              href={guide.href}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white group-hover:bg-emerald-600 transition">
                    <Icon className="w-5 h-5 text-emerald-400 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {guide.tag}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-700 transition">
                  {guide.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {guide.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
