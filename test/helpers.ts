import type { DomConversationSnapshot, DomTurnSnapshot } from '../src/dom/types';

export function createTurn(overrides: Partial<DomTurnSnapshot> = {}): DomTurnSnapshot {
  const id = overrides.messageId ?? overrides.turnId ?? 'turn-id';

  return {
    turnId: overrides.turnId ?? id,
    turnType: overrides.turnType ?? null,
    messageId: overrides.messageId ?? id,
    role: overrides.role ?? 'user',
    modelSlug: overrides.modelSlug ?? null,
    text: overrides.text ?? '',
    hasEdit: overrides.hasEdit ?? false,
    hasPrevVariant: overrides.hasPrevVariant ?? false,
    hasNextVariant: overrides.hasNextVariant ?? false,
    variantIndexText: overrides.variantIndexText ?? null,
  };
}

export function createSnapshot(turns: DomTurnSnapshot[]): DomConversationSnapshot {
  return {
    turns,
    capturedAt: 1,
  };
}
