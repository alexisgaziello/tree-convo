import { buildTree } from '../graph';
import type { ConversationNodeInput } from '../graph';
import type { DomConversationSnapshot } from './types';

function toNodeType(role: string): 'user' | 'agent' {
  return role === 'assistant' ? 'agent' : 'user';
}

export function buildTreeFromSnapshot(snapshot: DomConversationSnapshot) {
  if (snapshot.turns.length === 0) {
    return null;
  }

  const [firstTurn, ...rest] = snapshot.turns;

  const root: ConversationNodeInput = {
    id: firstTurn.messageId ?? firstTurn.turnId,
    type: toNodeType(firstTurn.role),
    text: firstTurn.text,
    metadata: {
      turnId: firstTurn.turnId,
      messageId: firstTurn.messageId,
      modelSlug: firstTurn.modelSlug,
      variantIndexText: firstTurn.variantIndexText,
      hasEdit: firstTurn.hasEdit,
      hasPrevVariant: firstTurn.hasPrevVariant,
      hasNextVariant: firstTurn.hasNextVariant,
    },
    children: [],
  };

  let cursor = root;

  for (const turn of rest) {
    const nextNode: ConversationNodeInput = {
      id: turn.messageId ?? turn.turnId,
      type: toNodeType(turn.role),
      text: turn.text,
      metadata: {
        turnId: turn.turnId,
        messageId: turn.messageId,
        modelSlug: turn.modelSlug,
        variantIndexText: turn.variantIndexText,
        hasEdit: turn.hasEdit,
        hasPrevVariant: turn.hasPrevVariant,
        hasNextVariant: turn.hasNextVariant,
      },
      children: [],
    };

    cursor.children ??= [];
    cursor.children.push(nextNode);
    cursor = nextNode;
  }

  return buildTree(root);
}
