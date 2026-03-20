import { APP_IDS } from '../constants';
import { setupPanelAnimation } from './animation';
import { createButton } from './button';

const PANEL_MARGIN_VH = 10;
const PANEL_FADE_VH = 10;
const PANEL_WIDTH_VW = 15;
const PANEL_PADDING_PX = 16;
const PANEL_TOP_PADDING_PX = 56;

function getPanelHeightVh(): number {
  return 100 - PANEL_MARGIN_VH * 2;
}

function getFadePercent(valueVh: number): number {
  return (valueVh / getPanelHeightVh()) * 100;
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
    top: `${PANEL_MARGIN_VH}vh`,
    right: '0',
    width: `${PANEL_WIDTH_VW}vw`,
    height: `${getPanelHeightVh()}vh`,
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
      panel.dispatchEvent(new Event('panel-opened'));
    }

    isAnimating = false;
  }

  createButton(togglePanel);

  document.body.appendChild(panel);
}
