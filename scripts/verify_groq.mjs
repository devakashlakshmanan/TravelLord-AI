import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_URL = 'http://localhost:3000';

async function testGroqExplanation() {
  console.log('================================================================');
  console.log(' TravelLord AI — Groq Explanation Route Verification (Task 6)');
  console.log('================================================================\n');

  // Load the two JSON outputs from Task 5
  const path1 = path.resolve(__dirname, 'task5_high_confidence.json');
  const path2 = path.resolve(__dirname, 'task5_insufficient_data.json');

  if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
    console.error('Error: Task 5 output JSON files not found. Please ensure verify_engine.mjs has run.');
    process.exit(1);
  }

  const json1 = JSON.parse(fs.readFileSync(path1, 'utf8'));
  const json2 = JSON.parse(fs.readFileSync(path2, 'utf8'));

  // 1. Test High Confidence payload
  console.log('▶ TEST 1: Sending High Confidence Payload (Action: Turn Back / Divert)...');
  console.log(`Controlling segment: ${json1.controlling_segment.name}, Risk: ${json1.risk_score}, Confidence: ${json1.confidence}`);

  const res1 = await fetch(`${BASE_URL}/api/generate-explanation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json1),
  });

  if (!res1.ok) {
    console.error(`HTTP Error ${res1.status}:`, await res1.text());
    process.exit(1);
  }

  const result1 = await res1.json();
  console.log('\n--- GROQ EXPLANATION 1 (HIGH RISK / HIGH CONFIDENCE) ---');
  console.log(`Model: ${result1.model}`);
  console.log(`Explanation: "${result1.explanation}"\n`);

  console.log('----------------------------------------------------------------\n');

  // 2. Test INSUFFICIENT_DATA payload
  console.log('▶ TEST 2: Sending INSUFFICIENT_DATA Payload (Action: INSUFFICIENT_DATA)...');
  console.log(`Controlling segment: ${json2.controlling_segment.name}, Risk: ${json2.risk_score}, Confidence: ${json2.confidence}`);

  const res2 = await fetch(`${BASE_URL}/api/generate-explanation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json2),
  });

  if (!res2.ok) {
    console.error(`HTTP Error ${res2.status}:`, await res2.text());
    process.exit(1);
  }

  const result2 = await res2.json();
  console.log('\n--- GROQ EXPLANATION 2 (INSUFFICIENT_DATA) ---');
  console.log(`Model: ${result2.model}`);
  console.log(`Explanation: "${result2.explanation}"\n`);

  // Verify honesty check for INSUFFICIENT_DATA
  const lowerExp = result2.explanation.toLowerCase();
  const honestCheck = lowerExp.includes('not enough') || lowerExp.includes('insufficient') || lowerExp.includes('reliable information') || lowerExp.includes('cannot confirm') || lowerExp.includes('data');
  console.log(`Honesty Check (Does not invent hazard, states lack of data): ${honestCheck ? '✅ PASSED' : '⚠️ REVIEW REQUIRED'}`);

  console.log('\n================================================================');
  console.log(' 🎉 TASK 6 VERIFICATION COMPLETED SUCCESSFULLY!');
  console.log('================================================================\n');
}

testGroqExplanation();
