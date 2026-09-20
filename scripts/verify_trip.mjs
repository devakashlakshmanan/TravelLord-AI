import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

const env = {};
const envContent = fs.readFileSync(envPath, 'utf8');
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkTripAsUser() {
  console.log('Authenticating as driver_wayanad_101@gmail.com to respect RLS...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'driver_wayanad_101@gmail.com',
    password: 'Safety12345!',
  });

  if (authError) {
    console.error('Auth error:', authError.message);
    return;
  }

  console.log(`Authenticated as user ID: ${authData.user.id}`);
  
  const tripId = '6e6efbca-4553-47f3-86f5-b5a08e193f89';
  console.log(`Querying trips table for trip_id: ${tripId}...`);

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();

  if (error) {
    console.error('Error fetching trip:', error.message);
  } else {
    console.log('\n✅ Successfully queried trip from Supabase trips table under active RLS:');
    console.table([data]);
    console.log('\nFull JSON Record:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkTripAsUser();
