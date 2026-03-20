export const TREE_CONVO_NODE_SELECT_EVENT = 'tree-convo:node-select';

export interface TreeConvoNodeSelectDetail {
  nodeId: string;
  metadata: Record<string, unknown>;
}