import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { collectBranchIds } from '../src/panel/branchHighlight';

// Mock getTurnElement — controls which nodes are "visible" in ChatGPT's DOM.
const visibleNodeIds = new Set<string>();
vi.mock('../src/dom/selectors', () => ({
  getTurnElement: (id: string) => visibleNodeIds.has(id) ? document.createElement('div') : null,
}));

/**
 * Build a minimal SVG canvas with node groups and edges for testing.
 *
 * Tree structure:
 *       A
 *      / \
 *     B   C
 *    / \   \
 *   D   E   F
 */
function buildCanvas(doc: Document): HTMLElement {
  const canvas = doc.createElement('div');

  const nodes: { id: string; parentId?: string }[] = [
    { id: 'A' },
    { id: 'B', parentId: 'A' },
    { id: 'C', parentId: 'A' },
    { id: 'D', parentId: 'B' },
    { id: 'E', parentId: 'B' },
    { id: 'F', parentId: 'C' },
  ];

  for (const n of nodes) {
    const g = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.dataset.nodeId = n.id;
    if (n.parentId) g.dataset.parentId = n.parentId;
    canvas.appendChild(g);
  }

  return canvas;
}

let canvas: HTMLElement;

beforeEach(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  // @ts-expect-error — override globals for jsdom
  global.document = dom.window.document;
  canvas = buildCanvas(dom.window.document);
  visibleNodeIds.clear();
});

describe('collectBranchIds', () => {
  it('walks up to root from a leaf node', () => {
    // No visible nodes — only ancestors should be collected.
    const ids = collectBranchIds(canvas, 'D');
    expect(ids).toContain('D');
    expect(ids).toContain('B');
    expect(ids).toContain('A');
    expect(ids).not.toContain('C');
    expect(ids).not.toContain('E');
    expect(ids).not.toContain('F');
  });

  it('walks down following visible children only', () => {
    // Simulate ChatGPT showing branch A → B → D.
    visibleNodeIds.add('A');
    visibleNodeIds.add('B');
    visibleNodeIds.add('D');

    const ids = collectBranchIds(canvas, 'A');
    expect(ids).toContain('A');
    expect(ids).toContain('B');
    expect(ids).toContain('D');
    expect(ids).not.toContain('C');
    expect(ids).not.toContain('E');
    expect(ids).not.toContain('F');
  });

  it('follows the visible branch, not all children', () => {
    // Simulate ChatGPT showing branch A → C → F.
    visibleNodeIds.add('A');
    visibleNodeIds.add('C');
    visibleNodeIds.add('F');

    const ids = collectBranchIds(canvas, 'A');
    expect(ids).toContain('A');
    expect(ids).toContain('C');
    expect(ids).toContain('F');
    expect(ids).not.toContain('B');
    expect(ids).not.toContain('D');
    expect(ids).not.toContain('E');
  });

  it('collects full path when active node is in the middle', () => {
    // Visible branch: A → B → D. Active node is B.
    visibleNodeIds.add('A');
    visibleNodeIds.add('B');
    visibleNodeIds.add('D');

    const ids = collectBranchIds(canvas, 'B');
    expect(ids).toContain('A');
    expect(ids).toContain('B');
    expect(ids).toContain('D');
    expect(ids).not.toContain('C');
    expect(ids).not.toContain('E');
  });

  it('returns only the node itself when it has no parent and no visible children', () => {
    const ids = collectBranchIds(canvas, 'A');
    expect(ids).toEqual(new Set(['A']));
  });

  it('handles unknown node ID gracefully', () => {
    const ids = collectBranchIds(canvas, 'UNKNOWN');
    expect(ids).toEqual(new Set(['UNKNOWN']));
  });
});
