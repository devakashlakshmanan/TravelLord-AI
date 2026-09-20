import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

const envContent = fs.readFileSync(envPath, 'utf8');
const key = envContent.match(/GROQ_API_KEY=(.*)/)[1].trim();
const groq = new Groq({ apiKey: key });

async function testResponse() {
  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
  for (const model of models) {
    try {
      console.log(`\nTesting ${model}...`);
      const res = await groq.chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: 150,
        messages: [
          { role: 'system', content: 'You are a safety assistant. Explain that travel is safe in 2 sentences.' },
          { role: 'user', content: 'Road is clear.' }
        ]
      });
      console.log(`Result from ${model}:`, res.choices[0]?.message?.content);
    } catch (e) {
      console.log(`Error ${model}:`, e.message);
    }
  }
}

testResponse();
