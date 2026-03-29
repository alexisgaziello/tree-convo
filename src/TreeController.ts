import { buildTree, renderConversationTree } from './index';
import { fetchConversationTree } from './api';
import { getConversationId } from './dom/selectors';
import type { ConversationNodeInput } from './graph/conversationSchema';
import { Node } from './graph/Node';

/** Build a flat ID → Node lookup from a tree root. */
function indexTree(root: Node): Map<string, Node> {
  const map = new Map<string, Node>();
  const queue = [root];
  while (queue.length > 0) {
    const n = queue.pop()!;
    map.set(n.id, n);
    queue.push(...n.children);
  }
  return map;
}

export class TreeController {
  private lastUrl = location.href;
  private renderTimeout: number | null = null;
  private canvas: HTMLElement;
  private onRender: () => void;
  /** Flat lookup of all nodes by ID, rebuilt on each render. */
  nodeIndex: Map<string, Node> = new Map();

  constructor(canvas: HTMLElement, onRender: () => void) {
    this.canvas = canvas;
    this.onRender = onRender;
  }

  private render(input: ConversationNodeInput): void {
    const root = buildTree(input);
    this.nodeIndex = indexTree(root);
    renderConversationTree(root, this.canvas);
    this.onRender();
  }

  async loadFromApi(): Promise<void> {
    const id = getConversationId();
    if (!id) return;
    const tree = await fetchConversationTree(id);
    if (tree) this.render(tree);
  }

  /** Debounced API reload (e.g. after DOM mutations). */
  scheduleReload(): void {
    if (this.renderTimeout !== null) window.clearTimeout(this.renderTimeout);
    this.renderTimeout = window.setTimeout(() => this.loadFromApi(), 150);
  }

  checkUrlChange(): void {
    if (location.href === this.lastUrl) return;
    this.lastUrl = location.href;
    this.reset();
    this.loadFromApi();
  }

  reset(): void {
    this.nodeIndex.clear();
    this.canvas.innerHTML = '';
  }
}
