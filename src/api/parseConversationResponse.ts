import type { ConversationNodeInput, ConversationNodeRole } from '../graph/conversationSchema';

interface ApiContent {
  parts?: unknown[];
  text?: string;
  content_type?: string;
}

interface ApiMessage {
  author?: { role?: string };
  content?: ApiContent;
}

interface ApiMappingNode {
  id: string;
  message?: ApiMessage | null;
  parent?: string | null;
  children?: string[];
}

interface ApiConversationResponse {
  mapping?: Record<string, ApiMappingNode>;
}

function roleOf(node: ApiMappingNode): ConversationNodeRole | null {
  const role = node.message?.author?.role;
  if (role === 'user') return 'user';
  if (role === 'assistant') return 'agent';
  return null; // skip system/tool nodes
}

function textOf(node: ApiMappingNode): string {
  const content = node.message?.content;
  if (!content) return '';
  const parts = content.parts;
  if (Array.isArray(parts)) {
    const joined = parts.filter((p) => typeof p === 'string').join('');
    if (joined) return joined;
  }
  if (typeof content.text === 'string') return content.text;
  return '';
}

export function parseConversationResponse(
  data: ApiConversationResponse
): ConversationNodeInput | null {
  const mapping = data?.mapping;
  if (!mapping) return null;

  // Find root(s): nodes with no parent
  const rootIds = Object.keys(mapping).filter((id) => !mapping[id].parent);

  function build(id: string): ConversationNodeInput | null {
    const node = mapping![id];
    if (!node) return null;

    const role = roleOf(node);
    const childInputs: ConversationNodeInput[] = [];

    for (const childId of node.children ?? []) {
      const child = build(childId);
      if (child) childInputs.push(child);
    }

    // Skip non-conversation nodes (system/tool) but pass through their children
    if (!role) {
      if (childInputs.length === 1) return childInputs[0];
      if (childInputs.length === 0) return null;
      // Multiple children from a system node — wrap in a synthetic root
      return { id: node.id, type: 'user', text: '', children: childInputs };
    }

    const text = textOf(node);

    // Skip empty nodes — pass through children
    if (!text) {
      if (childInputs.length === 1) return childInputs[0];
      if (childInputs.length === 0) return null;
    }

    return {
      id: node.id,
      type: role,
      text,
      children: childInputs,
    };
  }

  // Try each root until we get a valid tree
  for (const rootId of rootIds) {
    const tree = build(rootId);
    if (tree) return tree;
  }

  return null;
}
