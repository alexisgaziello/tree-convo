import { buildTree, renderConversationTree } from '../tree';
import type { ConversationNodeInput } from '../tree/conversationSchema';
import { Node } from '../tree/Node';

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
  private lastConversationId: string | null = null;
  private canvas: HTMLElement;
  private onRender: () => void;
  /** Flat lookup of all nodes by ID, rebuilt on each render. */
  nodeIndex: Map<string, Node> = new Map();

  constructor(canvas: HTMLElement, onRender: () => void) {
    this.canvas = canvas;
    this.onRender = onRender;
  }

  /** Called when a conversation response is intercepted. */
  handleConversation(conversationId: string, input: ConversationNodeInput): void {
    this.lastConversationId = conversationId;
    const root = buildTree(input);
    this.nodeIndex = indexTree(root);
    renderConversationTree(root, this.canvas);
    this.onRender();
  }

  /** Check if the URL changed to a different conversation. */
  checkUrlChange(): void {
    const match = location.pathname.match(/\/c\/([0-9a-f-]+)/);
    const currentId = match ? match[1] : null;
    if (currentId !== this.lastConversationId) {
      this.reset();
    }
  }

  reset(): void {
    this.lastConversationId = null;
    this.nodeIndex.clear();
    this.canvas.replaceChildren();
  }
}
