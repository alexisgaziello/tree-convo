import { NODE_COLORS, VIEWPORT_ANCHOR } from '../constants';
import { getTurnElement } from '../dom/selectors';

/** Tracks the currently highlighted node ID across renders. */
let activeId: string | null = null;

export function getActiveNodeId(): string | null { return activeId; }
export function setActiveNodeId(id: string | null): void { activeId = id; }

/** Find the node ID whose DOM message is closest to the viewport anchor line. */
export function findAnchorNodeId(canvas: HTMLElement): string | null {
  const anchorY = window.innerHeight * VIEWPORT_ANCHOR;
  const groups = canvas.querySelectorAll<SVGGElement>('[data-node-id]');
  let bestId: string | null = null;
  let bestDist = Infinity;

  for (const group of groups) {
    const nodeId = group.dataset.nodeId;
    if (!nodeId) continue;
    const el = getTurnElement(nodeId);
    if (!el) continue;
    const dist = Math.abs(el.getBoundingClientRect().top - anchorY);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = nodeId;
    }
  }

  return bestId;
}

/** Apply the active halo highlight to a node by ID, clearing any previous highlight. */
export function applyHighlight(canvas: HTMLElement, nodeId: string): void {
  const prev = canvas.querySelector<SVGCircleElement>('[data-active-node]');
  if (prev) {
    prev.setAttribute('opacity', '0');
    prev.removeAttribute('data-active-node');
  }

  const group = canvas.querySelector<SVGGElement>(`[data-node-id="${nodeId}"]`);
  const halo = group?.querySelector('circle:nth-child(2)') as SVGCircleElement | null;
  if (!halo) return;

  halo.setAttribute('fill', NODE_COLORS.activeHalo);
  halo.setAttribute('opacity', '1');
  halo.dataset.activeNode = 'true';
}
