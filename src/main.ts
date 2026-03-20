import {
  buildTree,
  APP_IDS,
  APP_PREFIX,
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
    document.querySelector(`[data-message-id="${nodeId}"]`)
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

function renderFromDom(): void {
  if (!canvas) {
    return;
  }

  const snapshot = extractConversationSnapshot();

  if (snapshot.turns.length === 0) {
    return;
  }

  store.update(snapshot);

  if (snapshot.isStreaming) {
    return;
  }

  const nextSignature = store.signature();

  if (nextSignature === lastRenderedSignature) {
    return;
  }

  lastRenderedSignature = nextSignature;

  const input = store.toConversationNodeInput();

  if (!input) {
    return;
  }

  const root = buildTree(input);
  renderConversationTree(root, canvas);
  if (scrollContainer) syncTreeScroll(scrollContainer);
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

const ACTIVE_CLASS = `${APP_PREFIX}-active`;
const TREE_NODE_RADIUS = 8;

function highlightActiveNode(ratio: number): void {
  if (!canvas) return;
  const groups = canvas.querySelectorAll<SVGGElement>('[data-node-id]');
  if (groups.length === 0) return;
  const idx = Math.round(ratio * (groups.length - 1));
  for (let i = 0; i < groups.length; i++) {
    const halo = groups[i].querySelector('circle:nth-child(1)') as SVGCircleElement | null;
    const circle = groups[i].querySelector('circle:nth-child(2)') as SVGCircleElement | null;
    if (!circle || !halo) continue;
    if (i === idx) {
      circle.setAttribute('stroke-width', '4');
      circle.setAttribute('r', String(TREE_NODE_RADIUS + 2));
      halo.setAttribute('opacity', '0.55');
      groups[i].classList.add(ACTIVE_CLASS);
    } else if (groups[i].classList.contains(ACTIVE_CLASS)) {
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('r', String(TREE_NODE_RADIUS));
      halo.setAttribute('opacity', '0');
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
  const ratio = Math.min(scrollTop / maxScroll, 1);
  const treeMax = canvas.scrollHeight - canvas.clientHeight;
  if (treeMax > 0) canvas.scrollTop = ratio * treeMax;
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
  canvas.addEventListener(`${APP_PREFIX}:panel-opened`, () => {
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
