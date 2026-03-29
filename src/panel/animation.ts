import { PANEL_TOP_VH, PANEL_HEIGHT_VH, TOGGLE_TOP_VH } from '../common/constants';

const DURATION = 320;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const originY = ((TOGGLE_TOP_VH - PANEL_TOP_VH) / PANEL_HEIGHT_VH) * 100;
const ORIGIN = `100% ${originY}%`;

const COLLAPSED: Keyframe = {
  transform: 'scale(0.05, 0.08)',
  opacity: 0,
  borderRadius: '12px',
};

const EXPANDED: Keyframe = {
  transform: 'scale(1, 1)',
  opacity: 1,
  borderRadius: '0px',
};

const OPTIONS: KeyframeAnimationOptions = {
  duration: DURATION,
  easing: EASING,
  fill: 'forwards',
};

export function setupPanelAnimation(panel: HTMLElement): {
  open: () => Promise<void>;
  close: () => Promise<void>;
} {
  panel.style.transformOrigin = ORIGIN;

  async function open(): Promise<void> {
    panel.style.display = 'flex';
    await panel.animate([COLLAPSED, EXPANDED], OPTIONS).finished;
    panel.style.pointerEvents = 'auto';
  }

  async function close(): Promise<void> {
    panel.style.pointerEvents = 'none';
    await panel.animate([EXPANDED, COLLAPSED], OPTIONS).finished;
    panel.style.display = 'none';
  }

  return { open, close };
}
