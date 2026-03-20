export type Theme = 'dark' | 'light';

export let currentTheme: Theme = 'light';

export function initTheme(): void {
  currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
