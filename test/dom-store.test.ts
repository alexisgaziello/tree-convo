import { describe, expect, it } from 'vitest';

import { DomTreeStore } from '../src/dom/store';
import { createSnapshot, createTurn } from './helpers';

describe('DomTreeStore', () => {
  it('creates branches when a later snapshot diverges from a shared prefix', () => {
    const store = new DomTreeStore();

    store.update(
      createSnapshot([
        createTurn({ turnId: 'u1', messageId: 'u1', role: 'user', text: 'Hello' }),
        createTurn({
          turnId: 'a1',
          messageId: 'a1',
          role: 'assistant',
          text: 'Hi there',
          modelSlug: 'gpt-test',
        }),
        createTurn({ turnId: 'u2', messageId: 'u2', role: 'user', text: 'Tell me a joke' }),
        createTurn({
          turnId: 'a2',
          messageId: 'a2',
          role: 'assistant',
          text: 'Why did the chicken cross the road?',
          modelSlug: 'gpt-test',
        }),
      ])
    );

    store.update(
      createSnapshot([
        createTurn({ turnId: 'u1', messageId: 'u1', role: 'user', text: 'Hello' }),
        createTurn({
          turnId: 'a1',
          messageId: 'a1',
          role: 'assistant',
          text: 'Hi there',
          modelSlug: 'gpt-test',
        }),
        createTurn({
          turnId: 'u3',
          messageId: 'u3',
          role: 'user',
          text: 'Tell me a fact',
          hasEdit: true,
        }),
        createTurn({
          turnId: 'a3',
          messageId: 'a3',
          role: 'assistant',
          text: 'Octopuses have three hearts.',
          modelSlug: 'gpt-test',
          variantIndexText: '1 / 2',
        }),
      ])
    );

    const tree = store.toConversationNodeInput();

    expect(tree).toBeTruthy();
    expect(tree?.id).toBe('u1');
    expect(tree?.children).toHaveLength(1);
    expect(tree?.children[0].id).toBe('a1');
    expect(tree?.children[0].children).toHaveLength(2);

    expect(tree?.children[0].children.map((child) => child.id)).toEqual(['u2', 'u3']);
    expect(tree?.children[0].children.map((child) => child.text)).toEqual([
      'Tell me a joke',
      'Tell me a fact',
    ]);

    const branchNode = tree?.children[0].children[1];
    expect(branchNode?.metadata?.hasEdit).toBe(true);
    expect(branchNode?.children[0].id).toBe('a3');
    expect(branchNode?.children[0].metadata?.variantIndexText).toBe('1 / 2');
  });

  it('returns null when there is no root node', () => {
    const store = new DomTreeStore();

    store.update(createSnapshot([]));

    expect(store.toConversationNodeInput()).toBeNull();
  });
});