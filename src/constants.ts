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
