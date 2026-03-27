import { APP_PREFIX, NODE_RADIUS } from '../constants';

const ACTIVE_CLASS = `${APP_PREFIX}-active`;

export function highlightActiveNode(canvas: HTMLElement, ratio: number): void {
  const groups = canvas.querySelectorAll<SVGGElement>('[data-node-id]');
  if (groups.length === 0) return;
  const idx = Math.round(ratio * (groups.length - 1));
  for (let i = 0; i < groups.length; i++) {
    const halo = groups[i].querySelector('circle:nth-child(1)') as SVGCircleElement | null;
    const circle = groups[i].querySelector('circle:nth-child(2)') as SVGCircleElement | null;
    if (!circle || !halo) continue;
    if (i === idx) {
      circle.setAttribute('stroke-width', '4');
      circle.setAttribute('r', String(NODE_RADIUS + 2));
      halo.setAttribute('opacity', '0.55');
      groups[i].classList.add(ACTIVE_CLASS);
    } else if (groups[i].classList.contains(ACTIVE_CLASS)) {
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('r', String(NODE_RADIUS));
      halo.setAttribute('opacity', '0');
      groups[i].classList.remove(ACTIVE_CLASS);
    }
  }
}

export function syncTreeScroll(canvas: HTMLElement, container: Element): void {
  if (canvas.offsetHeight === 0) return;
  const { scrollTop, scrollHeight, clientHeight } = container;
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return;
  const ratio = Math.min(scrollTop / maxScroll, 1);
  const treeMax = canvas.scrollHeight - canvas.clientHeight;
  if (treeMax > 0) canvas.scrollTop = ratio * treeMax;
  highlightActiveNode(canvas, ratio);
}
