import { APP_IDS, TOGGLE_TOP_VH, TOGGLE_COLORS } from '../common/constants';
import chevronSvg from '../../assets/panel/chevron.svg?raw';
import iconSvg from '../../assets/icons/icon.svg?raw';

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

interface ToggleElements {
  toggle: HTMLButtonElement;
  peek: Element | null;
  full: Element | null;
}

function setExpanded({ toggle, peek, full }: ToggleElements, expanded: boolean): void {
  toggle.style.width = expanded
    ? `${TOGGLE_EXPANDED_WIDTH_PX}px`
    : `${TOGGLE_COLLAPSED_WIDTH_PX}px`;
  toggle.style.background = expanded ? TOGGLE_COLORS.background : TOGGLE_COLORS.backgroundFaded;
  toggle.style.borderColor = expanded ? TOGGLE_COLORS.border : TOGGLE_COLORS.borderFaded;
  toggle.style.boxShadow = expanded ? TOGGLE_COLORS.shadowExpanded : TOGGLE_COLORS.shadowCollapsed;

  if (peek instanceof HTMLElement) {
    setIconLayerStyles(peek, !expanded);
  }

  if (full instanceof HTMLElement) {
    setIconLayerStyles(full, expanded);
  }
}

function handlePointerMove(elements: ToggleElements, event: MouseEvent): void {
  const viewportDistance = window.innerWidth - event.clientX;
  const rect = elements.toggle.getBoundingClientRect();
  const withinVerticalRange =
    event.clientY >= rect.top - TOGGLE_VERTICAL_MARGIN_PX &&
    event.clientY <= rect.bottom + TOGGLE_VERTICAL_MARGIN_PX;

  setExpanded(elements, viewportDistance <= TOGGLE_PROXIMITY_PX && withinVerticalRange);
}

export function createButton(onToggle: () => void): void {
  if (document.getElementById(APP_IDS.panelToggle)) {
    return;
  }

  const toggle = document.createElement('button');
  toggle.id = APP_IDS.panelToggle;

  for (const [mode, svg] of [
    ['peek', chevronSvg],
    ['full', iconSvg],
  ] as const) {
    const span = document.createElement('span');
    span.dataset.mode = mode;
    span.setAttribute('aria-hidden', 'true');
    Object.assign(span.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    });
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    span.appendChild(document.importNode(doc.documentElement, true));
    toggle.appendChild(span);
  }
  toggle.setAttribute('aria-label', 'Toggle conversation tree');
  toggle.setAttribute('title', 'Toggle conversation tree');

  Object.assign(toggle.style, {
    position: 'fixed',
    top: `${TOGGLE_TOP_VH}vh`,
    right: '0',
    zIndex: '100001',
    border: `1px solid ${TOGGLE_COLORS.border}`,
    borderRight: '0',
    borderRadius: '10px 0 0 10px',
    background: TOGGLE_COLORS.background,
    color: TOGGLE_COLORS.text,
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
  const elements: ToggleElements = { toggle, peek, full };

  setExpanded(elements, false);

  toggle.addEventListener('click', () => {
    pulseToggle(toggle);
    onToggle();
  });
  toggle.addEventListener('mouseenter', () => setExpanded(elements, true));
  window.addEventListener('mousemove', (e) => handlePointerMove(elements, e));
  document.body.appendChild(toggle);
}
