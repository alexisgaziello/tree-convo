const PANEL_ANIMATION_MS = 220;
const PANEL_CLIP_OPEN = 'inset(0 0 0 0)';

function getClosedClipPath(originPercent: number): string {
  const safeOrigin = Math.max(0, Math.min(originPercent, 100));
  return `inset(${safeOrigin}% 0 ${100 - safeOrigin}% 100%)`;
}

function waitForAnimation(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, durationMs);
  });
}

function setOpenStyles(panel: HTMLElement): void {
  const originPercent = getAnimationOriginPercent(panel);

  panel.style.display = 'flex';
  panel.style.pointerEvents = 'none';
  panel.style.opacity = '0';
  panel.style.transform = 'translateX(18px) scaleX(0.08) scaleY(0.08)';
  panel.style.clipPath = getClosedClipPath(originPercent);
}

function setOpenActiveStyles(panel: HTMLElement): void {
  panel.style.opacity = '1';
  panel.style.transform = 'translateX(0) scaleX(1) scaleY(1)';
  panel.style.clipPath = PANEL_CLIP_OPEN;
}

function setClosedStyles(panel: HTMLElement): void {
  const originPercent = getAnimationOriginPercent(panel);

  panel.style.pointerEvents = 'none';
  panel.style.opacity = '0';
  panel.style.transform = 'translateX(18px) scaleX(0.08) scaleY(0.08)';
  panel.style.clipPath = getClosedClipPath(originPercent);
}

function setSettledOpenStyles(panel: HTMLElement): void {
  panel.style.pointerEvents = 'auto';
  panel.style.opacity = '1';
  panel.style.transform = 'translateX(0) scaleX(1) scaleY(1)';
  panel.style.clipPath = PANEL_CLIP_OPEN;
}

function applyAnimationBaseStyles(panel: HTMLElement): void {
  panel.style.transformOrigin = `right ${getAnimationOriginPercent(panel)}%`;
  panel.style.willChange = 'transform, opacity, clip-path';
  panel.style.transition = `opacity ${PANEL_ANIMATION_MS}ms ease, transform ${PANEL_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), clip-path ${PANEL_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
}

function getAnimationOriginPercent(panel: HTMLElement): number {
  const toggleTopVh = 25;
  const toggleHeightPx = 60;
  const panelTopVh = 10;
  const panelHeightVh = 80;
  const viewportHeight = window.innerHeight;
  const toggleCenterPx = (toggleTopVh / 100) * viewportHeight + toggleHeightPx / 2;
  const panelTopPx = (panelTopVh / 100) * viewportHeight;
  const panelHeightPx = (panelHeightVh / 100) * viewportHeight;

  return ((toggleCenterPx - panelTopPx) / panelHeightPx) * 100;
}

export function setupPanelAnimation(panel: HTMLElement): {
  open: () => Promise<void>;
  close: () => Promise<void>;
} {
  applyAnimationBaseStyles(panel);
  setClosedStyles(panel);

  async function open(): Promise<void> {
    setOpenStyles(panel);
    requestAnimationFrame(() => {
      setOpenActiveStyles(panel);
    });
    await waitForAnimation(PANEL_ANIMATION_MS);
    setSettledOpenStyles(panel);
  }

  async function close(): Promise<void> {
    setClosedStyles(panel);
    await waitForAnimation(PANEL_ANIMATION_MS);
    panel.style.display = 'none';
  }

  return { open, close };
}