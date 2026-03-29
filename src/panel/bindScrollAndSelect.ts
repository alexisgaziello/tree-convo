import { PANEL_OPENED_EVENT, NODE_SELECT_EVENT, VIEWPORT_ANCHOR, type NodeSelectDetail } from '../constants';
import { getTurnElement } from '../dom/selectors';
import { syncTreePanel } from './treeTracking';
import { setActiveNodeId, applyHighlight } from './activeNode';

/** Scroll so the top of `el` sits at the viewport anchor line. */
function scrollToAnchor(el: Element): void {
  const container = el.closest('[data-scroll-root]') ?? document.querySelector('main');
  if (!container) return;
  const elTop = el.getBoundingClientRect().top;
  const containerTop = container.getBoundingClientRect().top;
  const target = container.scrollTop + (elTop - containerTop) - window.innerHeight * VIEWPORT_ANCHOR;
  container.scrollTo({ top: target, behavior: 'smooth' });
}

/** Binds ongoing event listeners for scroll sync and node selection. */
export function bindScrollAndSelect(canvas: HTMLElement, scrollContainer: Element | null): void {
  let scrollRaf: number | null = null;
  // True while a programmatic smooth-scroll is in flight — all scroll events are ignored.
  let scrollLocked = false;

  // Sync tree scroll and highlight on user scroll.
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      if (scrollRaf !== null || scrollLocked) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        syncTreePanel(canvas, scrollContainer);
      });
    }, { passive: true });
  }

  // Re-sync when the panel is opened (content may have changed while hidden).
  canvas.addEventListener(PANEL_OPENED_EVENT, () => {
    if (scrollContainer) syncTreePanel(canvas, scrollContainer);
  });

  // When a tree node is clicked, highlight it and scroll ChatGPT's thread to the matching message.
  window.addEventListener(NODE_SELECT_EVENT, (event: Event) => {
    const { nodeId } = (event as CustomEvent<NodeSelectDetail>).detail;
    if (!nodeId) return;

    setActiveNodeId(nodeId);
    applyHighlight(canvas, nodeId);

    const el = getTurnElement(nodeId);
    if (!el) return;
    scrollLocked = true;
    scrollToAnchor(el);
    setTimeout(() => { scrollLocked = false; }, 600);
  });
}
