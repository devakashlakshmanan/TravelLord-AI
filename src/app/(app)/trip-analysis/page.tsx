'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Layers, 
  FileCheck,
  Compass
} from 'lucide-react';

export default function TripRiskAnalysisPage() {
  const [selectedCorridor, setSelectedCorridor] = useState<'NH766' | 'MUNNAR_VALPARAI'>('NH766');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Safety Diagnostics & Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trip Risk Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Detailed hazard exposure metrics, time spent in elevated risk sectors, decision confidence stability, and audit trails of rejected unsafe routes.
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

      {/* Top 4 Diagnostic KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Hazard Exposure Duration</div>
          <div className="text-xl font-extrabold text-slate-900">14 Minutes</div>
          <div className="text-[11px] text-amber-700 font-semibold">Elevated precipitation zone</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Mean Confidence Index</div>
          <div className="text-xl font-extrabold text-emerald-700">92.4%</div>
          <div className="text-[11px] text-slate-500">Dual sensor agreement</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Unsafe Detours Rejected</div>
          <div className="text-xl font-extrabold text-rose-700">2 Routes</div>
          <div className="text-[11px] text-slate-500">Wildlife & Washout traps</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Recoverability Index</div>
          <div className="text-xl font-extrabold text-emerald-700">HIGH</div>
          <div className="text-[11px] text-slate-500">Shelter within 4.2 km</div>
        </div>
      </div>

      {/* Exposure Breakdown by Sector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Corridor Segment Risk & Hazard Breakdown</span>
        </h2>

        <div className="space-y-4 text-xs">
          {[
            {
              name: 'Adivaram Plain Base (S1)',
              risk: 0.15,
              status: 'SAFE',
              hazards: 'None • Dry road condition',
              sources: 'Kerala Traffic Police'
            },
            {
              name: 'Vythiri Ghat Incline (S3)',
              risk: 0.78,
              status: 'CRITICAL',
              hazards: 'Active mud slips • Saturated soil mantle',
              sources: 'GSI Slope Susceptibility + PWD Ghat Watch'
            },
            {
              name: 'Lakkidi Summit Viewpoint (S5)',
              risk: 0.65,
              status: 'CAUTION',
              hazards: 'Intense rain (>45 mm/hr) • Heavy fog',
              sources: 'IMD Doppler Radar'
            },
            {
              name: 'Kalpetta Bypass Link (S6)',
              risk: 0.22,
              status: 'SAFE',
              hazards: 'Light showers • Full carriage way open',
              sources: 'PWD Road Advisory'
            }
          ].map((sec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm">{sec.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  sec.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                  sec.status === 'CAUTION' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {sec.status} ({Math.round(sec.risk * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    sec.status === 'CRITICAL' ? 'bg-rose-500' :
                    sec.status === 'CAUTION' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} 
                  style={{ width: `${sec.risk * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-1">
                <span>{sec.hazards}</span>
                <span className="font-medium">Source: {sec.sources}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
