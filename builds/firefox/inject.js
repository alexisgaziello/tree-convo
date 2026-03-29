// Injects content.js into the page context so it has access to page cookies/fetch.
const s = document.createElement('script');
s.src = browser.runtime.getURL('content.js');
s.onload = () => s.remove();
(document.head || document.documentElement).appendChild(s);
