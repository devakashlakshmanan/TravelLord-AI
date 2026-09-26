'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Zap, 
  ShieldAlert, 
  Droplets, 
  Mountain, 
  Activity, 
  Compass, 
  AlertTriangle, 
  CheckCircle2,
  GitFork,
  ArrowRight
} from 'lucide-react';
import { 
  calculateLandslideRisk, 
  calculateFloodRisk, 
  calculateWildlifeRisk, 
  calculateRoadRisk, 
  calculateOverallRisk, 
  calculateEvidenceConfidence,
  calculateRiskTrend,
  SEGMENT_NAMES
} from '@/lib/replay/syntheticReplay';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import { HazardState, RoadState } from '@/lib/engine/actionResolution/actionTypes';
import ProvenanceBadge from '@/components/ProvenanceBadge';

export default function SimulatorPage() {
  // Configurable parameters
  const [selectedSegmentId, setSelectedSegmentId] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6'>('S6');
  const [slopeDeg, setSlopeDeg] = useState(38);
  const [rainfall1h, setRainfall1h] = useState(26.8);
  const [rainfall24h, setRainfall24h] = useState(118);
  const [soilSaturation, setSoilSaturation] = useState(96);
  const [waterLevel, setWaterLevel] = useState(84);
  const [wildlifeActivity, setWildlifeActivity] = useState(0.62);
  const [roadState, setRoadState] = useState<'OPEN' | 'PARTIALLY_ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED'>('BLOCKED');

  // Exact deterministic risk calculations
  const { signal: landslideSignal, risk: landslideRisk } = useMemo(() => {
    return calculateLandslideRisk(slopeDeg, rainfall24h, rainfall1h);
  }, [slopeDeg, rainfall24h, rainfall1h]);

  const floodRisk = useMemo(() => {
    return calculateFloodRisk(waterLevel, rainfall24h);
  }, [waterLevel, rainfall24h]);

  const wildlifeRisk = useMemo(() => {
    return calculateWildlifeRisk(wildlifeActivity);
  }, [wildlifeActivity]);

  const roadRisk = useMemo(() => {
    return calculateRoadRisk(roadState);
  }, [roadState]);

  const overallRisk = useMemo(() => {
    return calculateOverallRisk(landslideRisk, floodRisk, wildlifeRisk, roadRisk);
  }, [landslideRisk, floodRisk, wildlifeRisk, roadRisk]);

  const confidence = useMemo(() => {
    return calculateEvidenceConfidence(100, 92, 88);
  }, []);

  const trend = useMemo(() => {
    return overallRisk >= 50 ? 'RISING' : 'STABLE';
  }, [overallRisk]);

  // Execute unified Action Resolution Engine with simulated inputs
  const decisionResult = useMemo(() => {
    const hazardStates: HazardState[] = [];

    if (landslideRisk >= 30) {
      hazardStates.push({
        id: `H_SIM_LANDSLIDE_${selectedSegmentId}`,
        type: 'LANDSLIDE',
        location: { lat: 10.3265, lng: 76.9515, name: SEGMENT_NAMES[selectedSegmentId] },
        affectedSegments: [selectedSegmentId],
        severity: Number((landslideRisk / 100).toFixed(2)),
        confidence: Number((confidence / 100).toFixed(2)),
        trend: 'rising',
        source: 'What-If Simulation Engine',
        sourceType: 'SIMULATED',
        lastUpdated: new Date().toISOString(),
      });
    }

    if (floodRisk >= 40) {
      hazardStates.push({
        id: `H_SIM_FLOOD_${selectedSegmentId}`,
        type: 'FLOOD',
        location: { lat: 10.3265, lng: 76.9515, name: SEGMENT_NAMES[selectedSegmentId] },
        affectedSegments: [selectedSegmentId],
        severity: Number((floodRisk / 100).toFixed(2)),
        confidence: Number((confidence / 100).toFixed(2)),
        trend: 'rising',
        source: 'What-If Simulation Engine',
        sourceType: 'SIMULATED',
        lastUpdated: new Date().toISOString(),
      });
    }

    if (wildlifeRisk >= 35) {
      hazardStates.push({
        id: `H_SIM_WILDLIFE_${selectedSegmentId}`,
        type: 'WILDLIFE',
        location: { lat: 10.3265, lng: 76.9515, name: SEGMENT_NAMES[selectedSegmentId] },
        affectedSegments: [selectedSegmentId],
        severity: Number((wildlifeRisk / 100).toFixed(2)),
        confidence: Number((confidence / 100).toFixed(2)),
        trend: 'stable',
        source: 'What-If Simulation Engine',
        sourceType: 'SIMULATED',
        lastUpdated: new Date().toISOString(),
      });
    }

    const roadStates: RoadState[] = [
      {
        segmentId: selectedSegmentId,
        name: SEGMENT_NAMES[selectedSegmentId],
        state: roadState,
        source: 'What-If Simulation Telemetry',
        sourceType: 'SIMULATED',
        confidence: Number((confidence / 100).toFixed(2)),
        lastUpdated: new Date().toISOString(),
      }
    ];

    return resolveProtectiveAction({
      corridorType: 'MUNNAR_VALPARAI',
      baseConfidence: Number((confidence / 100).toFixed(2)),
      hazards: hazardStates,
      roadStates,
      travelerState: {
        currentSegmentId: selectedSegmentId,
      },
      isSimulatedScenario: true,
      scenarioName: 'What-If Interactive Sandbox',
    });
  }, [selectedSegmentId, landslideRisk, floodRisk, wildlifeRisk, roadRisk, roadState, confidence]);

  const handleResetToPeak = () => {
    setSelectedSegmentId('S6');
    setSlopeDeg(38);
    setRainfall1h(26.8);
    setRainfall24h(118);
    setSoilSaturation(96);
    setWaterLevel(84);
    setWildlifeActivity(0.62);
    setRoadState('BLOCKED');
  };

  const handleResetToNominal = () => {
    setSelectedSegmentId('S1');
    setSlopeDeg(34);
    setRainfall1h(5.2);
    setRainfall24h(42);
    setSoilSaturation(66);
    setWaterLevel(31);
    setWildlifeActivity(0.22);
    setRoadState('OPEN');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Hazard What-If Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Hazard Sensitivity Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Adjust geotechnical slopes, rainfall accumulation, hydrology, wildlife activity, and roadway physical states to observe deterministic risk changes and automatic action re-evaluations.
          </p>
        </div>

        <ProvenanceBadge origin="SIMULATED" source="Deterministic Math &amp; Engine Sandbox" />
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-700">Quick Test Scenarios:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToNominal}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            06:00 Nominal Conditions
          </button>
          <button
            onClick={handleResetToPeak}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
          >
            18:00 Severe Peak (S6 Blockage)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Sensor &amp; Telemetry Inputs</span>
              <span className="text-xs font-mono font-normal text-slate-400">Deterministic Pipeline</span>
            </h3>

            {/* Segment Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Corridor Segment:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSegmentId(s)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      selectedSegmentId === s
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{s}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                      {SEGMENT_NAMES[s]?.split('→')[1] || ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rainfall 1h */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">1-Hour Rainfall (mm):</span>
                <span className="font-mono font-bold text-emerald-600">{rainfall1h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="0.5"
                value={rainfall1h}
                onChange={e => setRainfall1h(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Rainfall 24h */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">24-Hour Rainfall (mm):</span>
                <span className="font-mono font-bold text-emerald-600">{rainfall24h} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="1"
                value={rainfall24h}
                onChange={e => setRainfall24h(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Soil Saturation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Soil Saturation Percentage (%):</span>
                <span className="font-mono font-bold text-amber-600">{soilSaturation}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={soilSaturation}
                onChange={e => setSoilSaturation(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Water Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Hydrology Water Level (%):</span>
                <span className="font-mono font-bold text-sky-600">{waterLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={waterLevel}
                onChange={e => setWaterLevel(parseInt(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>

            {/* Wildlife Activity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Wildlife Activity Index (0.0 to 1.0):</span>
                <span className="font-mono font-bold text-purple-600">{wildlifeActivity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={wildlifeActivity}
                onChange={e => setWildlifeActivity(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Road State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Road State:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['OPEN', 'PARTIALLY_ACCESSIBLE', 'RESTRICTED', 'BLOCKED'] as const).map(rs => (
                  <button
                    key={rs}
                    onClick={() => setRoadState(rs)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition text-center ${
                      roadState === rs
                        ? rs === 'BLOCKED' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {rs.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Results & Deterministic Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Calculated Hazard Scores */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Calculated Component Scores</span>
              <span className="text-xs font-mono font-bold text-emerald-600">Deterministic</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Landslide Risk:</span>
                <span className={`font-mono font-bold ${landslideRisk >= 70 ? 'text-rose-600' : 'text-slate-900'}`}>{landslideRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-rose-500 h-1.5 rounded-full transition-all" style={{ width: `${landslideRisk}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600">Flood Inundation Risk:</span>
                <span className={`font-mono font-bold ${floodRisk >= 70 ? 'text-rose-600' : 'text-slate-900'}`}>{floodRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-sky-500 h-1.5 rounded-full transition-all" style={{ width: `${floodRisk}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600">Wildlife Conflict Risk:</span>
                <span className={`font-mono font-bold ${wildlifeRisk >= 50 ? 'text-purple-600' : 'text-slate-900'}`}>{wildlifeRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${wildlifeRisk}%` }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600">Road Impedance Risk:</span>
                <span className={`font-mono font-bold ${roadRisk >= 70 ? 'text-rose-600' : 'text-slate-900'}`}>{roadRisk} / 100</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${roadRisk}%` }} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Overall Multi-Hazard Risk</div>
                <div className={`text-2xl font-black ${overallRisk >= 70 ? 'text-rose-600' : overallRisk >= 40 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {overallRisk} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">Evidence Confidence</div>
                <div className="text-lg font-mono font-bold text-slate-800">
                  {confidence}%
                </div>
              </div>
            </div>
          </div>

          {/* Engine Output Directive Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Resolved Directive</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Window: ~{decisionResult.decisionWindowMinutes}m
              </span>
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-white">
                {decisionResult.actionTitle}
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {decisionResult.reasons[0] || 'Conditions evaluate within acceptable operating thresholds.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-400">Recoverability:</span>
              <span className="font-bold text-emerald-400">{decisionResult.recoverability}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
