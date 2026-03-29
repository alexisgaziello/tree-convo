import { Node } from './Node';
import type { ConversationEdge } from './conversationSchema';
import { layoutConversationTree } from './layoutConversationTree';
import { currentTheme } from '../theme';
import { NODE_SELECT_EVENT, NODE_RADIUS, NODE_COLORS } from '../constants';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MIN_CANVAS_WIDTH = 240;
const MIN_CANVAS_HEIGHT = 240;
const CANVAS_PADDING_X = 64;
const CANVAS_PADDING_Y = 96;
const LABEL_OFFSET_X = 16;
const LABEL_FONT_SIZE = 11;
const LABEL_MAX_LENGTH = 28;

function getNodeLabel(node: Node): string {
  const compactText = node.text.replace(/\s+/g, ' ').trim();

  if (compactText.length <= LABEL_MAX_LENGTH) {
    return compactText;
  }

  return `${compactText.slice(0, LABEL_MAX_LENGTH).trimEnd()}…`;
}

function collectGraph(root: Node): {
  nodes: Node[];
  edges: ConversationEdge[];
} {
  const nodes: Node[] = [];
  const edges: ConversationEdge[] = [];

  function traverse(node: Node): void {
    nodes.push(node);

    for (const child of node.children) {
      edges.push({ from: node, to: child });
      traverse(child);
    }
  }

  traverse(root);

  return { nodes, edges };
}

function createSvg(width: number, height: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.display = 'block';
  svg.style.width = '100%';
  svg.style.height = 'auto';
  svg.style.maxWidth = '100%';
  svg.style.overflow = 'visible';
  return svg;
}

function appendGlowFilter(svg: SVGSVGElement): void {
  const defs = document.createElementNS(SVG_NS, 'defs');
  const glowFilter = document.createElementNS(SVG_NS, 'filter');
  glowFilter.setAttribute('id', 'chat-tree-node-glow');
  glowFilter.setAttribute('x', '-50%');
  glowFilter.setAttribute('y', '-50%');
  glowFilter.setAttribute('width', '200%');
  glowFilter.setAttribute('height', '200%');

  const blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '3');
  blur.setAttribute('result', 'blur');

  const merge = document.createElementNS(SVG_NS, 'feMerge');
  const mergeBlur = document.createElementNS(SVG_NS, 'feMergeNode');
  mergeBlur.setAttribute('in', 'blur');
  const mergeSource = document.createElementNS(SVG_NS, 'feMergeNode');
  mergeSource.setAttribute('in', 'SourceGraphic');

  merge.appendChild(mergeBlur);
  merge.appendChild(mergeSource);
  glowFilter.appendChild(blur);
  glowFilter.appendChild(merge);
  defs.appendChild(glowFilter);
  svg.appendChild(defs);
}

function appendEdge(svg: SVGSVGElement, edge: ConversationEdge): void {
  const edgeStroke = currentTheme === 'dark' ? NODE_COLORS.edge.dark : NODE_COLORS.edge.light;
  const path = document.createElementNS(SVG_NS, 'path');
  const midY = edge.from.y + (edge.to.y - edge.from.y) / 2;

  path.setAttribute(
    'd',
    `M ${edge.from.x} ${edge.from.y} C ${edge.from.x} ${midY}, ${edge.to.x} ${midY}, ${edge.to.x} ${edge.to.y}`
  );
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', edgeStroke);
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linecap', 'round');
  path.dataset.fromId = edge.from.id;
  path.dataset.toId = edge.to.id;
  svg.appendChild(path);
}

