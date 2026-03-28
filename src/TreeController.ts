import { buildTree, renderConversationTree, DomTreeStore, extractConversationSnapshot } from './index';
import { fetchConversationTree } from './api';
import { getConversationId } from './dom/selectors';
import type { ConversationNodeInput } from './graph/conversationSchema';

export class TreeController {
  private store = new DomTreeStore();
  private apiTree: ConversationNodeInput | null = null;
  private lastSignature = '';
  private lastUrl = location.href;
  private renderTimeout: number | null = null;
  private canvas: HTMLElement;
  private onRender: () => void;

  constructor(canvas: HTMLElement, onRender: () => void) {
    this.canvas = canvas;
    this.onRender = onRender;
  }

  private render(input: ConversationNodeInput): void {
    renderConversationTree(buildTree(input), this.canvas);
    this.onRender();
  }

  async loadFromApi(): Promise<void> {
    const id = getConversationId();
    if (!id) return;
    const tree = await fetchConversationTree(id);
    if (tree) {
      this.apiTree = tree;
      this.lastSignature = '';
      this.render(tree);
    }
  }

  renderFromDom(): void {
    const snapshot = extractConversationSnapshot();
    if (snapshot.turns.length === 0 || snapshot.isStreaming) return;

    if (this.apiTree) {
      this.loadFromApi();
      return;
    }

    this.store.update(snapshot);
    const sig = this.store.signature();
    if (sig === this.lastSignature) return;
    this.lastSignature = sig;

    const input = this.store.toConversationNodeInput();
    if (input) this.render(input);
  }

  scheduleRender(): void {
    if (this.renderTimeout !== null) window.clearTimeout(this.renderTimeout);
    this.renderTimeout = window.setTimeout(() => this.renderFromDom(), 150);
  }

  checkUrlChange(): void {
    if (location.href === this.lastUrl) return;
    this.lastUrl = location.href;
    this.reset();
    this.loadFromApi();
    this.scheduleRender();
  }

  reset(): void {
    this.store.reset();
    this.apiTree = null;
    this.lastSignature = '';
    this.canvas.innerHTML = '';
  }
}
