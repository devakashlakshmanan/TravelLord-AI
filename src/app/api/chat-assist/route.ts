import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are 'Plan Assist', the educational and situational guide inside TravelLord AI (Multi-Hazard Awareness and Protective Action Resolution System).

Your role:
1. Explain what hazard warnings mean (landslide slope saturation, flash floods, wildlife crossing corridors, road closures).
2. Explain the Protective Action Resolution philosophy: why the system recommends ONE executable action (CONTINUE, SLOW DOWN, STOP, WAIT, TURN BACK, DIVERT, SEEK SHELTER, CONTACT HELP) instead of just an arbitrary risk score.
3. Explain why dangerous alternate detours are rejected (secondary wildlife conflict, unpaved closure traps, low recoverability).
4. Explain Data Confidence, Offline Decay, and data provenance (Authoritative vs Modeled vs Crowd vs Simulated).
5. Guide travelers on mountain emergency preparedness, what survival gear to carry in the Western Ghats, and emergency helpline numbers (Toll-free 112, Kerala SDMA 1077, 0471-2331645).

CRITICAL BOUNDARIES:
- You must NEVER override or contradict the deterministic safety engine.
- If a user asks "Should I ignore the recommendation?", explain that TravelLord's recommendations are mathematically calculated from the best available telemetry to protect life, and official state authorities, police, and disaster management take absolute precedence.
- If a user asks for live real-time routing recommendations, instruct them politely to check the Trip Planner / Result screen which executes the live deterministic resolution engine.
- Keep answers concise, helpful, friendly, and structured.`;

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
      return NextResponse.json({
        reply: "I am Plan Assist, your TravelLord AI guide. For live, verified route recommendations, please visit the Trip Planner page. In emergencies on Kerala ghat roads, dial toll-free 112 or SDMA Helpline 1077.",
        model: 'offline_guide'
      });
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

    const candidateModels = ['llama-3.3-70b-versatile', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
    let reply = '';
    let usedModel = candidateModels[0];

    for (const model of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.4,
          max_tokens: 350,
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
          console.warn('Chat assistant model fallback warning:', err.message);
          break;
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
