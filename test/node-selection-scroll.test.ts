import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TREE_CONVO_NODE_SELECT_EVENT } from '../src/events';

describe('node selection scrolling integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls the matching conversation turn into view when a node is selected', async () => {
    const dom = new JSDOM(`
      <body>
        <main id="main">
          <section data-turn-id="u1"></section>
          <section data-turn-id="a1"></section>
        </main>
      </body>
    `, {
      url: 'https://chatgpt.com/c/test',
    });

    const scrollIntoView = vi.fn();
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      HTMLElement: dom.window.HTMLElement,
      MutationObserver: dom.window.MutationObserver,
      CustomEvent: dom.window.CustomEvent,
    });

    const target = dom.window.document.querySelector('section[data-turn-id="a1"]');

    if (!target) {
      throw new Error('Missing target section');
    }

    Object.defineProperty(target, 'scrollIntoView', {
      value: scrollIntoView,
      configurable: true,
    });

    await import('../src/main');

    dom.window.dispatchEvent(
      new dom.window.CustomEvent(TREE_CONVO_NODE_SELECT_EVENT, {
        detail: { nodeId: 'a1', metadata: {} },
      })
    );

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  });
});