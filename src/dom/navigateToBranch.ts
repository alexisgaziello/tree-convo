import { Node } from '../graph/Node';
import { getTurnElement } from './selectors';

/**
 * Navigate ChatGPT's UI to show the branch containing `targetId`.
 *
 * Finds the fork point between the currently displayed branch and the target,
 * then clicks the branch navigation arrows at the fork to switch siblings.
 */
export async function navigateToBranch(
  targetId: string,
  nodeIndex: Map<string, Node>
): Promise<void> {
  const target = nodeIndex.get(targetId);
  if (!target) return;

  // Walk up from target to find the first ancestor whose parent has multiple children
  // AND whose sibling is currently visible in the DOM (i.e., the fork point).
  let forkChild: Node | null = null;
  let current: Node | null = target;
  while (current) {
    const parent = current.parent;
    if (parent && parent.children.length > 1) {
      // Check if a different sibling is currently displayed.
      const displayedSibling = parent.children.find(
        (c) => c !== current && getTurnElement(c.id)
      );
      if (displayedSibling) {
        forkChild = current;
        break;
      }
    }
    current = current.parent;
  }

  if (!forkChild || !forkChild.parent) return;

  const siblings = forkChild.parent.children;
  const targetIndex = siblings.indexOf(forkChild);
  if (targetIndex < 0) return;

  // Find which sibling is currently displayed to determine click direction.
  const currentIndex = siblings.findIndex((c) => getTurnElement(c.id));
  if (currentIndex < 0 || currentIndex === targetIndex) return;

  // Find the navigation buttons on the currently displayed sibling's DOM element.
  const currentEl = getTurnElement(siblings[currentIndex].id);
  if (!currentEl) return;

  const container = currentEl.closest('[data-message-id]') ?? currentEl;
  const prevBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Previous response"]');
  const nextBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Next response"]');

  if (!prevBtn && !nextBtn) return;

  const clicks = targetIndex - currentIndex;
  const btn = clicks > 0 ? nextBtn : prevBtn;
  if (!btn) return;

  for (let i = 0; i < Math.abs(clicks); i++) {
    btn.click();
    // Wait for ChatGPT to re-render between clicks.
    await new Promise((r) => setTimeout(r, 300));
  }
}
