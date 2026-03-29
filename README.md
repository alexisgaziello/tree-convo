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

### Firefox

1. Run `pnpm build:firefox`
2. Go to `about:debugging` → "This Firefox"
3. Click "Load Temporary Add-on" → select `dist/firefox/manifest.json`

## Development

```bash
pnpm install
pnpm build:watch    # Rebuild userscript on file changes
pnpm typecheck      # Type check without emitting
pnpm test           # Run tests
pnpm test:watch     # Run tests in watch mode
```

## How It Works

1. Fetches the full conversation tree from ChatGPT's internal API (`/backend-api/conversation/:id`)
2. Builds a `Node` tree with parent/child relationships
3. Computes a top-down layout using `d3-hierarchy`
4. Renders nodes and edges as SVG in a fixed side panel
5. Syncs scroll position and highlights the active branch in real time

When you click a node on a different branch, Chat Tree finds the fork point and clicks ChatGPT's branch navigation arrows (`< 1/3 >`) to switch the visible conversation path.

## Project Structure

```
src/
  api/                  # API fetch + response parsing
  dom/                  # DOM selectors, mutation observer, branch navigation
  graph/                # Node class, tree building, layout, SVG rendering
  panel/                # Panel UI, button, scroll sync, highlighting
  constants.ts          # Colors, dimensions, event names
  boot.ts               # Entry point wiring
  main.ts               # Bootstrap (DOMContentLoaded guard)
builds/
  tampermonkey/         # Vite config + userscript metadata
  chrome/               # Vite config + MV3 manifest
  firefox/              # Vite config + MV2 manifest
  extension.config.ts   # Shared extension build logic
```

## Tech Stack

TypeScript, Vite, d3-hierarchy, SVG, vite-plugin-monkey

## License

MIT
