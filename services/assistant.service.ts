// Helper to parse fetch responses (client-side services follow this pattern)
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    const errorMessage =
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || 'An error occurred';
    const errorWithStatus = new Error(errorMessage) as Error & { status: number };
    errorWithStatus.status = response.status;
    throw errorWithStatus;
  }
  return response.json();
}

export type AssistantContext = {
  portfolio_id?: string;
  include_positions?: boolean;
  [key: string]: any;
};

export type AssistantResponse = any;

export class AssistantService {
  /**
   * Send a message to the AI assistant (client-side wrapper).
   * Posts to the internal API route: POST /api/wealth/assistant/chat
   */
  static async chat(
    accountId: string,
    message: string,
    context: AssistantContext = {}
  ): Promise<AssistantResponse> {
    if (!accountId) {
      const err = new Error('accountId is required for assistant chat') as Error & { status?: number };
      err.status = 400;
      throw err;
    }
    if (!message) {
      const err = new Error('message is required for assistant chat') as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const response = await fetch('/api/wealth/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: accountId,
        message,
        context,
      }),
    });

    return handleResponse<AssistantResponse>(response);
  }
}

