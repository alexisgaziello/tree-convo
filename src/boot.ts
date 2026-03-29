import { APP_IDS } from './constants';
import { createPanel } from './panel/panel';
import { initTheme } from './theme';
import { getScrollContainer } from './dom/selectors';
import { syncTreePanelAfterRender } from './panel/treeTracking';
import { bindScrollAndSelect } from './panel/bindScrollAndSelect';
import { interceptConversationFetch } from './api';
import { TreeController } from './TreeController';

export function boot(): void {
  initTheme();
  createPanel();

  const canvas = document.getElementById(APP_IDS.panel);
  if (!canvas) return;

  const scrollContainer = getScrollContainer();
  const onRender = () => { if (scrollContainer) syncTreePanelAfterRender(canvas, scrollContainer); };
  const controller = new TreeController(canvas, onRender);

  // Intercept ChatGPT's own API responses — no extra requests needed.
  interceptConversationFetch((id, tree) => controller.handleConversation(id, tree));

  bindScrollAndSelect(canvas, scrollContainer, controller);
  window.addEventListener('popstate', () => controller.checkUrlChange());
}
