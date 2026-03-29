# Chat Tree

A browser extension and userscript that visualizes ChatGPT conversation branches as an interactive SVG tree.

ChatGPT conversations branch through edits, regenerations, and alternate responses — but the UI only shows one path at a time. Chat Tree adds a side panel that renders the full tree structure so you can see every branch at a glance.

## Features

- Side panel with SVG tree visualization of the full conversation
- Active branch highlighting — the current path is emphasized, inactive branches are dimmed
- Click any node to scroll to that message; click an off-branch node to switch branches automatically
- Scroll tracking — the tree highlights whichever message is near the top of the viewport
- Node colors by role (user vs assistant), with a blue halo on the active node
- Floating toggle button with hover expand animation
- Dark/light theme support
- Builds as a Tampermonkey userscript, Chrome extension, or Firefox extension from the same source

## Install

### Prerequisites

- [pnpm](https://pnpm.io/)
- [Tampermonkey](https://www.tampermonkey.net/) (for userscript), or a Chromium/Firefox browser (for extension)

### Build

```bash
pnpm install
pnpm build          # Tampermonkey userscript → dist/tampermonkey/
pnpm build:chrome   # Chrome extension → dist/chrome/
pnpm build:firefox  # Firefox extension → dist/firefox/
pnpm build:all      # All three
```

### Tampermonkey

1. Run `pnpm build`
2. Open `dist/tampermonkey/tree-convo.user.js`
3. Tampermonkey will prompt to install it

### Chrome

1. Run `pnpm build:chrome`
2. Go to `chrome://extensions` → enable Developer mode
3. Click "Load unpacked" → select `dist/chrome/`

### Firefox (Developer Edition or Nightly)

1. Run `pnpm build:firefox`
2. Set `xpinstall.signatures.required` to `false` in `about:config`
3. Go to `about:debugging` → "This Firefox"
4. Click "Load Temporary Add-on" → select any file in `dist/firefox/`

## Development

```bash
pnpm install
pnpm build:watch    # Rebuild userscript on file changes
pnpm typecheck      # Type check without emitting
pnpm lint           # Run ESLint
pnpm format:check   # Check Prettier formatting
pnpm test           # Run tests
pnpm test:watch     # Run tests in watch mode
```

A pre-commit hook (via Husky) automatically runs ESLint and Prettier on staged files.

## How It Works

1. Intercepts ChatGPT's own API responses (`/backend-api/conversation/:id`) via a `fetch` patch — no extra network requests
2. Parses the response into a `Node` tree with parent/child relationships
3. Computes a top-down layout using `d3-hierarchy`
4. Renders nodes and edges as SVG in a fixed side panel
5. Syncs scroll position and highlights the active branch in real time

When you click a node on a different branch, Chat Tree walks up to find every fork point between the current and target branches, then navigates them top-down by clicking ChatGPT's branch navigation arrows.

## Tech Stack

TypeScript, Vite, d3-hierarchy, SVG, vite-plugin-monkey

## License

MIT
