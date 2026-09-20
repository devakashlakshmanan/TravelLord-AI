import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const GROQ_SYSTEM_PROMPT = `You are a safety communication assistant for a travel safety app. You will be given a structured JSON object containing a hazard segment name, hazard type, a risk score, a confidence score, and a recommended action that has ALREADY been decided by a separate rule-based system. Your ONLY job is to write a short (2-3 sentence), clear, calm explanation for the traveler in plain English, based STRICTLY on the numbers given. Rules: Do NOT change, question, or reinterpret the action given. Do NOT invent any facts, numbers, times, or hazards not present in the input JSON. If the action is 'INSUFFICIENT_DATA', clearly say the system does not have enough reliable information right now, and do not guess what might be happening. Keep tone calm and direct, never alarmist. Output plain text only, no markdown, no lists.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, risk_score, confidence, controlling_segment } = body;

    if (!action || risk_score === undefined || confidence === undefined) {
      return NextResponse.json(
        { error: 'Invalid payload: action, risk_score, and confidence are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const promptPayload = {
      segment_name: controlling_segment?.name || 'Corridor checkpoint',
      hazard_type: controlling_segment?.hazard_type || 'unspecified hazard',
      risk_score: risk_score,
      confidence_score: confidence,
      recommended_action: action,
      trend: controlling_segment?.trend || 'stable',
      source: controlling_segment?.source || 'Modeled bulletin',
    };

    // Primary model specified by prompt; fallback to available high-parameter model on Groq if model_not_found
    const candidateModels = ['llama-3.3-70b-versatile', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
    let explanation = '';
    let usedModel = candidateModels[0];

    for (const model of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.3,
          max_tokens: 150,
          messages: [
            {
              role: 'system',
              content: GROQ_SYSTEM_PROMPT,
            },
            {
              role: 'user',
              content: JSON.stringify(promptPayload, null, 2),
            },
          ],
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (content) {
          explanation = content;
          usedModel = model;
          break;
        }
      } catch (err: any) {
        if (err.status === 404 || err.code === 'model_not_found' || err.status === 400) {
          continue;
        } else {
          throw err;
        }
      }
    }

    // Fallback safety string if API network fails
    if (!explanation) {
      if (action === 'INSUFFICIENT_DATA') {
        explanation = 'The system does not have enough reliable information right now to evaluate this corridor segment. Please proceed with standard caution and follow posted local signage.';
      } else {
        explanation = `The safety system has evaluated ${promptPayload.segment_name} with a risk score of ${risk_score} and confidence of ${confidence}. The recommended action is to ${action}.`;
      }
    }

    return NextResponse.json({
      explanation,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Error calling Groq API in /api/generate-explanation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate explanation from Groq API.' },
      { status: 500 }
    );
  }
}
