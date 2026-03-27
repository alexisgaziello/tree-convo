import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NODE_SELECT_EVENT } from '../src/constants';

describe('node selection scrolling integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scrolls so the turn top sits at 1/4 from viewport top', async () => {
    const dom = new JSDOM(`
      <body>
        <div id="chat-tree-panel"></div>
        <main id="main" style="overflow:auto">
          <section data-turn-id="u1"></section>
          <section data-turn-id="a1"></section>
        </main>
      </body>
    `, {
      url: 'https://chatgpt.com/c/test',
    });

    const scrollTo = vi.fn();
    Object.assign(globalThis, {
      window: dom.window,
      document: dom.window.document,
      HTMLElement: dom.window.HTMLElement,
      MutationObserver: dom.window.MutationObserver,
      CustomEvent: dom.window.CustomEvent,
      requestAnimationFrame: (cb: FrameRequestCallback) => setTimeout(cb, 0),
      localStorage: { getItem: () => 'false', setItem: () => {} },
      location: dom.window.location,
    });

    const main = dom.window.document.querySelector('main')!;
    Object.defineProperty(main, 'scrollTo', { value: scrollTo, configurable: true });
    Object.defineProperty(main, 'scrollTop', { value: 0, configurable: true });

    // Stub getBoundingClientRect for main and target
    Object.defineProperty(main, 'getBoundingClientRect', {
      value: () => ({ top: 0 }),
      configurable: true,
    });
    const target = dom.window.document.querySelector('section[data-turn-id="a1"]')!;
    Object.defineProperty(target, 'getBoundingClientRect', {
      value: () => ({ top: 400 }),
      configurable: true,
    });

    // viewport height
    Object.defineProperty(dom.window, 'innerHeight', { value: 800, configurable: true });

    const canvas = dom.window.document.getElementById('chat-tree-panel')!;
    const { bindScrollAndSelect } = await import('../src/panel/bindScrollAndSelect');
    bindScrollAndSelect(canvas as unknown as HTMLElement, null);

    dom.window.dispatchEvent(
      new dom.window.CustomEvent(NODE_SELECT_EVENT, {
        detail: { nodeId: 'a1', metadata: {} },
      })
    );

    // target top (400) - container top (0) - 0.25 * 800 (200) = 200
    expect(scrollTo).toHaveBeenCalledWith({ top: 200, behavior: 'smooth' });
  });
});
