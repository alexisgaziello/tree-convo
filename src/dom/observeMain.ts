
export function observeMain(onMutation: () => void): void {
  const main = document.querySelector('main#main');
  if (!main) return;
  new MutationObserver(onMutation).observe(main, { childList: true, subtree: true });
}
