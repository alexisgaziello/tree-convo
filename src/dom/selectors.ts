export function getTurnElement(nodeId: string): Element | null {
  return (
    document.querySelector(`section[data-turn-id="${nodeId}"]`) ??
    document.querySelector(`[data-message-id="${nodeId}"]`)
  );
}

export function getScrollContainer(): Element | null {
  return document.querySelector('[data-scroll-root]') ?? document.querySelector('main#main');
}
