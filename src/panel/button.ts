import { APP_IDS, TOGGLE_TOP_VH } from '../constants';
import chevronSvg from './icons/chevron.svg?raw';
import iconSvg from './icons/icon.svg?raw';

const TOGGLE_COLLAPSED_WIDTH_PX = 22;
const TOGGLE_EXPANDED_WIDTH_PX = 60;
const TOGGLE_HEIGHT_PX = 60;
const TOGGLE_PROXIMITY_PX = 140;
const TOGGLE_VERTICAL_MARGIN_PX = 48;
const TOGGLE_PRESS_ANIMATION_MS = 180;

function setIconLayerStyles(element: HTMLElement, visible: boolean): void {
  element.style.opacity = visible ? '1' : '0';
  element.style.transform = visible ? 'scale(1)' : 'scale(0.92)';
  element.style.transition = 'opacity 140ms ease, transform 180ms ease';
  element.style.position = 'absolute';
  element.style.inset = '0';
}

function pulseToggle(toggle: HTMLButtonElement): void {
  toggle.style.transform = 'scale(1.06)';

  window.setTimeout(() => {
    toggle.style.transform = 'scale(1)';
  }, TOGGLE_PRESS_ANIMATION_MS);
}

export function createButton(onToggle: () => void): void {
  if (document.getElementById(APP_IDS.panelToggle)) {
    return;
  }

  const toggle = document.createElement('button');
  toggle.id = APP_IDS.panelToggle;
  toggle.innerHTML = `
    <span data-mode="peek" aria-hidden="true" style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
      ${chevronSvg}
    </span>
    <span data-mode="full" aria-hidden="true" style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">
      ${iconSvg}
    </span>
  `;
  toggle.setAttribute('aria-label', 'Toggle conversation tree');
  toggle.setAttribute('title', 'Toggle conversation tree');

  Object.assign(toggle.style, {
    position: 'fixed',
    top: `${TOGGLE_TOP_VH}vh`,
    right: '0',
    zIndex: '100001',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRight: '0',
    borderRadius: '10px 0 0 10px',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${TOGGLE_COLLAPSED_WIDTH_PX}px`,
    height: `${TOGGLE_HEIGHT_PX}px`,
    padding: '0',
    lineHeight: '0',
    overflow: 'hidden',
    transition:
      'width 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
  });

  const peek = toggle.querySelector('[data-mode="peek"]');
  const full = toggle.querySelector('[data-mode="full"]');

  function setExpanded(expanded: boolean): void {
    toggle.style.width = expanded
      ? `${TOGGLE_EXPANDED_WIDTH_PX}px`
      : `${TOGGLE_COLLAPSED_WIDTH_PX}px`;
    toggle.style.background = expanded ? '#111' : 'rgba(17,17,17,0.9)';
    toggle.style.borderColor = expanded
      ? 'rgba(255,255,255,0.18)'
      : 'rgba(255,255,255,0.1)';
    toggle.style.boxShadow = expanded
      ? '0 6px 20px rgba(0,0,0,0.28)'
      : '0 4px 12px rgba(0,0,0,0.2)';

    if (peek instanceof HTMLElement) {
      setIconLayerStyles(peek, !expanded);
    }

    if (full instanceof HTMLElement) {
      setIconLayerStyles(full, expanded);
    }
  }

  function handlePointerMove(event: MouseEvent): void {
    const viewportDistance = window.innerWidth - event.clientX;
    const rect = toggle.getBoundingClientRect();
    const withinVerticalRange =
      event.clientY >= rect.top - TOGGLE_VERTICAL_MARGIN_PX &&
      event.clientY <= rect.bottom + TOGGLE_VERTICAL_MARGIN_PX;

    setExpanded(viewportDistance <= TOGGLE_PROXIMITY_PX && withinVerticalRange);
  }

  setExpanded(false);

  toggle.addEventListener('click', () => {
    pulseToggle(toggle);
    onToggle();
  });
  toggle.addEventListener('mouseenter', () => setExpanded(true));
  window.addEventListener('mousemove', handlePointerMove);
  document.body.appendChild(toggle);
}
