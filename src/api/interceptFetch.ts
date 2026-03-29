import { parseConversationResponse } from './parseConversationResponse';
import type { ConversationNodeInput } from '../graph/conversationSchema';

const CONVERSATION_URL_PATTERN = /\/backend-api\/conversation\/[0-9a-f-]+$/;

type ConversationCallback = (conversationId: string, tree: ConversationNodeInput) => void;

/**
 * Patches window.fetch to intercept ChatGPT's conversation API responses.
 * When a matching response is seen, parses the tree and calls `onConversation`.
 */
export function interceptConversationFetch(onConversation: ConversationCallback): void {
  const originalFetch = window.fetch;

  window.fetch = async function (...args: Parameters<typeof fetch>) {
    const res = await originalFetch.apply(this, args);

    const url =
      typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : '';
    if (!CONVERSATION_URL_PATTERN.test(url)) return res;

    // Extract conversation ID from URL.
    const match = url.match(/\/conversation\/([0-9a-f-]+)/);
    if (!match) return res;
    const conversationId = match[1];

    // Clone so ChatGPT can still read the original response.
    const clone = res.clone();
    clone
      .json()
      .then((data) => {
        const tree = parseConversationResponse(data);
        if (tree) onConversation(conversationId, tree);
      })
      .catch(() => {
        /* ignore parse errors */
      });

    return res;
  };
}
