import type { DomConversationSnapshot, DomTurnRole, DomTurnSnapshot } from './types';

const TURN_SELECTORS = [
  'section[data-turn-id]',
  '[data-testid^="conversation-turn-"]',
  '#thread [data-message-id]',
  '[data-message-id]',
];

function getTurnElements(root: ParentNode): Element[] {
  const threadRoot = root.querySelector?.('#thread') ?? null;

  if (threadRoot) {
    const threadSections = Array.from(
      threadRoot.querySelectorAll('section[data-turn-id]')
    );

    if (threadSections.length > 0) {
      return threadSections;
    }
  }

  for (const selector of TURN_SELECTORS) {
    const matches = Array.from(root.querySelectorAll(selector));

    if (matches.length > 0) {
      return matches;
    }
  }

  return [];
}

function getTurnRole(turn: Element, message: Element | null): DomTurnRole {
  const turnRole = turn.getAttribute('data-turn');
  const messageRole = message?.getAttribute('data-message-author-role');
  const role = turnRole ?? messageRole;

  if (role === 'user' || role === 'assistant') {
    return role;
  }

  return 'unknown';
}

function getVariantIndexText(turn: Element): string | null {
  const text = turn.textContent ?? '';
  const match = text.match(/\b(\d+)\s*\/\s*(\d+)\b/);
  return match ? match[0] : null;
}

function getTurnId(turn: Element, message: Element | null): string {
  return (
    turn.getAttribute('data-turn-id') ??
    turn.getAttribute('data-testid') ??
    message?.getAttribute('data-message-id') ??
    ''
  );
}

function extractTurn(turn: Element): DomTurnSnapshot {
  const message = turn.hasAttribute('data-message-id')
    ? turn
    : turn.querySelector('[data-message-id]');
  const markdown = turn.querySelector('.markdown');
  const textSource = markdown ?? message;

  return {
    turnId: getTurnId(turn, message),
    turnType: turn.getAttribute('data-turn'),
    messageId: message?.getAttribute('data-message-id') ?? null,
    role: getTurnRole(turn, message),
    modelSlug: message?.getAttribute('data-message-model-slug') ?? null,
    text: (textSource?.textContent ?? '').trim(),
    hasEdit: Boolean(turn.querySelector('button[aria-label="Edit message"]')),
    hasPrevVariant: Boolean(
      turn.querySelector('button[aria-label="Previous response"]')
    ),
    hasNextVariant: Boolean(
      turn.querySelector('button[aria-label="Next response"]')
    ),
    variantIndexText: getVariantIndexText(turn),
  };
}

export function extractConversationSnapshot(
  root: ParentNode = document
): DomConversationSnapshot {
  const turns = getTurnElements(root).map(extractTurn);
  const isStreaming = root.querySelector?.('button[aria-label="Stop generating"]') !== null
    || root.querySelector?.('[data-testid="stop-button"]') !== null;

  return {
    turns,
    isStreaming,
    capturedAt: Date.now(),
  };
}
