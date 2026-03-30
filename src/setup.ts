import { APP_IDS } from './common/constants';
import { createPanel } from './panel/panel';
import { initTheme } from './common/theme';
import { getScrollContainer, watchNavigation } from './common/dom';
import { syncTreePanelAfterRender } from './panel/treeTracking';
import { bindScrollAndSelect } from './panel/bindScrollAndSelect';
import { interceptConversationFetch } from './api';
import { TreeController } from './common/TreeController';
import type { ConversationNodeInput } from './tree/conversationSchema';

let pending: { id: string; tree: ConversationNodeInput }[] = [];
let controller: TreeController | null = null;

/** Install the fetch intercept. Must be called before ChatGPT's scripts run. */
export function installIntercept(): void {
  interceptConversationFetch((id, tree) => {
    if (controller) {
      controller.handleConversation(id, tree);
    } else {
      pending.push({ id, tree });
    }
  });
}

/** Boot the UI. Must be called once the DOM is ready. */
export function boot(): void {
  initTheme();
  createPanel();

  const canvas = document.getElementById(APP_IDS.panel);
  if (!canvas) return;

  const scrollContainer = getScrollContainer();
  const onRender = () => {
    if (scrollContainer) syncTreePanelAfterRender(canvas, scrollContainer);
  };
  controller = new TreeController(canvas, onRender);

  // Flush any conversations intercepted before the DOM was ready.
  for (const { id, tree } of pending) {
    controller.handleConversation(id, tree);
  }
  pending = [];

  bindScrollAndSelect(canvas, scrollContainer, controller);
  watchNavigation(() => controller!.checkUrlChange());
}
