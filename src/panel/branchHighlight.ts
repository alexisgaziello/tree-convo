import { NODE_COLORS } from '../constants';
import { getTurnElement } from '../dom/selectors';

const INACTIVE_BRANCH_OPACITY = '0.4';

/** Collect the set of node IDs on the active conversation path through the given node. */
export function collectBranchIds(canvas: HTMLElement, nodeId: string): Set<string> {
  const ids = new Set<string>();

  // Walk up to root.
  let current: string | undefined = nodeId;
  while (current) {
    ids.add(current);
    const parentId: string | undefined = canvas.querySelector<SVGGElement>(
      `[data-node-id="${current}"]`,
    )?.dataset.parentId;
    current = parentId;
  }

  // Walk down following only the child visible in the DOM.
  current = nodeId;
  while (current) {
    const children = canvas.querySelectorAll<SVGGElement>(`[data-parent-id="${current}"]`);
    let next: string | undefined;
    for (const child of children) {
      const childId = child.dataset.nodeId;
      if (childId && getTurnElement(childId)) {
        ids.add(childId);
        next = childId;
        break;
      }
    }
    current = next;
  }

  return ids;
}

/** Apply the active halo highlight and dim inactive branch nodes/edges. */
export function applyBranchHighlight(canvas: HTMLElement, nodeId: string): void {
  const branchIds = collectBranchIds(canvas, nodeId);

  // Reset and dim/undim node groups.
  const groups = canvas.querySelectorAll<SVGGElement>('[data-node-id]');
  for (const group of groups) {
    const id = group.dataset.nodeId!;
    const onBranch = branchIds.has(id);
    group.style.opacity = onBranch ? '' : INACTIVE_BRANCH_OPACITY;

    // Clear any previous halo.
    const halo = group.querySelector('circle:nth-child(2)') as SVGCircleElement | null;
    if (halo && halo.dataset.activeNode) {
      halo.setAttribute('opacity', '0');
      delete halo.dataset.activeNode;
    }
  }

  // Dim/undim edges.
  const edges = canvas.querySelectorAll<SVGPathElement>('[data-from-id]');
  for (const edge of edges) {
    const onBranch = branchIds.has(edge.dataset.fromId!) && branchIds.has(edge.dataset.toId!);
    edge.style.opacity = onBranch ? '' : INACTIVE_BRANCH_OPACITY;
  }

  // Apply active halo on the selected node.
  const activeGroup = canvas.querySelector<SVGGElement>(`[data-node-id="${nodeId}"]`);
  const halo = activeGroup?.querySelector('circle:nth-child(2)') as SVGCircleElement | null;
  if (halo) {
    halo.setAttribute('fill', NODE_COLORS.activeHalo);
    halo.setAttribute('opacity', '1');
    halo.dataset.activeNode = 'true';
  }
}
