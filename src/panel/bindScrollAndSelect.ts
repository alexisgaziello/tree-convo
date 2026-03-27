import { PANEL_OPENED_EVENT, NODE_SELECT_EVENT, type NodeSelectDetail } from '../constants';
import { getTurnElement } from '../dom/selectors';
import { syncTreeScroll } from './scrollSync';

export function bindScrollAndSelect(canvas: HTMLElement, scrollContainer: Element | null): void {
  const sync = () => { if (scrollContainer) syncTreeScroll(canvas, scrollContainer); };

  let scrollRaf: number | null = null;
  let suppressSync = false;

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      if (scrollRaf !== null || suppressSync) return;
      scrollRaf = requestAnimationFrame(() => { scrollRaf = null; sync(); });
    }, { passive: true });
  }

  canvas.addEventListener(PANEL_OPENED_EVENT, sync);

  window.addEventListener(NODE_SELECT_EVENT, (event: Event) => {
    const { nodeId } = (event as CustomEvent<NodeSelectDetail>).detail;
    if (!nodeId) return;
    const el = getTurnElement(nodeId);
    if (!el) return;
    suppressSync = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    setTimeout(() => { suppressSync = false; }, 600);
  });
}
