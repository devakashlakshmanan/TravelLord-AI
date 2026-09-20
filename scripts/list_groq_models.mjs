import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

const envContent = fs.readFileSync(envPath, 'utf8');
const key = envContent.match(/GROQ_API_KEY=(.*)/)[1].trim();

async function listModels() {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  if (data.data) {
    console.log('Available Groq models:');
    data.data.forEach(m => console.log(' -', m.id));
  } else {
    console.log('Response:', data);
  }
}

listModels();
