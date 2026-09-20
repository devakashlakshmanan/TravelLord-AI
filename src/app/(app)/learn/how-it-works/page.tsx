'use client';

import React from 'react';
import { 
  HelpCircle, 
  Lock
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold mb-2">
          <HelpCircle className="w-3 h-3 text-emerald-400" />
          <span>Core Engineering Philosophy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How TravelLord AI Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Why we use deterministic backend formulas instead of generative guessing, and why honest uncertainty saves lives in mountain passes.
        </p>
      </div>

      {/* Core Principle Banner */}
      <div className="p-6 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm sm:text-base">
          <Lock className="w-4 h-4 text-emerald-700" />
          <span>Our Uncompromising Safety Principle</span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
          &ldquo;If we don&apos;t have enough reliable information, we will tell you honestly instead of guessing.&rdquo;
        </p>
        <p className="text-xs text-emerald-700 leading-relaxed">
          In high-hazard mountain corridors like the Wayanad ghats, a false sense of security is fatal. Most apps force an answer regardless of data quality. TravelLord AI enforces mathematical honesty: if verified telemetry drops below safe confidence thresholds (40%), we say <strong>INSUFFICIENT_DATA</strong>.
        </p>
      </div>

      {/* 4 Steps Architecture */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          The 4-Step Safety Decision Pipeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">Corridor Route Slicing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you select your origin and destination, the app slices all intervening hazard checkpoints along the 30km NH-766 corridor in geographical sequence.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">Dual-Score Calculation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For every segment, two independent values are calculated: <strong>Hazard Risk</strong> (how dangerous is the terrain) and <strong>Confidence</strong> (how fresh and verified is our source data).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Gating (Zero AI)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The highest-risk segment controls the trip recommendation using strictly hardcoded, mathematical decision gates. No probabilistic AI model ever decides your action.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              4
            </div>
            <h3 className="text-sm font-bold text-slate-900">Factual Translation Only</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Groq AI receives the already-computed numbers and writes 2-3 calm, plain-English sentences for the traveler. It is strictly forbidden from altering the numbers or inventing hazards.
            </p>
          </div>
        </div>
      </div>

      {/* Decision Gates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          The Exact Decision Gates
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-2.5 pr-4">Confidence Level</th>
                <th className="py-2.5 px-4">Risk Score</th>
                <th className="py-2.5 px-4">Safety Directive</th>
                <th className="py-2.5 pl-4">Operational Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 pr-4 font-bold text-emerald-800">&ge; 75% (High)</td>
                <td className="py-3 px-4 font-bold text-rose-700">&ge; 0.70</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">Turn Back / Divert</span></td>
                <td className="py-3 pl-4">Severe active hazard confirmed. Retreat to safety.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-emerald-800">&ge; 75% (High)</td>
                <td className="py-3 px-4 font-bold text-amber-700">0.50 – 0.69</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">Wait</span></td>
                <td className="py-3 pl-4">Temporary obstruction clearing; hold at safe curve.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-emerald-800">&ge; 75% (High)</td>
                <td className="py-3 px-4 font-bold text-amber-700">0.30 – 0.49</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">Slow Down</span></td>
                <td className="py-3 pl-4">Slippery surface or active wildlife zone ahead.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-emerald-800">&ge; 75% (High)</td>
                <td className="py-3 px-4 font-bold text-emerald-700">&lt; 0.30</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">Continue</span></td>
                <td className="py-3 pl-4">All corridor checkpoints clear with fresh data.</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-amber-800">40% – 74% (Moderate)</td>
                <td className="py-3 px-4 text-slate-500">Any</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">ELEVATED_CAUTION</span></td>
                <td className="py-3 pl-4">No directive verb given; heightened awareness required.</td>
              </tr>
              <tr className="bg-slate-50/70">
                <td className="py-3 pr-4 font-bold text-slate-500">&lt; 40% (Insufficient)</td>
                <td className="py-3 px-4 text-slate-400">Irrelevant</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold">INSUFFICIENT_DATA</span></td>
                <td className="py-3 pl-4 font-semibold text-slate-800">System refuses to guess. Rely on police/posted signs.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
