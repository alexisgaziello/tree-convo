import { Node } from '../graph/Node';
import { getTurnElement } from './selectors';

interface ForkPoint {
  /** The child on the path toward the target. */
  child: Node;
  siblings: Node[];
  targetIndex: number;
}

/**
 * Collect every fork between `target` and the root where the target's
 * ancestor is not the currently displayed sibling. Returns them
 * shallowest-first so we can navigate top-down.
 */
function collectForks(target: Node): ForkPoint[] {
  const forks: ForkPoint[] = [];
  let current: Node | null = target;
  while (current) {
    const parent = current.parent;
    if (parent && parent.children.length > 1) {
      const targetIndex = parent.children.indexOf(current);
      if (targetIndex >= 0) {
        forks.push({ child: current, siblings: parent.children, targetIndex });
      }
    }
    current = current.parent;
  }
  return forks.reverse(); // shallowest first
}

/**
 * Click the prev/next navigation button on the currently displayed sibling
 * to switch to `targetIndex` within `siblings`.
 */
async function switchAtFork(siblings: Node[], targetIndex: number): Promise<boolean> {
  const currentIndex = siblings.findIndex((c) => getTurnElement(c.id));
  if (currentIndex < 0 || currentIndex === targetIndex) return currentIndex === targetIndex;

  const currentEl = getTurnElement(siblings[currentIndex].id);
  if (!currentEl) return false;

  const container = currentEl.closest('[data-message-id]') ?? currentEl;
  const clicks = targetIndex - currentIndex;
  const btn = container.querySelector<HTMLButtonElement>(
    `button[aria-label="${clicks > 0 ? 'Next' : 'Previous'} response"]`,
  );
  if (!btn) return false;

  for (let i = 0; i < Math.abs(clicks); i++) {
    btn.click();
    await new Promise((r) => setTimeout(r, 300));
  }
  return true;
}

/**
 * Navigate ChatGPT's UI to show the branch containing `targetId`.
 *
 * Collects all fork points between the target and the root, then navigates
 * them top-down (shallowest first) so that deeper branches become visible
 * before we try to switch them.
 */
export async function navigateToBranch(
  targetId: string,
  nodeIndex: Map<string, Node>,
): Promise<void> {
  const target = nodeIndex.get(targetId);
  if (!target) return;

  const forks = collectForks(target);

  for (const { siblings, targetIndex } of forks) {
    await switchAtFork(siblings, targetIndex);
  }
}
