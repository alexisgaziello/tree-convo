import { describe, expect, it } from 'vitest';
import { parseConversationResponse } from '../src/api/parseConversationResponse';
import { apiConversationFixture } from './fixtures/apiConversationFixture';

describe('parseConversationResponse', () => {
  it('skips system, tool-call, and hidden nodes — returns only visible turns', () => {
    const tree = parseConversationResponse(apiConversationFixture as any);

    expect(tree).not.toBeNull();
    expect(tree!.id).toBe('u1');
    expect(tree!.type).toBe('user');
    expect(tree!.text).toBe('Is there an equivalent of the icon a5 but with 4 seats?');
    expect(tree!.children).toHaveLength(1);

    const a1 = tree!.children![0];
    expect(a1.id).toBe('a1');
    expect(a1.type).toBe('agent');
    expect(a1.children).toHaveLength(1);

    const u2 = a1.children![0];
    expect(u2.id).toBe('u2');
    expect(u2.type).toBe('user');
    expect(u2.children).toHaveLength(1);

    const a2 = u2.children![0];
    expect(a2.id).toBe('a2');
    expect(a2.type).toBe('agent');
    expect(a2.children).toHaveLength(0);
  });

  it('produces exactly 4 visible nodes from the fixture', () => {
    const tree = parseConversationResponse(apiConversationFixture as any);
    const count = countNodes(tree!);
    expect(count).toBe(4);
  });

  it('returns null for empty mapping', () => {
    expect(parseConversationResponse({ mapping: {} })).toBeNull();
  });

  it('returns null for missing mapping', () => {
    expect(parseConversationResponse({} as any)).toBeNull();
  });

  it('skips assistant tool-call nodes with content_type code', () => {
    const tree = parseConversationResponse(apiConversationFixture as any);
    const ids = collectIds(tree!);
    expect(ids).not.toContain('tool-call');
    expect(ids).not.toContain('tool-call2');
  });

  it('skips nodes with is_visually_hidden_from_conversation', () => {
    const tree = parseConversationResponse(apiConversationFixture as any);
    const ids = collectIds(tree!);
    expect(ids).not.toContain('sys1');
    expect(ids).not.toContain('sys2');
    expect(ids).not.toContain('sys3');
    expect(ids).not.toContain('user-context');
    expect(ids).not.toContain('search-sys');
    expect(ids).not.toContain('search-prompt');
    expect(ids).not.toContain('search-sys2');
  });
});

function countNodes(node: { children?: any[] }): number {
  return 1 + (node.children ?? []).reduce((s: number, c: any) => s + countNodes(c), 0);
}

function collectIds(node: { id: string; children?: any[] }): string[] {
  return [node.id, ...(node.children ?? []).flatMap((c: any) => collectIds(c))];
}
