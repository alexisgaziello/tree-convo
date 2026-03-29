import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { NODE_SELECT_EVENT } from '../src/constants';
import { buildTree } from '../src/graph/buildTree';
import { renderConversationTree } from '../src/graph/renderConversationTree';

describe('renderConversationTree', () => {
  it('renders node labels and dispatches a selection event on click', () => {
    const dom = new JSDOM('<div id="root"></div>');
    const { document, CustomEvent } = dom.window;

    Object.assign(globalThis, {
      document,
      window: dom.window,
      CustomEvent,
    });

    const container = document.getElementById('root');

    if (!container) {
      throw new Error('Missing test container');
    }

    const tree = buildTree({
      id: 'u1',
      type: 'user',
      text: 'Hello there this is a longer sentence for the label',
      metadata: { turnId: 'u1' },
      children: [
        {
          id: 'a1',
          type: 'agent',
          text: 'A short reply',
          metadata: { turnId: 'a1' },
          children: [],
        },
      ],
    });

    let selectedNodeId: string | null = null;

    window.addEventListener(NODE_SELECT_EVENT, (event: Event) => {
      selectedNodeId = (event as CustomEvent<{ nodeId: string }>).detail.nodeId;
    });

    renderConversationTree(tree, container);

    const labels = Array.from(container.querySelectorAll('text')).map(
      (element) => element.textContent,
    );

    expect(labels[0]).toContain('Hello there');
    expect(labels[0]?.endsWith('…')).toBe(true);
    expect(labels[1]).toBe('A short reply');

    const nodeGroups = container.querySelectorAll('g');
    expect(nodeGroups).toHaveLength(2);

    const firstNode = nodeGroups[0];
    firstNode.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));

    expect(selectedNodeId).toBe('u1');
  });
});
