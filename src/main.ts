const CHAT_TREE_TOGGLE_BUTTON_ID = 'chat-tree-toggle-btn';
const CHAT_TREE_PANEL_ID = 'chat-tree-panel';

function createChatTreeToggleButton(): void {
  if (document.getElementById(CHAT_TREE_TOGGLE_BUTTON_ID)) return;

  const toggleButton = document.createElement('button');
  toggleButton.id = CHAT_TREE_TOGGLE_BUTTON_ID;
  toggleButton.textContent = 'Chat Tree';

  Object.assign(toggleButton.style, {
    position: 'fixed',
    top: '25vh',
    right: '16px',
    zIndex: '99999',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(17,17,17,0.9)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
  });

  toggleButton.addEventListener('click', () => {
    const panel = document.getElementById(CHAT_TREE_PANEL_ID);
    if (!panel) return;
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  document.body.appendChild(toggleButton);
}

function createChatTreePanel(): void {
  if (document.getElementById(CHAT_TREE_PANEL_ID)) return;

  const panel = document.createElement('div');
  panel.id = CHAT_TREE_PANEL_ID;

  Object.assign(panel.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '99998',
    display: 'none',
    background: 'rgba(0,0,0,0.08)',
    backdropFilter: 'blur(2px)'
  });

  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';

  Object.assign(closeButton.style, {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: '99999',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    background: 'rgba(17,17,17,0.9)',
    color: '#fff',
    fontSize: '18px',
    padding: '8px 12px',
    cursor: 'pointer'
  });

  closeButton.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  const canvas = document.createElement('div');
  canvas.id = 'chat-tree-canvas';

  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '0'
  });

  panel.appendChild(closeButton);
  panel.appendChild(canvas);
  document.body.appendChild(panel);
}

function init(): void {
  createChatTreeToggleButton();
  createChatTreePanel();
}

const observer = new MutationObserver(() => {
  if (
    !document.getElementById(CHAT_TREE_TOGGLE_BUTTON_ID) ||
    !document.getElementById(CHAT_TREE_PANEL_ID)
  ) {
    init();
  }
});

init();
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
