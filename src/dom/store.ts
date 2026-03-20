import type { ConversationNodeInput } from '../graph';
import type { DomConversationSnapshot, DomTurnSnapshot } from './types';

type NodeType = 'user' | 'agent';

interface StoredNode {
  id: string;
  type: NodeType;
  text: string;
  metadata: Record<string, unknown>;
  children: string[];
  parentId: string | null;
}

export interface DomTreeStoreSnapshot {
  rootIds: string[];
  currentLeafId: string | null;
  nodes: Record<string, StoredNode>;
  lastSnapshot: DomConversationSnapshot | null;
}

function toNodeType(role: DomTurnSnapshot['role']): 'user' | 'agent' {
  return role === 'assistant' ? 'agent' : 'user';
}

function toMetadata(turn: DomTurnSnapshot): Record<string, unknown> {
  return {
    turnId: turn.turnId,
    turnType: turn.turnType,
    messageId: turn.messageId,
    role: turn.role,
    modelSlug: turn.modelSlug,
    variantIndexText: turn.variantIndexText,
    hasEdit: turn.hasEdit,
    hasPrevVariant: turn.hasPrevVariant,
    hasNextVariant: turn.hasNextVariant,
  };
}

function createStoredNode(
  turn: DomTurnSnapshot,
  parentId: string | null
): StoredNode {
  return {
    id: turn.turnId,
    type: toNodeType(turn.role),
    text: turn.text,
    metadata: toMetadata(turn),
    children: [],
    parentId,
  };
}

function turnsEqual(a: DomTurnSnapshot, b: DomTurnSnapshot): boolean {
  return (
    a.turnId === b.turnId &&
    a.role === b.role
  );
}

function findDivergenceIndex(
  previous: DomConversationSnapshot | null,
  next: DomConversationSnapshot
): number {
  if (!previous) {
    return 0;
  }

  const sharedLength = Math.min(previous.turns.length, next.turns.length);

  for (let index = 0; index < sharedLength; index += 1) {
    if (!turnsEqual(previous.turns[index], next.turns[index])) {
      return index;
    }
  }

  return sharedLength;
}

export class DomTreeStore {
  private state: DomTreeStoreSnapshot = {
    rootIds: [],
    currentLeafId: null,
    nodes: {},
    lastSnapshot: null,
  };

  update(snapshot: DomConversationSnapshot): DomTreeStoreSnapshot {
    if (snapshot.turns.length === 0) {
      this.state.lastSnapshot = snapshot;
      return this.getSnapshot();
    }

    const divergenceIndex = findDivergenceIndex(this.state.lastSnapshot, snapshot);
    let parentId: string | null = null;

    if (divergenceIndex > 0) {
      parentId = snapshot.turns[divergenceIndex - 1].turnId;
    }

    for (let index = 0; index < snapshot.turns.length; index += 1) {
      const turn = snapshot.turns[index];
      const nodeId = turn.turnId;
      const existingNode = this.state.nodes[nodeId];

      if (index < divergenceIndex) {
        if (existingNode) {
          existingNode.text = turn.text;
          existingNode.metadata = toMetadata(turn);
        }
        parentId = nodeId;
        continue;
      }

      if (!existingNode) {
        this.state.nodes[nodeId] = createStoredNode(turn, parentId);
      } else {
        existingNode.text = turn.text;
        existingNode.metadata = toMetadata(turn);
        existingNode.parentId = existingNode.parentId ?? parentId;
      }

      if (parentId) {
        const parent = this.state.nodes[parentId];
        if (parent && !parent.children.includes(nodeId)) {
          parent.children.push(nodeId);
        }
      } else if (!this.state.rootIds.includes(nodeId)) {
        this.state.rootIds.push(nodeId);
      }

      parentId = nodeId;
      this.state.currentLeafId = nodeId;
    }

    this.state.lastSnapshot = snapshot;
    return this.getSnapshot();
  }

  signature(): string {
    return Object.values(this.state.nodes)
      .map((n) => `${n.id}:${n.type}:${n.text}:${n.children.join(',')}`)
      .sort()
      .join('|');
  }

  toConversationNodeInput(): ConversationNodeInput | null {
    const [rootId] = this.state.rootIds;

    if (!rootId) {
      return null;
    }

    const buildNode = (nodeId: string): ConversationNodeInput => {
      const node = this.state.nodes[nodeId];

      return {
        id: node.id,
        type: node.type,
        text: node.text,
        metadata: node.metadata,
        children: node.children.map(buildNode),
      };
    };

    return buildNode(rootId);
  }

  getSnapshot(): DomTreeStoreSnapshot {
    return {
      rootIds: [...this.state.rootIds],
      currentLeafId: this.state.currentLeafId,
      nodes: Object.fromEntries(
        Object.entries(this.state.nodes).map(([id, node]) => [
          id,
          {
            ...node,
            children: [...node.children],
          },
        ])
      ),
      lastSnapshot: this.state.lastSnapshot
        ? {
            ...this.state.lastSnapshot,
            turns: [...this.state.lastSnapshot.turns],
          }
        : null,
    };
  }
}
