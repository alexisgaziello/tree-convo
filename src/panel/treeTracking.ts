import { getActiveNodeId, setActiveNodeId, findAnchorNodeId } from './activeNode';
import { applyBranchHighlight } from './branchHighlight';

/** Sync the tree panel scroll position to match ChatGPT's thread scroll ratio. */
function syncScrollPosition(canvas: HTMLElement, container: Element): void {
  if (canvas.offsetHeight === 0) return;

  const maxScroll = container.scrollHeight - container.clientHeight;
  if (maxScroll <= 0) return;

  const ratio = Math.min(container.scrollTop / maxScroll, 1);
  const treeMax = canvas.scrollHeight - canvas.clientHeight;
  if (treeMax > 0) canvas.scrollTop = ratio * treeMax;
}

/** Sync scroll position and recalculate the active node from viewport anchor. */
export function syncTreePanel(canvas: HTMLElement, container: Element): void {
  syncScrollPosition(canvas, container);

  const id = findAnchorNodeId(canvas);
  if (id) {
    setActiveNodeId(id);
    applyBranchHighlight(canvas, id);
  }
}

/** Sync scroll position and re-apply the existing active node highlight (after re-render). */
export function syncTreePanelAfterRender(canvas: HTMLElement, container: Element): void {
  syncScrollPosition(canvas, container);

  const id = getActiveNodeId() ?? findAnchorNodeId(canvas);
  if (id) {
    setActiveNodeId(id);
    applyBranchHighlight(canvas, id);
  }
}
