import {
  buildTree,
  APP_IDS,
  createPanel,
  renderConversationTree,
  sampleConversationTree,
} from './index';

createPanel();

const canvas = document.getElementById(APP_IDS.panel);

if (canvas) {
  const root = buildTree(sampleConversationTree);
  renderConversationTree(root, canvas);
}
