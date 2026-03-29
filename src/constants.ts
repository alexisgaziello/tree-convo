export const APP_PREFIX = 'tree-convo';

export const APP_IDS = {
  panel: 'chat-tree-panel',
  panelToggle: 'chat-tree-panel-toggle',
} as const;

export const NODE_SELECT_EVENT = `${APP_PREFIX}:node-select`;
export const PANEL_OPENED_EVENT = `${APP_PREFIX}:panel-opened`;

export interface NodeSelectDetail {
  nodeId: string;
  metadata: Record<string, unknown>;
}

export const PANEL_TOP_VH = 10;
export const PANEL_HEIGHT_VH = 80;
export const PANEL_WIDTH_VW = 15;
export const TOGGLE_TOP_VH = 25;
export const NODE_RADIUS = 8;

export const NODE_COLORS = {
  user: '#64748b',
  agent: { dark: '#e2e8f0', light: '#334155' },
  userGlow: 'rgba(100,116,139,0.3)',
  agentGlow: { dark: 'rgba(226,232,240,0.25)', light: 'rgba(51,65,85,0.25)' },
  activeHalo: 'rgba(59,130,246,0.5)',
  edge: { dark: 'rgba(148,163,184,0.45)', light: 'rgba(100,116,139,0.5)' },
  label: { dark: 'rgba(226,232,240,0.92)', light: 'rgba(30,41,59,0.9)' },
} as const;

/** Fraction of viewport height used as the anchor line for scroll-based node highlighting. */
export const VIEWPORT_ANCHOR = 0.25;

export const TOGGLE_COLORS = {
  background: '#111',
  backgroundFaded: 'rgba(17,17,17,0.9)',
  text: '#fff',
  border: 'rgba(255,255,255,0.18)',
  borderFaded: 'rgba(255,255,255,0.1)',
  shadowExpanded: '0 6px 20px rgba(0,0,0,0.28)',
  shadowCollapsed: '0 4px 12px rgba(0,0,0,0.2)',
} as const;
