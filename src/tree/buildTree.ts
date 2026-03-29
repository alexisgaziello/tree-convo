import { Node } from './Node';
import type { ConversationNodeInput } from './conversationSchema';

export function buildTree(
  rawNode: ConversationNodeInput,
  parent: Node | null = null,
  depth = 0,
): Node {
  const node = new Node({
    id: rawNode.id,
    type: rawNode.type,
    text: rawNode.text ?? '',
    parent,
    children: [],
    metadata: rawNode.metadata ?? {},
  });

  node.depth = depth;

  for (const rawChild of rawNode.children ?? []) {
    const childNode = buildTree(rawChild, node, depth + 1);
    node.children.push(childNode);
  }

  return node;
}
