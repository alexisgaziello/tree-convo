// Injects content.js into the page context via src (not inline, to comply with CSP).
const s = document.createElement('script');
s.src = browser.runtime.getURL('content.js');
(document.head || document.documentElement).appendChild(s);
