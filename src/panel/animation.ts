import { APP_IDS } from '../constants';

const ANIMATION_MS = 380;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const TRANSITION = `transform ${ANIMATION_MS}ms ${EASING}, opacity ${ANIMATION_MS}ms ease, border-radius ${ANIMATION_MS}ms ${EASING}`;

// Mirror of layout constants from panel.ts and button.ts
const PANEL_TOP_VH = 10;
const PANEL_HEIGHT_VH = 80;
const PANEL_WIDTH_VW = 15;
const TOGGLE_TOP_VH = 25;
const TOGGLE_HEIGHT_PX = 60;
const TOGGLE_COLLAPSED_WIDTH_PX = 22;

function computeCollapsedState(): { dx: number; dy: number; sx: number; sy: number } {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  const panelTop = (PANEL_TOP_VH / 100) * vh;
  const panelH = (PANEL_HEIGHT_VH / 100) * vh;
  const panelW = (PANEL_WIDTH_VW / 100) * vw;
  const panelCx = vw - panelW / 2;
  const panelCy = panelTop + panelH / 2;

  const toggleTop = (TOGGLE_TOP_VH / 100) * vh;
  const toggleCx = vw - TOGGLE_COLLAPSED_WIDTH_PX / 2;
  const toggleCy = toggleTop + TOGGLE_HEIGHT_PX / 2;

  return {
    dx: toggleCx - panelCx,
    dy: toggleCy - panelCy,
    sx: TOGGLE_COLLAPSED_WIDTH_PX / panelW,
    sy: TOGGLE_HEIGHT_PX / panelH,
  };
}

function getOriginPx(): string {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  const panelTop = (PANEL_TOP_VH / 100) * vh;
  const panelW = (PANEL_WIDTH_VW / 100) * vw;

  const toggleTop = (TOGGLE_TOP_VH / 100) * vh;
  const toggleCx = vw - TOGGLE_COLLAPSED_WIDTH_PX / 2;
  const toggleCy = toggleTop + TOGGLE_HEIGHT_PX / 2;

  // Origin relative to panel's top-left (panel is right:0 so left = vw - panelW)
  const panelLeft = vw - panelW;
  const x = toggleCx - panelLeft;
  const y = toggleCy - panelTop;

  return `${x}px ${y}px`;
}

function collapsedTransform(): string {
  const { dx, dy, sx, sy } = computeCollapsedState();
  return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
}

function waitForAnimation(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ANIMATION_MS);
  });
}

export function setupPanelAnimation(panel: HTMLElement): {
  open: () => Promise<void>;
  close: () => Promise<void>;
} {
  panel.style.willChange = 'transform, opacity';

  async function open(): Promise<void> {
    panel.style.transition = 'none';
    panel.style.transformOrigin = getOriginPx();
    panel.style.transform = collapsedTransform();
    panel.style.opacity = '0';
    panel.style.borderRadius = '12px';
    panel.style.display = 'flex';
    panel.style.pointerEvents = 'none';

    requestAnimationFrame(() => {
      panel.style.transition = TRANSITION;
      panel.style.transform = 'translate(0, 0) scale(1, 1)';
      panel.style.opacity = '1';
      panel.style.borderRadius = '0px';
    });

    await waitForAnimation();
    panel.style.pointerEvents = 'auto';
  }

  async function close(): Promise<void> {
    panel.style.transformOrigin = getOriginPx();
    panel.style.transition = TRANSITION;
    panel.style.pointerEvents = 'none';
    panel.style.transform = collapsedTransform();
    panel.style.opacity = '0';
    panel.style.borderRadius = '12px';

    await waitForAnimation();
    panel.style.display = 'none';
  }

  return { open, close };
}
