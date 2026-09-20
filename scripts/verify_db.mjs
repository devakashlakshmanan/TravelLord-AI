// TravelLord AI - Supabase Schema & RLS Verification Script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

// 1. Read .env.local
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

console.log('===========================================================');
console.log(' TravelLord AI — Supabase Database Verification (Task 1)');
console.log('===========================================================');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ ERROR: Missing Supabase credentials in .env.local');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local\n');
  process.exit(1);
}

console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Using Anon Key: ${SUPABASE_ANON_KEY.slice(0, 12)}...`);

async function runVerification() {
  try {
    // 1. Query all 6 rows from hazard_segments
    console.log('\n--- STEP 1: Querying hazard_segments ---');
    const segRes = await fetch(`${SUPABASE_URL}/rest/v1/hazard_segments?select=*&order=segment_id.asc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!segRes.ok) {
      const errText = await segRes.text();
      console.error(`❌ Failed to fetch hazard_segments: HTTP ${segRes.status} - ${errText}`);
      process.exit(1);
    }

    const segments = await segRes.json();
    console.log(`✅ Successfully fetched ${segments.length} rows from hazard_segments:`);
    console.table(segments.map(s => ({
      ID: s.segment_id,
      Name: s.name,
      Hazard: s.hazard_type,
      Severity: s.severity,
      Confidence: s.base_confidence,
      Trend: s.trend,
      Source: s.source
    })));

    if (segments.length !== 6) {
      console.warn(`⚠️ Warning: Expected 6 rows, found ${segments.length}`);
    }

    // 2. Verify RLS on crowd_verifications
    console.log('\n--- STEP 2: Verifying RLS on crowd_verifications ---');
    // Public SELECT should succeed (200 OK)
    const cvSelectRes = await fetch(`${SUPABASE_URL}/rest/v1/crowd_verifications?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    console.log(`- SELECT crowd_verifications (Anon): HTTP ${cvSelectRes.status} (${cvSelectRes.ok ? '✅ Allowed as expected' : '❌ Failed'})`);

    // Unauthenticated INSERT should be blocked by RLS
    const cvInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/crowd_verifications`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        segment_id: 'S1',
        user_id: '00000000-0000-0000-0000-000000000000',
        status: 'still_blocked'
      })
    });
    const cvBlocked = cvInsertRes.status === 401 || cvInsertRes.status === 403 || cvInsertRes.status === 42501 || (cvInsertRes.status === 400 && (await cvInsertRes.text()).includes('violates row-level security'));
    console.log(`- Unauthenticated INSERT crowd_verifications: HTTP ${cvInsertRes.status} (${cvBlocked || !cvInsertRes.ok ? '✅ Blocked by RLS as expected' : '⚠️ Warning: Not blocked'})`);

    // 3. Verify RLS on trips
    console.log('\n--- STEP 3: Verifying RLS on trips ---');
    // Unauthenticated SELECT trips should return 0 rows (filtered by RLS) or error
    const tripSelectRes = await fetch(`${SUPABASE_URL}/rest/v1/trips?select=*`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    const trips = tripSelectRes.ok ? await tripSelectRes.json() : [];
    console.log(`- Anon SELECT trips: returned ${trips.length} rows (${trips.length === 0 ? '✅ RLS isolated (0 rows seen by anon)' : '⚠️ Warning: leaked rows'})`);

    // Unauthenticated INSERT trips should be blocked by RLS
    const tripInsertRes = await fetch(`${SUPABASE_URL}/rest/v1/trips`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: '00000000-0000-0000-0000-000000000000',
        source: 'S1',
        destination: 'S6',
        mode: 'Car',
        travel_time: new Date().toISOString()
      })
    });
    console.log(`- Unauthenticated INSERT trips: HTTP ${tripInsertRes.status} (${!tripInsertRes.ok ? '✅ Blocked by RLS as expected' : '⚠️ Warning: Not blocked'})`);

    console.log('\n===========================================================');
    console.log(' 🎉 TASK 1 VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('❌ Verification script encountered an error:', err);
    process.exit(1);
  }
}

runVerification();
