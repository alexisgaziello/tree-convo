import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { extractConversationSnapshot } from '../src/dom/extractTurns';

describe('extractConversationSnapshot variant controls', () => {
  it('captures variant navigation state and edit markers', () => {
    const dom = new JSDOM(`
      <main id="main">
        <div id="thread">
          <section data-turn-id="u1" data-turn="user">
            <div data-message-author-role="user" data-message-id="u1">
              <div class="whitespace-pre-wrap">Original prompt</div>
            </div>
            <button aria-label="Edit message"></button>
          </section>

          <section data-turn-id="a1" data-turn="assistant">
            <div
              data-message-author-role="assistant"
              data-message-id="a1"
              data-message-model-slug="gpt-test"
            >
              <div class="markdown">Variant answer</div>
            </div>
            <button aria-label="Previous response"></button>
            <span>2 / 3</span>
            <button aria-label="Next response"></button>
          </section>
        </div>
      </main>
    `);

    const snapshot = extractConversationSnapshot(dom.window.document);

    expect(snapshot.turns).toHaveLength(2);
    expect(snapshot.turns[0]).toMatchObject({
      turnId: 'u1',
      messageId: 'u1',
      role: 'user',
      text: 'Original prompt',
      hasEdit: true,
      hasPrevVariant: false,
      hasNextVariant: false,
      variantIndexText: null,
    });
    expect(snapshot.turns[1]).toMatchObject({
      turnId: 'a1',
      messageId: 'a1',
      role: 'assistant',
      modelSlug: 'gpt-test',
      text: 'Variant answer',
      hasEdit: false,
      hasPrevVariant: true,
      hasNextVariant: true,
      variantIndexText: '2 / 3',
    });
  });
});