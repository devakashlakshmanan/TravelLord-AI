import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const GROQ_SYSTEM_PROMPT = `You are a safety communication assistant for TravelLord AI, an advanced multi-hazard protective-action resolution system.
You will be given a structured JSON object containing an action recommendation that has ALREADY been deterministically resolved by a rigorous rule and constraint safety engine.

Your STRICT directives:
1. NEVER alter, question, or re-evaluate the selected action.
2. NEVER invent any facts, numbers, dates, times, hazards, or road statuses not present in the input JSON.
3. NEVER claim real-time sensor connections that are not listed in the data.
4. Explain clearly and calmly in 2-3 concise sentences WHY this specific action was selected over rejected alternatives.
5. If the action is 'INSUFFICIENT_DATA', state clearly that data confidence has decayed below safe operational thresholds and advise following local posted signs and emergency helplines.
6. Tone: Calm, authoritative, reassuring, and safety-first. Plain text only (no markdown symbols, no bullet points).`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      actionTitle,
      risk_score, 
      confidence, 
      controlling_segment,
      reasons,
      rejectedActions,
      decisionWindowDescription,
      recoverability,
      language = 'en'
    } = body;

    if (!action && !actionTitle) {
      return NextResponse.json(
        { error: 'Invalid payload: action or actionTitle is required.' },
        { status: 400 }
      );
    }

    const effectiveAction = actionTitle || action;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { 
          explanation: buildDeterministicFallbackExplanation(effectiveAction, reasons, rejectedActions, decisionWindowDescription),
          model: 'deterministic_fallback'
        }
      );
    }

    const groq = new Groq({ apiKey });

    const promptPayload = {
      action: effectiveAction,
      risk_score: risk_score ?? 0.5,
      confidence_score: confidence ?? 0.8,
      controlling_checkpoint: controlling_segment?.name || 'Mountain Corridor Checkpoint',
      primary_hazard: controlling_segment?.hazard_type || 'Active geotechnical slope risk',
      reasons: reasons || [],
      rejected_alternatives: rejectedActions || [],
      decision_window: decisionWindowDescription || '15 minutes',
      recoverability: recoverability || 'HIGH',
      language,
    };

    // Candidate models on Groq with fallback
    const candidateModels = ['llama-3.3-70b-versatile', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
    let explanation = '';
    let usedModel = candidateModels[0];

    for (const model of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.25,
          max_tokens: 160,
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
          console.warn('Groq API model call warning:', err.message);
          break;
        }
      }
    }

    // High quality deterministic fallback if API is unavailable
    if (!explanation) {
      explanation = buildDeterministicFallbackExplanation(effectiveAction, reasons, rejectedActions, decisionWindowDescription);
      usedModel = 'deterministic_template';
    }

    return NextResponse.json({
      explanation,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-explanation:', error);
    return NextResponse.json(
      { 
        explanation: 'TravelLord deterministic safety engine advises adhering strictly to the primary action. Reassess in approximately 15 minutes as weather and slope telemetry update.',
        model: 'fail_safe'
      }
    );
  }
}

function buildDeterministicFallbackExplanation(
  action: string,
  reasons?: string[],
  rejectedActions?: Array<{ action: string; reason: string }>,
  decisionWindow?: string
): string {
  if (action.includes('INSUFFICIENT_DATA') || action.includes('VERIFY')) {
    return 'Data confidence has decayed below safe operational thresholds in this ghat sector. Please stop at the nearest verified rest stop and follow local posted signage or emergency helplines.';
  }

  let text = `The safety system has evaluated current conditions and resolved the primary directive as ${action}.`;
  if (reasons && reasons.length > 0) {
    text += ` ${reasons[0]}`;
  }
  if (rejectedActions && rejectedActions.length > 0) {
    text += ` Alternative ${rejectedActions[0].action} was rejected because ${rejectedActions[0].reason.toLowerCase()}`;
  }
  if (decisionWindow) {
    text += ` ${decisionWindow}`;
  }
  return text;
}
