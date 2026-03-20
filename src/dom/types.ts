export type DomTurnRole = 'user' | 'assistant' | 'unknown';

export interface DomTurnSnapshot {
  turnId: string;
  turnType: string | null;
  messageId: string | null;
  role: DomTurnRole;
  modelSlug: string | null;
  text: string;
  hasEdit: boolean;
  hasPrevVariant: boolean;
  hasNextVariant: boolean;
  variantIndexText: string | null;
}

export interface DomConversationSnapshot {
  turns: DomTurnSnapshot[];
  isStreaming: boolean;
  capturedAt: number;
}
