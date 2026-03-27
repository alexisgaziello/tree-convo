import { APP_IDS, APP_PREFIX, PANEL_OPENED_EVENT, PANEL_TOP_VH, PANEL_WIDTH_VW, PANEL_HEIGHT_VH } from '../constants';
import { setupPanelAnimation } from './animation';
import { createButton } from './button';

const PANEL_FADE_VH = 10;
const PANEL_PADDING_PX = 16;
const PANEL_TOP_PADDING_PX = 56;

function getFadePercent(valueVh: number): number {
  return (valueVh / PANEL_HEIGHT_VH) * 100;
}

function getPanelMaskImage(): string {
  const fadePercent = getFadePercent(PANEL_FADE_VH);
  const solidStart = fadePercent;
  const solidEnd = 100 - fadePercent;

  return `linear-gradient(to bottom, transparent 0%, black ${solidStart}%, black ${solidEnd}%, transparent 100%)`;
}

export function createPanel(): void {
  if (document.getElementById(APP_IDS.panel)) {
    return;
  }

  const panel = document.createElement('div');
  panel.id = APP_IDS.panel;

  Object.assign(panel.style, {
    position: 'fixed',
    top: `${PANEL_TOP_VH}vh`,
    right: '0',
    width: `${PANEL_WIDTH_VW}vw`,
    height: `${PANEL_HEIGHT_VH}vh`,
    background: 'transparent',
    zIndex: '100000',
    display: 'none',
    overflow: 'auto',
    boxSizing: 'border-box',
    padding: `${PANEL_PADDING_PX}px`,
    paddingTop: `${PANEL_TOP_PADDING_PX}px`,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maskImage: getPanelMaskImage(),
    webkitMaskImage: getPanelMaskImage(),
  });

  const STORAGE_KEY = `${APP_PREFIX}:panel-open`;

  function storageGet(): string | null {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }
  function storageSet(v: string): void {
    try { localStorage.setItem(STORAGE_KEY, v); } catch { /* noop */ }
  }

  const animation = setupPanelAnimation(panel);
  let isOpen = false;
  let isAnimating = false;

  async function togglePanel(): Promise<void> {
    if (isAnimating) {
      return;
    }

    isAnimating = true;

    if (isOpen) {
      await animation.close();
      isOpen = false;
    } else {
      await animation.open();
      isOpen = true;
      panel.dispatchEvent(new Event(PANEL_OPENED_EVENT));
    }

    storageSet(String(isOpen));
    isAnimating = false;
  }

  createButton(togglePanel);

  document.body.appendChild(panel);

  if (storageGet() !== 'false') {
    togglePanel();
  }
}