function appendNode(svg: SVGSVGElement, node: Node): void {
  const group = document.createElementNS(SVG_NS, 'g');
  const roleColor = node.isUser()
    ? NODE_COLORS.user
    : currentTheme === 'dark' ? NODE_COLORS.agent.dark : NODE_COLORS.agent.light;
  const roleGlow = node.isUser()
    ? NODE_COLORS.userGlow
    : currentTheme === 'dark' ? NODE_COLORS.agentGlow.dark : NODE_COLORS.agentGlow.light;
  const title = document.createElementNS(SVG_NS, 'title');
  title.textContent = `${node.type}: ${node.id}`;

  group.style.cursor = 'pointer';
  group.dataset.nodeId = node.id;
  if (node.parent) group.dataset.parentId = node.parent.id;

  const halo = document.createElementNS(SVG_NS, 'circle');
  halo.setAttribute('cx', String(node.x));
  halo.setAttribute('cy', String(node.y));
  halo.setAttribute('r', String(node.isUser() ? NODE_RADIUS + 5 : NODE_RADIUS + 6));
  halo.setAttribute('fill', roleGlow);
  halo.setAttribute('opacity', '0');

  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('cx', String(node.x));
  circle.setAttribute('cy', String(node.y));
  circle.setAttribute('r', String(NODE_RADIUS));
  circle.setAttribute('fill', roleColor);
  circle.setAttribute('stroke', 'rgba(255,255,255,0.9)');
  circle.setAttribute('stroke-width', '2');
  circle.setAttribute('filter', 'url(#chat-tree-node-glow)');

  const label = document.createElementNS(SVG_NS, 'text');
  label.setAttribute('x', String(node.x + LABEL_OFFSET_X));
  label.setAttribute('y', String(node.y + 4));
  const labelFill = currentTheme === 'dark' ? NODE_COLORS.label.dark : NODE_COLORS.label.light;
  label.setAttribute('fill', labelFill);
  label.setAttribute('font-size', String(LABEL_FONT_SIZE));
  label.setAttribute('font-family', 'system-ui, sans-serif');
  label.setAttribute('pointer-events', 'none');
  label.textContent = getNodeLabel(node);

  group.appendChild(title);
  group.appendChild(halo);
  group.appendChild(circle);
  group.appendChild(label);

  group.addEventListener('click', () => {
    window.dispatchEvent(
      new CustomEvent(NODE_SELECT_EVENT, {
        detail: {
          nodeId: node.id,
          metadata: node.metadata,
        },
      })
    );
  });

  svg.appendChild(group);
}

export function renderConversationTree(
  root: Node,
  container: HTMLElement
): void {
  container.innerHTML = '';

  layoutConversationTree(root);

  const { nodes, edges } = collectGraph(root);
  if (nodes.length === 0) {
    return;
  }
  const margin = NODE_RADIUS + 6;
  let minGraphX = Infinity, maxGraphX = -Infinity;
  let minGraphY = Infinity, maxGraphY = -Infinity;
  for (const node of nodes) {
    if (node.x - margin < minGraphX) minGraphX = node.x - margin;
    if (node.x + margin > maxGraphX) maxGraphX = node.x + margin;
    if (node.y - margin < minGraphY) minGraphY = node.y - margin;
    if (node.y + margin > maxGraphY) maxGraphY = node.y + margin;
  }
  const graphWidth = maxGraphX - minGraphX;
  const graphHeight = maxGraphY - minGraphY;
  const width = Math.max(graphWidth + CANVAS_PADDING_X * 2, MIN_CANVAS_WIDTH);
  const height = Math.max(graphHeight + CANVAS_PADDING_Y * 2, MIN_CANVAS_HEIGHT);
  const targetMinX = CANVAS_PADDING_X;
  const targetMinY = CANVAS_PADDING_Y;
  const offsetX = targetMinX - minGraphX;
  const offsetY = targetMinY - minGraphY;

  for (const node of nodes) {
    node.x += offsetX;
    node.y += offsetY;
  }

  const svg = createSvg(width, height);

  appendGlowFilter(svg);

  for (const edge of edges) {
    appendEdge(svg, edge);
  }

  for (const node of nodes) {
    appendNode(svg, node);
  }

  container.appendChild(svg);
}
