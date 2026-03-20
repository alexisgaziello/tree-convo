import { APP_IDS } from '../constants';

export function createButton(onOpen: () => void): void {
  if (document.getElementById(APP_IDS.panelToggle)) {
    return;
  }

  const toggle = document.createElement('button');
  toggle.id = APP_IDS.panelToggle;
  toggle.innerHTML = `
    <svg width="44" height="44" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block; margin:auto;">
      <path d="M14 4V8M14 8H7M14 8H14M14 8H21M7 8V14M7 14H5M7 14H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="14" cy="4" r="2.2" fill="currentColor"/>
      <circle cx="7" cy="8" r="2.2" fill="currentColor"/>
      <circle cx="14" cy="8" r="2.2" fill="currentColor"/>
      <circle cx="21" cy="8" r="2.2" fill="currentColor"/>
      <circle cx="5" cy="14" r="2.2" fill="currentColor"/>
      <circle cx="9" cy="14" r="2.2" fill="currentColor"/>
    </svg>
  `;
  toggle.setAttribute('aria-label', 'Toggle conversation tree');
  toggle.setAttribute('title', 'Toggle conversation tree');

  Object.assign(toggle.style, {
    position: 'fixed',
    top: '25vh',
    right: '16px',
    zIndex: '100001',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '10px',
    background: '#111',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    padding: '0',
    lineHeight: '0',
  });

  toggle.addEventListener('click', onOpen);
  document.body.appendChild(toggle);
}
