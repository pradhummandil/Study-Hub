// ─── StudyMate AI — Frontend API Client ──────────────────────────────────────
// This module calls the secure backend (Vite dev plugin or Supabase Edge Function).
// The GEMINI_API_KEY is NEVER accessed here — it stays in the server.

import type {
  Message,
  StudyContext,
  SendMessageResponse,
} from '../types/study-ai';

// ── Rate limit tracking (client-side soft guard) ─────────────────────────────
const RATE_LIMIT_KEY = 'studymate_daily_count';
const RATE_LIMIT_DATE_KEY = 'studymate_daily_date';
const FREE_LIMIT = 30;
const AUTH_LIMIT = 100;

export function getRateLimitState(isAuthenticated: boolean): {
  remaining: number;
  total: number;
  exceeded: boolean;
} {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem(RATE_LIMIT_DATE_KEY);

  if (storedDate !== today) {
    localStorage.setItem(RATE_LIMIT_DATE_KEY, today);
    localStorage.setItem(RATE_LIMIT_KEY, '0');
  }

  const count = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
  const limit = isAuthenticated ? AUTH_LIMIT : FREE_LIMIT;
  return {
    remaining: Math.max(0, limit - count),
    total: limit,
    exceeded: count >= limit,
  };
}

function incrementRateLimit() {
  const count = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
  localStorage.setItem(RATE_LIMIT_KEY, String(count + 1));
}

// ── API endpoint resolution ───────────────────────────────────────────────────
function getApiUrl(): string {
  // In production, if VITE_STUDY_AI_URL is set (Edge Function URL), use it.
  // In development the Vite plugin intercepts /api/study-ai.
  return import.meta.env.VITE_STUDY_AI_URL || '/api/study-ai';
}

// ── Core send message ─────────────────────────────────────────────────────────
export async function sendStudyMessage(
  messages: Message[],
  context: StudyContext,
  isAuthenticated: boolean
): Promise<SendMessageResponse> {
  const rateLimitState = getRateLimitState(isAuthenticated);

  if (rateLimitState.exceeded) {
    return {
      response: '',
      rateLimited: true,
      error:
        "You've reached today's free AI limit. Come back tomorrow, or continue exploring the resource library and Focus Room.",
    };
  }

  const apiMessages = messages
    .filter((m) => !m.isTyping && !m.isError)
    .map((m) => ({ role: m.role, content: m.content }));

  try {
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: apiMessages,
        context,
        mode: 'chat',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      void errorText; // Read to avoid unused var, but we don't expose it
      // Never expose internal error details to the user
      console.error('StudyAI API error:', response.status);
      if (response.status === 429) {
        return {
          response: '',
          rateLimited: true,
          error:
            "You've reached today's free AI limit. Come back later or continue with the resource library and Focus Room.",
        };
      }
      return {
        response: '',
        error:
          "I couldn't reach the study engine right now. Your message wasn't lost. Please try again in a moment.",
      };
    }

    const data = await response.json();
    incrementRateLimit();
    return { response: data.response || '' };
  } catch (err) {
    console.error('StudyAI network error:', err);
    return {
      response: '',
      error:
        "I couldn't reach the study engine right now. Your message wasn't lost. Please try again in a moment.",
    };
  }
}

// ── Health check ──────────────────────────────────────────────────────────────
export async function checkStudyAIHealth(): Promise<boolean> {
  try {
    const url = (import.meta.env.VITE_STUDY_AI_URL || '/api/study-ai') + '/health';
    const res = await fetch(url, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Message ID generator ──────────────────────────────────────────────────────
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
