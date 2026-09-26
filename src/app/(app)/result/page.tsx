'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { DecisionResult } from '@/lib/engine/types';
import SafetyCard from '@/components/SafetyCard';
import ActionResolutionTree from '@/components/ActionResolutionTree';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import EmergencyPanel from '@/components/EmergencyPanel';
import CrowdVerification from '@/components/CrowdVerification';
import OfflineBanner from '@/components/OfflineBanner';
import { DemoScenario, DEMO_SCENARIOS } from '@/lib/engine/actionResolution/scenarios';
import { resolveProtectiveAction } from '@/lib/engine/actionResolution/actionResolutionEngine';
import { 
  ArrowLeft, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Shield, 
  Wifi, 
  WifiOff
} from 'lucide-react';

const CorridorMap = dynamic(() => import('@/components/CorridorMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-84 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
      <Loader2 className="w-5 h-5 animate-spin mr-2 text-slate-600" />
      <span>Loading interactive mountain corridor map...</span>
    </div>
  ),
});

interface CachedPayload {
  decision: any;
  explanation: string;
  cachedAt: number;
}

const CACHE_KEY = 'travellord_offline_cache';

function ResultDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const source = searchParams.get('source') || 'S1';
  const destination = searchParams.get('destination') || 'S6';
  const tripId = searchParams.get('trip_id');
  const corridorParam = searchParams.get('corridor');
  const scenarioParam = searchParams.get('scenario');

  const [decision, setDecision] = useState<any | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [cachedAt, setCachedAt] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active scenario state
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>(scenarioParam || undefined);

  // Offline Handling State
  const [isOffline, setIsOffline] = useState(false);
  const [offlineSince, setOfflineSince] = useState<number>(Date.now());
  const [simulatedMinutesOffline, setSimulatedMinutesOffline] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Execute scenario directly through the deterministic engine
  const executeScenario = useCallback(async (scenario: DemoScenario) => {
    setRefreshing(true);
    setError(null);
    setActiveScenarioId(scenario.id);

    try {
      // Step A: Pure deterministic resolution (Zero AI)
      const res = await fetch('/api/resolve-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenario.id }),
      });

      let scenarioDecision: any;
      if (res.ok) {
        scenarioDecision = await res.json();
      } else {
        // Fallback local deterministic execution
        scenarioDecision = resolveProtectiveAction(scenario.params);
      }

      // Convert to component shape
      const formattedDecision: DecisionResult = {
        action: scenarioDecision.action,
        actionTitle: scenarioDecision.actionTitle,
        risk_score: scenarioDecision.riskScore ?? 0.5,
        confidence: scenarioDecision.confidence ?? 0.8,
        controlling_segment: scenarioDecision.controllingHazard ? {
          segment_id: scenarioDecision.controllingSegmentId,
          name: scenarioDecision.controllingHazard.location.name,
          hazard_type: scenarioDecision.controllingHazard.type,
          source: scenarioDecision.controllingHazard.source,
          severity: scenarioDecision.controllingHazard.severity,
          base_confidence: scenarioDecision.controllingHazard.confidence,
          trend: scenarioDecision.controllingHazard.trend,
          source_agreement: scenarioDecision.controllingHazard.confidence,
          data_recency: 1.0,
          historical_reliability: 0.7,
          confidence: scenarioDecision.confidence,
          risk_score: scenarioDecision.riskScore,
          action_candidate: scenarioDecision.action,
        } : {
          segment_id: scenarioDecision.controllingSegmentId || 'S1',
          name: 'Mountain Pass Checkpoint',
          hazard_type: 'landslide',
          source: 'GSI Slope Telemetry (Modeled)',
          severity: scenarioDecision.riskScore,
          base_confidence: scenarioDecision.confidence,
          trend: 'rising',
          source_agreement: 0.8,
          data_recency: 1.0,
          historical_reliability: 0.7,
          confidence: scenarioDecision.confidence,
          risk_score: scenarioDecision.riskScore,
          action_candidate: scenarioDecision.action,
        },
        segment_scores: [],
        valid_until: scenarioDecision.validUntil || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        reasons: scenarioDecision.reasons,
        rejectedActions: scenarioDecision.rejectedActions,
        decisionWindowMinutes: scenarioDecision.decisionWindowMinutes,
        decisionWindowDescription: scenarioDecision.decisionWindowDescription,
        recoverability: scenarioDecision.recoverability,
        isSimulatedScenario: true,
        scenarioName: scenario.name,
        recommendationSummary: scenarioDecision.recommendationSummary,
      };

      setDecision(formattedDecision);

      // Step B: Groq Natural Language Explanation
      const explainRes = await fetch('/api/generate-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedDecision),
      });

      let explainText = '';
      if (explainRes.ok) {
        const explainData = await explainRes.json();
        explainText = explainData.explanation;
        setExplanation(explainText);
      } else {
        setExplanation(scenarioDecision.recommendationSummary || '');
      }

      const now = Date.now();
      setCachedAt(now);

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          decision: formattedDecision,
          explanation: explainText,
          cachedAt: now,
        }));
      } catch (e) {}

    } catch (err: any) {
      console.error('Scenario execution error:', err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // 1. Fetch safety data online
  const fetchSafetyData = useCallback(async (isSilentRefresh = false) => {
    if (scenarioParam) {
      const targetScenario = DEMO_SCENARIOS.find(s => s.id === scenarioParam);
      if (targetScenario) {
        executeScenario(targetScenario);
        return;
      }
    }

    if (typeof window !== 'undefined' && !navigator.onLine && !isOffline) {
      setIsOffline(true);
      return;
    }

    if (!isSilentRefresh) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const resolveRes = await fetch('/api/resolve-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination }),
      });

      if (!resolveRes.ok) {
        const errJson = await resolveRes.json().catch(() => ({}));
        throw new Error(errJson.error || `Safety engine error: HTTP ${resolveRes.status}`);
      }

      const decisionData: DecisionResult = await resolveRes.json();
      setDecision(decisionData);

      const explainRes = await fetch('/api/generate-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decisionData),
      });

      let explainText = '';
      if (explainRes.ok) {
        const explainData = await explainRes.json();
        explainText = explainData.explanation;
        setExplanation(explainText);
      }

      const now = Date.now();
      setCachedAt(now);

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          decision: decisionData,
          explanation: explainText,
          cachedAt: now,
        }));
      } catch (e) {}

    } catch (err: any) {
      console.error('Safety evaluation network error:', err);
      const cached = loadFromCache();
      if (!cached) {
        setError(err.message || 'Failed to compute route safety advisory.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [source, destination, isOffline, scenarioParam, executeScenario]);

  const loadFromCache = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed: CachedPayload = JSON.parse(raw);
        setDecision(parsed.decision);
        setExplanation(parsed.explanation);
        setCachedAt(parsed.cachedAt);
        return true;
      }
    } catch (e) {}
    return false;
  }, []);

  // Online / Offline Listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
      setOfflineSince(Date.now());
      loadFromCache();
    }

    const handleOnline = () => {
      setIsOffline(false);
      setSimulatedMinutesOffline(0);
      fetchSafetyData();
    };

    const handleOffline = () => {
      setIsOffline(true);
      setOfflineSince(Date.now());
      loadFromCache();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, [fetchSafetyData, loadFromCache]);

  useEffect(() => {
    fetchSafetyData();
  }, [fetchSafetyData]);

  let displayedConfidence = decision?.confidence ?? 0;
  if (isOffline && decision) {
    const elapsedRealMinutes = Math.max(0, (currentTime - cachedAt) / (60 * 1000));
    const effectiveElapsedMinutes = elapsedRealMinutes + simulatedMinutesOffline;
    const decaySteps = Math.floor(effectiveElapsedMinutes / 30);
    const decayPoints = decaySteps * 0.10;
    displayedConfidence = Math.max(0, Number((decision.confidence - decayPoints).toFixed(4)));
  }

  const handleToggleSimulateOffline = () => {
    if (!isOffline) {
      setIsOffline(true);
      setOfflineSince(Date.now());
      loadFromCache();
    } else {
      setIsOffline(false);
      setSimulatedMinutesOffline(0);
      fetchSafetyData();
    }
  };

  if (loading && !decision) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md mb-4">
          <Shield className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Resolving Protective Action...</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Processing interacting slope hazards, active wildlife corridors, and road access constraints.
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Executing deterministic constraint gates (Zero AI override)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Route / Parameters</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            id="simulate-offline-btn"
            onClick={handleToggleSimulateOffline}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition ${
              isOffline
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-700" /> : <Wifi className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isOffline ? 'Simulating Dead Zone' : 'Simulate Dead Zone'}</span>
          </button>

          <button
            onClick={() => fetchSafetyData(true)}
            disabled={refreshing || isOffline}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl shadow-2xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{refreshing ? 'Re-evaluating...' : 'Re-evaluate'}</span>
          </button>
        </div>
      </div>

      {/* Demo Scenario Controller Bar (Task 14, 15, 31) */}
      <ScenarioSimulator
        onScenarioSelect={executeScenario}
        activeScenarioId={activeScenarioId}
        isExecuting={refreshing}
      />

      {/* Persistent Offline Banner */}
      {isOffline && (
        <div className="space-y-3">
          <OfflineBanner
            offlineSince={offlineSince}
            cachedAt={cachedAt}
            onReconnectAttempt={() => fetchSafetyData(true)}
            isReconnecting={refreshing}
          />

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xs">
            <span className="text-slate-500 font-medium">Simulate Elapsed Ghat Dead Zone Time:</span>
            <div className="flex items-center gap-2">
              <button
                id="btn-add-30m"
                onClick={() => setSimulatedMinutesOffline(prev => prev + 30)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition"
              >
                +30 min (-10%)
              </button>
              <button
                id="btn-add-60m"
                onClick={() => setSimulatedMinutesOffline(prev => prev + 60)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition"
              >
                +60 min (-20%)
              </button>
              <button
                id="btn-add-150m"
                onClick={() => setSimulatedMinutesOffline(prev => prev + 150)}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 transition"
              >
                +150 min (Drop &lt;40%)
              </button>
              <button
                id="btn-reset-time"
                onClick={() => setSimulatedMinutesOffline(0)}
                className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition text-[11px]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {error && !isOffline && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to complete live evaluation</p>
            <p className="mt-0.5">{error}</p>
            <button
              onClick={() => fetchSafetyData()}
              className="mt-2 text-xs font-bold underline hover:text-rose-950"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Decision-First Safety Card */}
      {decision && (
        <>
          <SafetyCard
            action={decision.action}
            actionTitle={decision.actionTitle}
            riskScore={decision.risk_score}
            confidence={decision.confidence}
            displayedConfidence={displayedConfidence}
            controllingSegment={decision.controlling_segment}
            explanation={explanation}
            validUntil={decision.valid_until}
            isOffline={isOffline}
            cachedAt={cachedAt}
            reasons={decision.reasons}
            rejectedActions={decision.rejectedActions}
            decisionWindowMinutes={decision.decisionWindowMinutes}
            decisionWindowDescription={decision.decisionWindowDescription}
            recoverability={decision.recoverability}
            isSimulatedScenario={decision.isSimulatedScenario}
            scenarioName={decision.scenarioName}
          />

          {/* Signature Action Resolution Visual Tree (Task 32) */}
          <ActionResolutionTree
            selectedAction={decision.actionTitle || decision.action}
            actionTitle={decision.actionTitle}
            rejectedActions={decision.rejectedActions}
            reasons={decision.reasons}
            decisionWindowMinutes={decision.decisionWindowMinutes}
            recoverability={decision.recoverability}
          />

          {/* Interactive Mountain Corridor Map */}
          <CorridorMap
            segmentScores={decision.segment_scores}
            controllingSegmentId={decision.controlling_segment.segment_id}
            corridorName={decision.scenarioName?.includes('Munnar') ? 'Munnar–Valparai High Range Corridor' : 'NH-766 Wayanad Mountain Pass'}
          />

          {/* Crowd Verification Section */}
          {!isOffline ? (
            <CrowdVerification
              segmentId={decision.controlling_segment.segment_id}
              segmentName={decision.controlling_segment.name}
              onVerificationSubmitted={async () => {
                await fetchSafetyData(true);
              }}
            />
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 text-center">
              Crowd reporting is queued while in mountain dead zones. Connect to network to submit verified road conditions.
            </div>
          )}

          {/* Emergency Helplines & GPS Broadcast (Task 23) */}
          <EmergencyPanel />
        </>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
      </div>
    }>
      <ResultDashboard />
    </Suspense>
  );
}
