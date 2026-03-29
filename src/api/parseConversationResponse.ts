import type { ConversationNodeInput, ConversationNodeRole } from '../graph/conversationSchema';

interface ApiContent {
  parts?: unknown[];
  text?: string;
  content_type?: string;
}

interface ApiMessage {
  author?: { role?: string };
  content?: ApiContent;
  metadata?: { is_visually_hidden_from_conversation?: boolean };
}

interface ApiMappingNode {
  id: string;
  message?: ApiMessage | null;
  parent?: string | null;
  children?: string[];
}

/**
 * Shape of the ChatGPT `/backend-api/conversation/:id` response.
 *
 * `mapping` is a flat dictionary keyed by node ID. Each node may have a
 * `message` (with author role and content) and links to its `parent` and
 * `children`. Root nodes have `parent: null`.
 *
 * Example (trimmed):
 * ```json
 * {
 *   "mapping": {
 *     "abc-root": { "id": "abc-root", "message": null, "parent": null, "children": ["abc-1"] },
 *     "abc-1":    { "id": "abc-1", "message": { "author": { "role": "user" }, "content": { "parts": ["hello"] } }, "parent": "abc-root", "children": ["abc-2"] },
 *     "abc-2":    { "id": "abc-2", "message": { "author": { "role": "assistant" }, "content": { "parts": ["hi!"] } }, "parent": "abc-1", "children": [] }
 *   }
 * }
 * ```
 */
interface ApiConversationResponse {
  mapping?: Record<string, ApiMappingNode>;
}

function roleOf(node: ApiMappingNode): ConversationNodeRole | null {
  const role = node.message?.author?.role;
  if (role === 'user') return 'user';
  if (role === 'assistant') return 'agent';
  return null; // skip system/tool nodes
}

function isVisible(node: ApiMappingNode): boolean {
  if (!node.message) return false;
  if (node.message.metadata?.is_visually_hidden_from_conversation) return false;
  const ct = node.message.content?.content_type;
  return !ct || ct === 'text' || ct === 'multimodal_text';
}

function textOf(node: ApiMappingNode): string {
  const content = node.message?.content;
  if (!content) return '';
  if (Array.isArray(content.parts)) {
    return content.parts.filter((p): p is string => typeof p === 'string').join('');
  }
  return typeof content.text === 'string' ? content.text : '';
}

/** Returns an array so skipped nodes can splice all children into the parent. */
function collectVisibleNodes(
  id: string,
  mapping: Record<string, ApiMappingNode>,
): ConversationNodeInput[] {
  const node = mapping[id];
  if (!node) return [];

  const childInputs: ConversationNodeInput[] = [];
  for (const childId of node.children ?? []) {
    childInputs.push(...collectVisibleNodes(childId, mapping));
  }

  if (!isVisible(node)) return childInputs;

  const role = roleOf(node);
  const text = role ? textOf(node) : '';

  // Skip nodes with no role or no text — pass children through.
  if (!role || !text) return childInputs;

  return [{ id: node.id, type: role, text, children: childInputs }];
}

export function parseConversationResponse(
  data: ApiConversationResponse,
): ConversationNodeInput | null {
  const mapping = data?.mapping;
  if (!mapping) return null;

  const rootId = Object.keys(mapping).find((id) => !mapping[id].parent);
  if (!rootId) return null;

  const results = collectVisibleNodes(rootId, mapping);
  return results[0] ?? null;
}
