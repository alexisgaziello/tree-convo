import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { extractConversationSnapshot } from '../src/dom/extractTurns';

describe('extractConversationSnapshot fallback selectors', () => {
  it('extracts turns when section[data-turn-id] is absent', () => {
    const dom = new JSDOM(`
      <main id="main">
        <div id="thread">
          <div data-testid="conversation-turn-1" data-turn="user">
            <div data-message-author-role="user" data-message-id="u1">
              <div class="whitespace-pre-wrap">Hello fallback</div>
            </div>
          </div>
          <div data-testid="conversation-turn-2" data-turn="assistant">
            <div
              data-message-author-role="assistant"
              data-message-id="a1"
              data-message-model-slug="gpt-test"
            >
              <div class="markdown">Hi from fallback selector</div>
            </div>
          </div>
        </div>
      </main>
    `);

    const snapshot = extractConversationSnapshot(dom.window.document);

    expect(snapshot.turns).toHaveLength(2);
    expect(snapshot.turns.map((turn) => turn.turnId)).toEqual([
      'conversation-turn-1',
      'conversation-turn-2',
    ]);
    expect(snapshot.turns.map((turn) => turn.messageId)).toEqual(['u1', 'a1']);
    expect(snapshot.turns.map((turn) => turn.role)).toEqual(['user', 'assistant']);
    expect(snapshot.turns.map((turn) => turn.text)).toEqual([
      'Hello fallback',
      'Hi from fallback selector',
    ]);
  });
});