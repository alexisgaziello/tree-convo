import { setActiveNodeId, applyHighlight, findAnchorNodeId } from './activeNode';

/** Syncs the tree panel scroll position to match ChatGPT's thread scroll, and updates the active node highlight. */
export function syncTreePanel(canvas: HTMLElement, container: Element): void {
  if (canvas.offsetHeight === 0) return;

  const maxScroll = container.scrollHeight - container.clientHeight;
  if (maxScroll <= 0) return;

  const ratio = Math.min(container.scrollTop / maxScroll, 1);
  const treeMax = canvas.scrollHeight - canvas.clientHeight;
  if (treeMax > 0) canvas.scrollTop = ratio * treeMax;

  const id = findAnchorNodeId(canvas);
  if (id) {
    setActiveNodeId(id);
    applyHighlight(canvas, id);
  }
}
