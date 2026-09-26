import { 
  calculateLandslideRisk,
  calculateFloodRisk,
  calculateWildlifeRisk,
  calculateRoadRisk,
  calculateOverallRisk,
  calculateEvidenceConfidence,
  calculateRiskTrend,
  buildReplaySnapshot,
  generateFullReplayTimeline,
  RAW_SYNTHETIC_REPLAY_DATASET,
  REPLAY_TIMESTAMPS
} from '../src/lib/replay/syntheticReplay.ts';

console.log('====================================================');
console.log('TEST SUITE: Synthetic Replay & Deterministic Engine');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

// -------------------------------------------------------------
// Test 1: Mathematical Landslide Risk Calculation
// -------------------------------------------------------------
console.log('Test 1: Landslide Risk Calculation');
const lsResult1 = calculateLandslideRisk(34, 42, 5.2);
// Signal = 0.15 + 0.004*34 + 0.0025*42 + 0.003*5.2 = 0.15 + 0.136 + 0.105 + 0.0156 = 0.4066
// Risk = 100 * (0.45 * 0.4066 + 0.35 * (5.2/30) + 0.20 * (42/140))
//      = 100 * (0.18297 + 0.06067 + 0.06) = 30.36
assert(lsResult1.risk >= 28 && lsResult1.risk <= 32, `S1 06:00 Landslide Risk is ~30 (got ${lsResult1.risk})`);

const lsResultPeak = calculateLandslideRisk(38, 118, 26.8);
assert(lsResultPeak.risk >= 75, `S6 18:00 Peak Landslide Risk is >= 75 (got ${lsResultPeak.risk})`);

// -------------------------------------------------------------
// Test 2: Flood Risk Calculation
// -------------------------------------------------------------
console.log('\nTest 2: Flood Risk Calculation');
const flResult1 = calculateFloodRisk(31, 42);
// 100 * (0.55 * 0.31 + 0.45 * (42/160)) = 100 * (0.1705 + 0.1181) = 28.9
assert(flResult1 >= 26 && flResult1 <= 30, `S1 06:00 Flood Risk is ~29 (got ${flResult1})`);

const flResultPeak = calculateFloodRisk(84, 118);
assert(flResultPeak >= 75 && flResultPeak <= 85, `S6 18:00 Peak Flood Risk is ~79 (got ${flResultPeak})`);

// -------------------------------------------------------------
// Test 3: Wildlife Risk & Road Risk Mappings
// -------------------------------------------------------------
console.log('\nTest 3: Wildlife & Road Risk Mappings');
const wlResult = calculateWildlifeRisk(0.62);
assert(wlResult === 62, `Wildlife activity 0.62 maps to 62 (got ${wlResult})`);

assert(calculateRoadRisk('OPEN') === 0, 'Road OPEN maps to 0');
assert(calculateRoadRisk('PARTIALLY_ACCESSIBLE') === 45, 'Road PARTIALLY_ACCESSIBLE maps to 45');
assert(calculateRoadRisk('RESTRICTED') === 70, 'Road RESTRICTED maps to 70');
assert(calculateRoadRisk('BLOCKED') === 100, 'Road BLOCKED maps to 100');

// -------------------------------------------------------------
// Test 4: Overall Risk Derivation
// -------------------------------------------------------------
console.log('\nTest 4: Overall Risk Derivation');
// Overall = 0.40 * Landslide + 0.20 * Flood + 0.15 * Wildlife + 0.25 * Road
const overallPeak = calculateOverallRisk(85, 77, 62, 100);
// 0.40*85 + 0.20*77 + 0.15*62 + 0.25*100 = 34 + 15.4 + 9.3 + 25 = 83.7
assert(overallPeak >= 82 && overallPeak <= 86, `Overall Risk at S6 18:00 is ~84 (got ${overallPeak})`);

// -------------------------------------------------------------
// Test 5: Confidence Calculation (Evidence Quality)
// -------------------------------------------------------------
console.log('\nTest 5: Confidence Calculation Independence');
const conf = calculateEvidenceConfidence(100, 92, 88);
assert(conf >= 90 && conf <= 96, `Evidence confidence is high and independent of danger (got ${conf})`);

// -------------------------------------------------------------
// Test 6: Trend Calculation (+8 / -8 thresholds)
// -------------------------------------------------------------
console.log('\nTest 6: Trend Calculation');
assert(calculateRiskTrend(55, 40) === 'RISING', 'Delta +15 produces RISING');
assert(calculateRiskTrend(40, 55) === 'FALLING', 'Delta -15 produces FALLING');
assert(calculateRiskTrend(42, 40) === 'STABLE', 'Delta +2 produces STABLE');

// -------------------------------------------------------------
// Test 7: Dataset Timeline Progression Across All 5 Steps
// -------------------------------------------------------------
console.log('\nTest 7: Replay Timeline Progression');
const { snapshots, events } = generateFullReplayTimeline();
assert(snapshots.length === 5, 'Timeline contains exactly 5 observation steps');
assert(events.length === 5, 'Timeline contains exactly 5 decision events');

const snap06 = snapshots[0];
const snap18 = snapshots[4];

assert(snap06.timeLabel === '06:00', 'Step 1 is 06:00');
assert(snap06.corridorRisk < 35, `06:00 Corridor Risk is low (got ${snap06.corridorRisk})`);
assert(snap06.decisionResult.action === 'CONTINUE', '06:00 Decision is CONTINUE');

assert(snap18.timeLabel === '18:00', 'Step 5 is 18:00');
assert(snap18.corridorRisk >= 75, `18:00 Corridor Risk is high (got ${snap18.corridorRisk})`);
assert(snap18.roadStateSummary === 'BLOCKED', '18:00 Corridor Road State is BLOCKED');
assert(
  ['STOP', 'STOP_AT_SAFE_ZONE', 'TURN_BACK', 'SEEK_SHELTER', 'DIVERT'].includes(snap18.decisionResult.action),
  `18:00 Decision halts travel safely (got ${snap18.decisionResult.action})`
);

// -------------------------------------------------------------
// Test 8: Data Authenticity & Provenance
// -------------------------------------------------------------
console.log('\nTest 8: Data Authenticity & Provenance');
const allSimulated = RAW_SYNTHETIC_REPLAY_DATASET.every(r => r.data_origin === 'SIMULATED_REPLAY');
const allNotLive = RAW_SYNTHETIC_REPLAY_DATASET.every(r => r.source_status === 'SYNTHETIC_NOT_LIVE');

assert(allSimulated, 'Every dataset row is explicitly marked SIMULATED_REPLAY');
assert(allNotLive, 'Every dataset row is explicitly marked SYNTHETIC_NOT_LIVE');

// Coordinate verification (ensure S6 longitude is 76.9515 not typo 77.9515)
const s6Rows = RAW_SYNTHETIC_REPLAY_DATASET.filter(r => r.segment_id === 'S6');
const validLongitudes = s6Rows.every(r => r.longitude >= 76.9 && r.longitude <= 77.0);
assert(validLongitudes, 'S6 longitudes are all verified at 76.9515 (no coordinate errors)');

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests} Passed, ${totalTests - passedTests} Failed`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
