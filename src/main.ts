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

window.addEventListener(TREE_CONVO_NODE_SELECT_EVENT, (event: Event) => {
  const detail = (event as CustomEvent<TreeConvoNodeSelectDetail>).detail;

  if (!detail.nodeId) {
    return;
  }

  centerConversationNode(detail.nodeId);
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
