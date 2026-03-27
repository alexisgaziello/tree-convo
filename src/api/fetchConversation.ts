import { parseConversationResponse } from './parseConversationResponse';
import type { ConversationNodeInput } from '../graph/conversationSchema';

let cachedToken: string | null = null;

function getAccessToken(): Promise<string | null> {
  if (cachedToken) return Promise.resolve(cachedToken);
  return fetch('/api/auth/session', { credentials: 'include' })
    .then((r) => r.json())
    .then((data) => {
      cachedToken = data?.accessToken ?? null;
      return cachedToken;
    })
    .catch(() => null);
}

export function fetchConversationTree(
  conversationId: string
): Promise<ConversationNodeInput | null> {
  return getAccessToken().then((token) => {
    if (!token) {
      console.debug('[tree-convo] no access token');
      return null;
    }
    return fetch(`/backend-api/conversation/${conversationId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then((res) => {
      if (!res.ok) {
        console.debug(`[tree-convo] fetch failed: ${res.status} — /backend-api/conversation/${conversationId}`);
        return null;
      }
      return res.json();
    })
    .then((data) => {
      if (!data) return null;
      const tree = parseConversationResponse(data);
      if (tree) {
        const count = countNodes(tree);
        console.debug(`[tree-convo] fetched conversation — ${count} nodes`);
      } else {
        console.debug('[tree-convo] fetched conversation — parse returned null');
      }
      return tree;
    })
    .catch((err) => {
      console.debug('[tree-convo] fetch error', err);
      return null;
    });
  });
}

function countNodes(node: ConversationNodeInput): number {
  return 1 + (node.children ?? []).reduce((sum, c) => sum + countNodes(c), 0);
}
