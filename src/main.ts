import {
  buildTree,
  APP_IDS,
  createPanel,
  DomTreeStore,
  extractConversationSnapshot,
  renderConversationTree,
} from './index';
import {
  TREE_CONVO_NODE_SELECT_EVENT,
  type TreeConvoNodeSelectDetail,
} from './events';
import { initTheme } from './theme';

initTheme();
createPanel();

const canvas = document.getElementById(APP_IDS.panel);
const store = new DomTreeStore();
let lastRenderedSignature = '';

function getTurnElement(nodeId: string): Element | null {
  return (
    document.querySelector(`section[data-turn-id="${nodeId}"]`) ??
    document.querySelector(`[data-message-id="${nodeId}"]`) ??
    document.querySelector(`[data-turn-id="${nodeId}"]`)
  );
}

function centerConversationNode(nodeId: string): void {
  const element = getTurnElement(nodeId);

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });
}

function logTreeNodes(): void {
  const snapshot = store.getSnapshot();
  const nodes = Object.values(snapshot.nodes);

  console.log('[tree-convo] nodes', nodes.length);

  for (const node of nodes) {
    console.log('[tree-convo] node', node.id, node.type);
  }
}

function getSnapshotSignature(): string {
  const snapshot = store.getSnapshot();

  return Object.values(snapshot.nodes)
    .map((node) => `${node.id}:${node.type}:${node.children.join(',')}`)
    .sort()
    .join('|');
}

function renderFromDom(): void {
  if (!canvas) {
    return;
  }

  const snapshot = extractConversationSnapshot();

  if (snapshot.turns.length === 0) {
    return;
  }

  store.update(snapshot);

  const nextSignature = getSnapshotSignature();

  if (nextSignature === lastRenderedSignature) {
    return;
  }

  lastRenderedSignature = nextSignature;
  logTreeNodes();

  const input = store.toConversationNodeInput();

  if (!input) {
    return;
  }

  const root = buildTree(input);
  renderConversationTree(root, canvas);
}

let renderTimeout: number | null = null;

function scheduleRender(): void {
  if (renderTimeout !== null) {
    window.clearTimeout(renderTimeout);
  }

  renderTimeout = window.setTimeout(() => {
    renderFromDom();
  }, 150);
}

renderFromDom();

const ACTIVE_CLASS = 'tree-convo-active';
const TREE_NODE_RADIUS = 8;

function highlightActiveNode(ratio: number): void {
  if (!canvas) return;
  const groups = canvas.querySelectorAll<SVGGElement>('[data-node-id]');
  if (groups.length === 0) return;
  const idx = Math.round(ratio * (groups.length - 1));
  for (let i = 0; i < groups.length; i++) {
    const circle = groups[i].querySelector('circle:nth-child(2)') as SVGCircleElement | null;
    if (!circle) continue;
    if (i === idx) {
      circle.setAttribute('stroke-width', '4');
      circle.setAttribute('r', String(TREE_NODE_RADIUS + 2));
      groups[i].classList.add(ACTIVE_CLASS);
    } else if (groups[i].classList.contains(ACTIVE_CLASS)) {
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('r', String(TREE_NODE_RADIUS));
      groups[i].classList.remove(ACTIVE_CLASS);
    }
  }
}

let suppressSync = false;

function syncTreeScroll(container: Element): void {
  if (!canvas || canvas.offsetHeight === 0) return;
  const { scrollTop, scrollHeight, clientHeight } = container;
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return;
  const ratio = scrollTop / maxScroll;
  const treeMax = canvas.scrollHeight - canvas.clientHeight;
  canvas.scrollTop = ratio * treeMax;
  highlightActiveNode(ratio);
}

const scrollContainer =
  document.querySelector('[data-scroll-root]') ??
  document.querySelector('main#main');

let scrollRaf: number | null = null;

function onConversationScroll(): void {
  if (scrollRaf !== null || suppressSync) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null;
    if (scrollContainer) syncTreeScroll(scrollContainer);
  });
}

if (scrollContainer) {
  scrollContainer.addEventListener('scroll', onConversationScroll, { passive: true });
}

if (canvas) {
  canvas.addEventListener('panel-opened', () => {
    if (scrollContainer) syncTreeScroll(scrollContainer);
  });
}

window.addEventListener(TREE_CONVO_NODE_SELECT_EVENT, (event: Event) => {
  const detail = (event as CustomEvent<TreeConvoNodeSelectDetail>).detail;

  if (!detail.nodeId) {
    return;
  }

  suppressSync = true;
  centerConversationNode(detail.nodeId);
  setTimeout(() => { suppressSync = false; }, 600);
});

const main = document.querySelector('main#main');

if (main) {
  const observer = new MutationObserver(() => {
    scheduleRender();
  });

  observer.observe(main, {
    childList: true,
    subtree: true,
  });
}
