import { APP_IDS } from './constants';
import { createPanel } from './panel/panel';
import { initTheme } from './theme';
import { getScrollContainer } from './dom/selectors';
import { syncTreeScroll } from './panel/scrollSync';
import { bindScrollAndSelect } from './panel/bindScrollAndSelect';
import { observeMain } from './dom/observeMain';
import { TreeController } from './TreeController';

export function boot(): void {
  initTheme();
  createPanel();

  const canvas = document.getElementById(APP_IDS.panel);
  if (!canvas) return;

  const scrollContainer = getScrollContainer();
  const sync = () => { if (scrollContainer) syncTreeScroll(canvas, scrollContainer); };
  const controller = new TreeController(canvas, sync);

  controller.loadFromApi();
  controller.renderFromDom();

  bindScrollAndSelect(canvas, scrollContainer);
  observeMain(() => { controller.checkUrlChange(); controller.scheduleRender(); });
  window.addEventListener('popstate', () => controller.checkUrlChange());
}
