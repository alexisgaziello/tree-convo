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
}

export function layoutConversationTree(
  root: Node,
  {
    levelGapY = 120,
    nodeGapX = 32,
    startX = 56,
    startY = 72,
  }: ConversationTreeLayoutOptions = {}
): void {
  const layoutRoot = hierarchy(root, (node: Node) => node.children);
  const treeLayout = tree().nodeSize([nodeGapX, levelGapY]);

  treeLayout(layoutRoot);

  let minX = Number.POSITIVE_INFINITY;

  layoutRoot.each((entry: LayoutEntry) => {
    minX = Math.min(minX, entry.x);
  });

  const offsetX = startX - minX;

  layoutRoot.each((entry: LayoutEntry) => {
    entry.data.x = entry.x + offsetX;
    entry.data.y = entry.y + startY;
    entry.data.depth = entry.depth;
  });
}
