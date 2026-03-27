import { PANEL_OPENED_EVENT, NODE_SELECT_EVENT, type NodeSelectDetail } from '../constants';
import { getTurnElement } from '../dom/selectors';
import { syncTreeScroll } from './scrollSync';

/** Scroll so the top of `el` sits at 1/4 from the top of the viewport. */
function scrollToQuarter(el: Element): void {
  const container = el.closest('[data-scroll-root]') ?? document.querySelector('main');
  if (!container) return;
  const elTop = el.getBoundingClientRect().top;
  const containerTop = container.getBoundingClientRect().top;
  const target = container.scrollTop + (elTop - containerTop) - window.innerHeight * 0.25;
  container.scrollTo({ top: target, behavior: 'smooth' });
}

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
    scrollToQuarter(el);
    setTimeout(() => { suppressSync = false; }, 600);
  });
}
