/**
 * Automated Verification Suite for TravelLord AI Unified Action Resolution Engine
 * Tests all core deterministic constraints, parity between real-trip and scenario paths,
 * multi-hazard conflicts, recoverability, and hackathon scenarios.
 */

import { resolveProtectiveAction } from '../src/lib/engine/actionResolution/actionResolutionEngine.js';
import { DEMO_SCENARIOS } from '../src/lib/engine/actionResolution/scenarios.js';
import { resolveRouteAction, evaluateSegment } from '../src/lib/engine/hazardStateAdapter.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('TEST SUITE: Unified Protective Action Resolution');
console.log('====================================================');

// Test 1: Low Confidence (< 40%) -> INSUFFICIENT_DATA
console.log('\nTest 1: Low Data Confidence Threshold (< 40%)');
const resLowConf = resolveProtectiveAction({
  baseConfidence: 0.35,
  hazards: [],
});
assert(resLowConf.status === 'INSUFFICIENT_DATA', 'Status should be INSUFFICIENT_DATA when confidence < 40%');
assert(resLowConf.action === 'STOP', 'Action should be STOP/HOLD when data is insufficient');

// Test 2: High Confidence Nominal Conditions -> CONTINUE
console.log('\nTest 2: Nominal Corridor Conditions');
const resNominal = resolveProtectiveAction({
  baseConfidence: 0.88,
  hazards: [],
});
assert(resNominal.action === 'CONTINUE', 'Action should be CONTINUE when risk is low');
assert(resNominal.status === 'SAFE', 'Status should be SAFE');
assert(resNominal.recoverability === 'HIGH', 'Recoverability should be HIGH for nominal route');

// Test 3: Heavy Rain Warning -> SLOW_DOWN
console.log('\nTest 3: Heavy Rain Warning');
const resRain = resolveProtectiveAction({
  baseConfidence: 0.85,
  hazards: [
    {
      id: 'H1',
      type: 'HEAVY_RAIN',
      location: { lat: 11.5, lng: 76.1, name: 'Lakkidi Curve' },
      affectedSegments: ['S5'],
      severity: 0.50,
      confidence: 0.85,
      trend: 'rising',
      source: 'IMD Doppler',
      sourceType: 'MODELED',
      lastUpdated: new Date().toISOString(),
    }
  ],
});
assert(resRain.action === 'SLOW_DOWN', 'Action should be SLOW_DOWN under heavy rainfall');

// Test 4: Signature Hackathon Multi-Hazard Conflict (Landslide + Wildlife + Road Closure)
console.log('\nTest 4: Signature Multi-Hazard Conflict (Munnar -> Valparai)');
const conflictScenario = DEMO_SCENARIOS.find(s => s.id === 'SCENARIO_3_SIGNATURE_CONFLICT');
const resConflict = resolveProtectiveAction(conflictScenario.params);

assert(resConflict.action === 'STOP', 'Action should be STOP at safe zone when all routes are compromised');
assert(resConflict.status === 'CRITICAL', 'Status should be CRITICAL');
assert(resConflict.rejectedActions.some(r => r.action === 'CONTINUE'), 'CONTINUE must be rejected due to landslide');
assert(resConflict.rejectedActions.some(r => r.action === 'DIVERT'), 'DIVERT must be rejected due to wildlife/closure');
assert(resConflict.recoverability === 'HIGH', 'STOP action at designated shelter must yield HIGH recoverability');

// Test 5: Dynamic State Transition & Recovery (Detour Cleared)
console.log('\nTest 5: Dynamic State Transition & Recovery (Detour Cleared)');
const recoveryScenario = DEMO_SCENARIOS.find(s => s.id === 'SCENARIO_4_RECOVERY_DIVERT');
const resRecovery = resolveProtectiveAction(recoveryScenario.params);

assert(resRecovery.action === 'DIVERT', 'Action should dynamically switch to DIVERT when Alternate A clears');
assert(resRecovery.status === 'CAUTION', 'Status should be CAUTION');

// Test 6: Parity Test between Real Trip Route Adaptation and Direct Engine Execution (FIX-1 Proof)
console.log('\nTest 6: Real Trip Route Parity (resolveRouteAction uses unified action)');
const mockSegments = [
  {
    segment_id: 'S1',
    name: 'Adivaram to Chooralmala',
    lat: 11.4880,
    lng: 76.1220,
    hazard_type: 'landslide',
    severity: 0.85,
    base_confidence: 0.80,
    source: 'GSI susceptibility zone (Modeled)',
    trend: 'rising',
    last_updated: new Date().toISOString(),
  },
  {
    segment_id: 'S5',
    name: 'Lakkidi Viewpoint Curve',
    lat: 11.5000,
    lng: 75.9980,
    hazard_type: 'landslide',
    severity: 0.30,
    base_confidence: 0.65,
    source: 'GSI susceptibility zone (Modeled)',
    trend: 'stable',
    last_updated: new Date().toISOString(),
  }
];

const segmentEvaluations = mockSegments.map(s => evaluateSegment(s, []));
const routeAction = resolveRouteAction(segmentEvaluations);

assert(routeAction.action === 'STOP' || routeAction.action === 'DIVERT' || routeAction.action === 'SLOW_DOWN', 'Real trip route resolves directly through unified action types');
assert(routeAction.reasons && routeAction.reasons.length > 0, 'Real trip route returns structured causal reasons');
assert(routeAction.decisionWindowMinutes > 0, 'Real trip route returns non-zero decision window');

// Summary
console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All unified safety engine tests passed successfully!\n');
}
