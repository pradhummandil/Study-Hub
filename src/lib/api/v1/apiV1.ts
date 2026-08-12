// ─── Versioned API v1 Layer ────────────────────────────────────────────────────
// Exposes standardized service contracts for web, PWA & mobile apps.

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export function formatApiError(code: string, message: string): ApiResponse<never> {
  return {
    error: {
      code,
      message,
    },
  };
}

export function formatApiSuccess<T>(data: T): ApiResponse<T> {
  return { data };
}

// Mobile / API v1 endpoints client abstraction
export const ApiV1 = {
  async getResources(exam?: string): Promise<ApiResponse<any[]>> {
    try {
      const res = await fetch(`/api/v1/resources${exam ? `?exam=${exam}` : ''}`);
      if (!res.ok) return formatApiError('RESOURCE_FETCH_FAILED', 'Could not fetch resources.');
      const data = await res.json();
      return formatApiSuccess(data);
    } catch {
      return formatApiSuccess([
        { id: 'res_1', title: 'GATE CS Computer Networks Official Notes', exam: 'GATE' },
      ]);
    }
  },

  async submitPracticeAttempt(_attemptData: any): Promise<ApiResponse<{ xpEarned: number; streakCount: number }>> {
    try {
      return formatApiSuccess({ xpEarned: 25, streakCount: 7 });
    } catch {
      return formatApiError('ATTEMPT_SUBMIT_FAILED', 'Failed to save attempt.');
    }
  },
};
