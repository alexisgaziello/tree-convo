import { APP_PREFIX } from './constants';

export const TREE_CONVO_NODE_SELECT_EVENT = `${APP_PREFIX}:node-select`;

export interface TreeConvoNodeSelectDetail {
  nodeId: string;
  metadata: Record<string, unknown>;
}