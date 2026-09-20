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

const GROQ_SYSTEM_PROMPT = `You are a safety communication assistant for a travel safety app. You will be given a structured JSON object containing a hazard segment name, hazard type, a risk score, a confidence score, and a recommended action that has ALREADY been decided by a separate rule-based system. Your ONLY job is to write a short (2-3 sentence), clear, calm explanation for the traveler in plain English, based STRICTLY on the numbers given. Rules: Do NOT change, question, or reinterpret the action given. Do NOT invent any facts, numbers, times, or hazards not present in the input JSON. If the action is 'INSUFFICIENT_DATA', clearly say the system does not have enough reliable information right now, and do not guess what might be happening. Keep tone calm and direct, never alarmist. Output plain text only, no markdown, no lists.`;

async function testBothPayloads() {
  const payload1 = {
    segment_name: "Adivaram to Chooralmala",
    hazard_type: "landslide",
    risk_score: 0.9156,
    confidence_score: 0.7952,
    recommended_action: "Turn Back / Divert",
    trend: "rising",
    source: "GSI susceptibility zone (Modeled)"
  };

  const payload2 = {
    segment_name: "Muthanga Wildlife Corridor",
    hazard_type: "wildlife",
    risk_score: 0.225,
    confidence_score: 0.25,
    recommended_action: "INSUFFICIENT_DATA",
    trend: "falling",
    source: "Forest dept corridor map (Simulated)"
  };

  for (const model of ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b']) {
    console.log(`\n=================== MODEL: ${model} ===================`);
    for (const [name, p] of Object.entries({ 'HIGH RISK': payload1, 'INSUFFICIENT DATA': payload2 })) {
      const res = await groq.chat.completions.create({
        model,
        temperature: 0.3,
        max_tokens: 200,
        messages: [
          { role: 'system', content: GROQ_SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(p, null, 2) }
        ]
      });
      console.log(`[${name}]:`, res.choices[0]?.message?.content?.trim());
    }
  }
}

testBothPayloads();
