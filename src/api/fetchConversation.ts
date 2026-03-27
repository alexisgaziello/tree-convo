import { parseConversationResponse } from './parseConversationResponse';
import type { ConversationNodeInput } from '../graph/conversationSchema';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' });
    const data = await res.json();
    cachedToken = data?.accessToken ?? null;
    const expires: string | undefined = data?.expires;
    tokenExpiresAt = expires ? new Date(expires).getTime() : 0;
    return cachedToken;
  } catch {
    return null;
  }
}

export async function fetchConversationTree(
  conversationId: string
): Promise<ConversationNodeInput | null> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error('[tree-convo] no access token');
      return null;
    }

    const res = await fetch(`/backend-api/conversation/${conversationId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`[tree-convo] fetch failed: ${res.status} — /backend-api/conversation/${conversationId}`);
      return null;
    }

    const data = await res.json();
    return parseConversationResponse(data);

  } catch (err) {
    console.error('[tree-convo] fetch error', err);
    return null;
  }
}
