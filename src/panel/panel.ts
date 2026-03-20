import { APP_IDS } from '../constants';
import { createButton } from './button';

export function createPanel(): void {
  if (document.getElementById(APP_IDS.panel)) {
    return;
  }

  const panel = document.createElement('div');
  panel.id = APP_IDS.panel;

  Object.assign(panel.style, {
    position: 'fixed',
    top: '10vh',
    right: '0',
    width: '15vw',
    height: '80vh',
    background: 'transparent',
    zIndex: '100000',
    display: 'none',
    overflow: 'auto',
    boxSizing: 'border-box',
    padding: '16px',
    paddingTop: '56px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const closeButton = document.createElement('button');
  closeButton.id = APP_IDS.panelCloseButton;
  closeButton.textContent = '✕';
  closeButton.setAttribute('aria-label', 'Close conversation tree');
  closeButton.setAttribute('title', 'Close conversation tree');

  Object.assign(closeButton.style, {
    position: 'fixed',
    top: 'calc(10vh + 12px)',
    right: 'calc(15vw - 36px)',
    zIndex: '100003',
    width: '36px',
    height: '36px',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: '4px',
    background: '#dc2626',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
  });

  function openPanel(): void {
    panel.style.display = 'flex';
    closeButton.style.display = 'flex';
    const toggle = document.getElementById(APP_IDS.panelToggle);
    if (toggle instanceof HTMLElement) {
      toggle.style.display = 'none';
    }
  }

  function closePanel(): void {
    panel.style.display = 'none';
    closeButton.style.display = 'none';
    const toggle = document.getElementById(APP_IDS.panelToggle);
    if (toggle instanceof HTMLElement) {
      toggle.style.display = 'flex';
    }
  }

  createButton(openPanel);
  closeButton.addEventListener('click', closePanel);

  document.body.appendChild(panel);
  closeButton.style.display = 'none';
  document.body.appendChild(closeButton);
}
