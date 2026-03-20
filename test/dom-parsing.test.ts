import fs from 'node:fs';
import path from 'node:path';

import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import { extractConversationSnapshot } from '../src/dom/extractTurns';
import { DomTreeStore } from '../src/dom/store';

const fixturePath = path.resolve('test/fixtures/chatgpt-thread-simplified.html');
const fixtureHtml = fs.readFileSync(fixturePath, 'utf8');

describe('DOM conversation parsing', () => {
  it('extracts 8 turns from the simplified ChatGPT fixture in order', () => {
    const dom = new JSDOM(fixtureHtml);
    const snapshot = extractConversationSnapshot(dom.window.document);

    expect(snapshot.turns).toHaveLength(8);
    expect(snapshot.turns.map((turn) => turn.role)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant',
      'user',
      'assistant',
      'user',
      'assistant',
    ]);
    expect(snapshot.turns.map((turn) => turn.text)).toEqual([
      'hi',
      'Hi! What can I help you with today?',
      'say back hello',
      'hello',
      'nd now bye',
      'bye 👋',
      'k',
      '👍',
    ]);
  });

  it('builds a linear tree from the extracted fixture turns', () => {
    const dom = new JSDOM(fixtureHtml);
    const snapshot = extractConversationSnapshot(dom.window.document);
    const store = new DomTreeStore();

    store.update(snapshot);

    const tree = store.toConversationNodeInput();

    expect(tree).toBeTruthy();
    expect(tree?.id).toBe('e7de7c9f-48c2-43e4-b782-8b96f1c478e4');
    expect(tree?.type).toBe('user');
    expect(tree?.text).toBe('hi');

    const texts: string[] = [];
    let cursor = tree;

    while (cursor) {
      texts.push(cursor.text);
      cursor = cursor.children[0];
    }

    expect(texts).toEqual([
      'hi',
      'Hi! What can I help you with today?',
      'say back hello',
      'hello',
      'nd now bye',
      'bye 👋',
      'k',
      '👍',
    ]);
  });
});
