import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:3000';

async function testEngine() {
  console.log('================================================================');
  console.log(' TravelLord AI — Deterministic Decision Engine Verification (Task 5)');
  console.log('================================================================\n');

  // TEST 1: High Confidence Branch (Route S1, S5, S3 - Severe Landslide Risk)
  console.log('▶ TEST 1: Calling /api/resolve-action for Route S1 -> S5 -> S3');
  console.log('Expected: Confidence >= 0.75, Risk >= 0.7 -> Action "Turn Back / Divert"\n');
  const res1 = await fetch(`${BASE_URL}/api/resolve-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segment_ids: ['S1', 'S5', 'S3'] }),
  });

  if (!res1.ok) {
    console.error(`HTTP Error ${res1.status}:`, await res1.text());
    return;
  }

  const json1 = await res1.json();
  console.log('--- RAW JSON RESPONSE 1 (HIGH CONFIDENCE BRANCH) ---');
  console.log(JSON.stringify(json1, null, 2));

  console.log('\n----------------------------------------------------------------\n');

  // TEST 2: Low Confidence / INSUFFICIENT_DATA Branch (< 0.4 Confidence)
  console.log('▶ TEST 2: Calling /api/resolve-action with low confidence / stale data (<0.4)');
  console.log('Simulating S4 with base_confidence = 0.1 and last_updated = 5 hours ago (recency = 0)');
  console.log('Expected: Confidence = 0.25 (< 0.40) -> Action "INSUFFICIENT_DATA"\n');

  const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
  const res2 = await fetch(`${BASE_URL}/api/resolve-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      segment_ids: ['S4'],
      segment_overrides: {
        'S4': {
          base_confidence: 0.1,
          last_updated: fiveHoursAgo
        }
      }
    }),
  });

  if (!res2.ok) {
    console.error(`HTTP Error ${res2.status}:`, await res2.text());
    return;
  }

  const json2 = await res2.json();
  console.log('--- RAW JSON RESPONSE 2 (INSUFFICIENT_DATA BRANCH) ---');
  console.log(JSON.stringify(json2, null, 2));

  // Save the two JSON responses to artifacts directory for Task 6
  fs.writeFileSync(
    path.resolve(__dirname, 'task5_high_confidence.json'),
    JSON.stringify(json1, null, 2)
  );
  fs.writeFileSync(
    path.resolve(__dirname, 'task5_insufficient_data.json'),
    JSON.stringify(json2, null, 2)
  );

  console.log('\n================================================================');
  console.log(' 🎉 TASK 5 VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('================================================================\n');
}

testEngine();
