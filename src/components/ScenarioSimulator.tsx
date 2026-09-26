'use client';

import React, { useState } from 'react';
import { Play, Sparkles, Zap } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/engine/actionResolution/scenarios';

interface ScenarioSimulatorProps {
  onScenarioSelect: (scenario: DemoScenario) => void;
  activeScenarioId?: string;
  isExecuting?: boolean;
}

export default function ScenarioSimulator({
  onScenarioSelect,
  activeScenarioId,
  isExecuting = false,
}: ScenarioSimulatorProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 p-4 sm:p-5 shadow-xl text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Scenario Playback &amp; Hazard Timeline Replay
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
                Interactive Scenario Mode
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulate evolving multi-hazard conditions to see how the engine dynamically updates its protective recommendation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-auto text-xs font-semibold text-slate-400 hover:text-slate-200 underline"
        >
          {isOpen ? 'Hide Scenarios' : 'Show Scenarios'}
        </button>
      </div>

      {/* Scenarios Grid */}
      {isOpen && (
        <div className="mt-4 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Evolving Hazard Stage:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DEMO_SCENARIOS.map((scenario) => {
              const isActive = activeScenarioId === scenario.id;

              return (
                <button
                  key={scenario.id}
                  onClick={() => onScenarioSelect(scenario)}
                  disabled={isExecuting}
                  className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group disabled:opacity-60 ${
                    isActive
                      ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-700">
                      {scenario.narrativeTime}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      scenario.id === 'SCENARIO_3_SIGNATURE_CONFLICT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : scenario.id === 'SCENARIO_4_RECOVERY_DIVERT'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-900 text-slate-300'
                    }`}>
                      {scenario.badge}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-white line-clamp-1">
                    {scenario.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {scenario.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-slate-400">
                      Corridor: {scenario.corridor === 'MUNNAR_VALPARAI' ? 'Munnar–Valparai' : 'NH-766 Wayanad'}
                    </span>
                    <span className={`flex items-center gap-1 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{isActive ? 'Active' : 'Run Stage'}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
