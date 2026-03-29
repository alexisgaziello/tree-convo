import { hierarchy, tree } from 'd3-hierarchy';
import { Node } from './Node';

interface LayoutEntry {
  x: number;
  y: number;
  depth: number;
  data: Node;
}

export interface ConversationTreeLayoutOptions {
  levelGapY?: number;
  nodeGapX?: number;
  startX?: number;
  startY?: number;
  zigzagOffsetX?: number;
  branchStaggerY?: number;
}

/** For each node with multiple children, assign a stagger offset based on sibling index. */
function buildStaggerMap(layoutRoot: { each: (fn: (entry: LayoutEntry) => void) => void }, branchStaggerY: number): Map<Node, number> {
  const staggerMap = new Map<Node, number>();
  layoutRoot.each((entry: LayoutEntry) => {
    const children = entry.data.children;
    if (children.length > 1) {
      for (let i = 0; i < children.length; i++) {
        staggerMap.set(children[i], i * branchStaggerY);
      }
    }
  });
  return staggerMap;
}

/** Sum stagger offsets from a node up to the root (cumulative down the tree). */
function cumulativeStagger(node: Node, staggerMap: Map<Node, number>): number {
  let total = 0;
  let current: Node | null = node;
  while (current) {
    total += staggerMap.get(current) ?? 0;
    current = current.parent ?? null;
  }
  return total;
}

export function layoutConversationTree(
  root: Node,
  {
    levelGapY = 56,
    nodeGapX = 24,
    startX = 56,
    startY = 72,
    zigzagOffsetX = 12,
    branchStaggerY = 20,
  }: ConversationTreeLayoutOptions = {}
): void {
  const layoutRoot = hierarchy(root, (node: Node) => node.children);
  const treeLayout = tree().nodeSize([nodeGapX, levelGapY]);

  treeLayout(layoutRoot);

  const staggerMap = buildStaggerMap(layoutRoot, branchStaggerY);

  let minX = Number.POSITIVE_INFINITY;
  layoutRoot.each((entry: LayoutEntry) => {
    minX = Math.min(minX, entry.x);
  });

  const offsetX = startX - minX;

  layoutRoot.each((entry: LayoutEntry) => {
    const zigzag = entry.data.isAgent() ? -zigzagOffsetX : zigzagOffsetX;
    entry.data.x = entry.x + offsetX + zigzag;
    entry.data.y = entry.y + startY + cumulativeStagger(entry.data, staggerMap);
    entry.data.depth = entry.depth;
  });
}
