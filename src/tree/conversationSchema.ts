export type ConversationNodeRole = 'user' | 'agent';

export interface ConversationNodeInput {
  id: string;
  type: ConversationNodeRole;
  text?: string;
  children?: ConversationNodeInput[];
  metadata?: Record<string, unknown>;
}

export interface ConversationEdge {
  from: Node;
  to: Node;
}

import type { Node } from './Node';
