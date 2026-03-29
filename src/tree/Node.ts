import type { ConversationNodeRole } from './conversationSchema';

export class Node {
  public id: string;
  public type: ConversationNodeRole;
  public text: string;
  public parent: Node | null;
  public children: Node[];
  public metadata: Record<string, unknown>;

  public x: number;
  public y: number;
  public depth: number;

  constructor({
    id,
    type,
    text = '',
    parent = null,
    children = [],
    metadata = {},
  }: {
    id: string;
    type: ConversationNodeRole;
    text?: string;
    parent?: Node | null;
    children?: Node[];
    metadata?: Record<string, unknown>;
  }) {
    this.id = id;
    this.type = type;
    this.text = text;
    this.parent = parent;
    this.children = children;
    this.metadata = metadata;

    this.x = 0;
    this.y = 0;
    this.depth = 0;
  }

  addChild(childNode: Node): void {
    childNode.parent = this;
    childNode.depth = this.depth + 1;
    this.children.push(childNode);
  }

  isUser(): boolean {
    return this.type === 'user';
  }

  isAgent(): boolean {
    return this.type === 'agent';
  }
}
