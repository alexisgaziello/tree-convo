import { VIEWPORT_ANCHOR } from '../common/constants';
import { getTurnElement } from '../common/dom';

/** Tracks the currently highlighted node ID across renders. */
let activeId: string | null = null;

export function getActiveNodeId(): string | null {
  return activeId;
}
export function setActiveNodeId(id: string | null): void {
  activeId = id;
}

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
