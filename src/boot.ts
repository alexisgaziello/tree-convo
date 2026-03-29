import { APP_IDS } from './constants';
import { createPanel } from './panel/panel';
import { initTheme } from './theme';
import { getScrollContainer } from './dom/selectors';
import { syncTreePanel } from './panel/treeTracking';
import { bindScrollAndSelect } from './panel/bindScrollAndSelect';
import { observeMain } from './dom/observeMain';
import { TreeController } from './TreeController';

export function boot(): void {
  initTheme();
  createPanel();

  const canvas = document.getElementById(APP_IDS.panel);
  if (!canvas) return;

  const scrollContainer = getScrollContainer();
  // Passed to TreeController so it can sync scroll position and highlight after each render.
  const onRender = () => { if (scrollContainer) syncTreePanel(canvas, scrollContainer); };
  const controller = new TreeController(canvas, onRender);

  controller.loadFromApi();
  controller.renderFromDom();

  // Binds ongoing scroll/select event listeners (separate from the per-render sync above).
  bindScrollAndSelect(canvas, scrollContainer);
  observeMain(() => { controller.checkUrlChange(); controller.scheduleRender(); });
  window.addEventListener('popstate', () => controller.checkUrlChange());
}
