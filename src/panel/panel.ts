import { APP_IDS, APP_PREFIX, PANEL_OPENED_EVENT, PANEL_TOP_VH, PANEL_WIDTH_VW, PANEL_HEIGHT_VH } from '../constants';
import { setupPanelAnimation } from './animation';
import { createButton } from './button';

const PANEL_PADDING_PX = 16;
const PANEL_TOP_PADDING_PX = 56;
const STORAGE_KEY = `${APP_PREFIX}:panel-open`;

/** CSS mask-image gradient that fades the panel's top and bottom edges to transparent. */
const PANEL_FADE_PERCENT = (10 / PANEL_HEIGHT_VH) * 100;
const PANEL_MASK_IMAGE = `linear-gradient(to bottom, transparent 0%, black ${PANEL_FADE_PERCENT}%, black ${100 - PANEL_FADE_PERCENT}%, transparent 100%)`;

function storageGet(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) !== 'false'; } catch { return true; }
}

function storageSet(v: boolean): void {
  try { localStorage.setItem(STORAGE_KEY, String(v)); } catch { /* noop */ }
}

interface PanelState {
  panel: HTMLElement;
  animation: ReturnType<typeof setupPanelAnimation>;
  isOpen: boolean;
  isAnimating: boolean;
}

async function openPanel(state: PanelState): Promise<void> {
  if (state.isAnimating || state.isOpen) return;
  state.isAnimating = true;
  await state.animation.open();
  state.isOpen = true;
  state.panel.dispatchEvent(new Event(PANEL_OPENED_EVENT));
  storageSet(true);
  state.isAnimating = false;
}

async function closePanel(state: PanelState): Promise<void> {
  if (state.isAnimating || !state.isOpen) return;
  state.isAnimating = true;
  await state.animation.close();
  state.isOpen = false;
  storageSet(false);
  state.isAnimating = false;
}

async function togglePanel(state: PanelState): Promise<void> {
  if (state.isOpen) {
    await closePanel(state);
  } else {
    await openPanel(state);
  }
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
    maskImage: PANEL_MASK_IMAGE,
    webkitMaskImage: PANEL_MASK_IMAGE,
  });

  const state: PanelState = {
    panel,
    animation: setupPanelAnimation(panel),
    isOpen: false,
    isAnimating: false,
  };

  createButton(() => togglePanel(state));

  document.body.appendChild(panel);

  if (storageGet()) {
    openPanel(state);
  }
}
