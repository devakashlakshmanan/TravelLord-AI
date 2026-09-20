import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are 'Plan Assist', a helpful guide inside TravelLord AI, a travel safety app for the NH-766 Wayanad corridor in Kerala, India. You help travelers understand hazard types, safety tips, emergency contacts, and how the app works. You must NEVER invent, estimate, or imply a specific current hazard risk level, safety action (like continue/wait/divert), or confidence score for any road segment — that information can only come from the app's Trip Planner, which uses verified data and fixed calculations, not general knowledge. If a user asks whether it is currently safe to travel, or asks about live conditions, tell them clearly and politely to check the Trip Planner page for the real, up-to-date recommendation, and briefly explain that only that page uses live-checked data. You may freely discuss general safety knowledge, hazard education, and how the app's features work. Keep answers concise and friendly.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    // Format conversation history
    const conversationMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-8).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content),
      })),
    ];

    // Priority model: llama-3.3-70b-versatile, with graceful fallback to available models
    const candidateModels = ['llama-3.3-70b-versatile', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
    let reply = '';
    let usedModel = candidateModels[0];

    for (const model of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.4,
          max_tokens: 300,
          messages: conversationMessages as any,
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (content) {
          reply = content;
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

    if (!reply) {
      reply = 'I am your Plan Assist guide. For verified, live route recommendations, please visit the Trip Planner page.';
    }

    return NextResponse.json({
      reply,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/chat-assist:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate assistant response.' },
      { status: 500 }
    );
  }
}
