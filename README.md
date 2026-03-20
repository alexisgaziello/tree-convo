# Chat Tree

Chat Tree is a Tampermonkey userscript that adds a visual tree view to ChatGPT conversations, making branch structure visible instead of hiding it behind the default linear UI.

The project is designed as a debugging and exploration tool for conversations that fork through edits, regenerations, and alternate response paths. It mounts an SVG-based graph in a right-hand panel so you can inspect the shape of a thread at a glance.

## Why This Exists

ChatGPT conversations can branch, but the product UI mostly shows a single active path. That makes it hard to answer questions like:

- Where did this branch start?
- Which assistant responses came from the same user prompt?
- What changed after an edit?
- How deep is this conversation really?

Chat Tree surfaces that hidden structure as a node-and-edge graph directly inside the ChatGPT page.

## Features

- Floating `Chat Tree` toggle mounted into the ChatGPT UI
- Right-side sidebar panel for tree inspection
- SVG rendering of conversation nodes and edges
- Visual distinction between roles:
  - user nodes in blue
  - assistant nodes in green
- DOM observer that remounts the UI when ChatGPT rerenders its page shell
- TypeScript-first codebase with a small, modular rendering pipeline
- Tree layout powered by `d3-hierarchy` for cleaner top-down branch positioning
- Tampermonkey-ready build output via Vite and `vite-plugin-monkey`

## How It Works

The script runs in the ChatGPT web app and adds its own UI layer on top of the existing page:

1. A floating toggle button opens the Chat Tree sidebar.
2. A fixed right-side panel hosts the visualization canvas.
3. Conversation data is transformed into a tree of `Node` instances.
4. A `d3-hierarchy` tree layout pass assigns top-down positions to each node.
5. The final graph is rendered as SVG.

At a high level, the architecture is organized around the actual Chat Tree responsibilities:

- `src/`
  Owns the page controls, panel shell, DOM persistence, conversation graph, and fixture data.

## Project Structure

```text
src/
  controls/
    createToggle.ts
    index.ts
    styles.ts
  fixtures/
    sampleConversationTree.ts
  graph/
    buildTree.ts
    conversationSchema.ts
    index.ts
    Node.ts
    layoutConversationTree.ts
    renderConversationTree.ts
  panel/
    createPanel.ts
    index.ts
    styles.ts
  ui/
    panelState.ts
  ids.ts
  index.ts
  mountUi.ts
  observeShell.ts
  main.ts
```

## Installation

### Prerequisites

- [pnpm](https://pnpm.io/)
- [Tampermonkey](https://www.tampermonkey.net/)
- A Chromium-based browser or Firefox

### Local Setup

```bash
pnpm install
pnpm build
```

This produces a Tampermonkey-compatible userscript bundle in `dist/`.

### Install the Userscript

1. Open the generated `.user.js` file from `dist/`.
2. Let Tampermonkey install it.
3. Visit `https://chatgpt.com/` or `https://chat.openai.com/`.
4. Open any conversation and click the `Chat Tree` button.

## Development

```bash
pnpm install
pnpm build:watch
```

Useful commands:

- `pnpm build` builds the userscript
- `pnpm build:watch` rebuilds on file changes
- `pnpm typecheck` runs TypeScript without emitting files
- `pnpm dev` starts Vite in dev mode

## Rendering Model

Each conversation turn is represented as a `Node` with:

- `id`
- `type` (`user` or `agent`)
- `parent`
- `children`
- `text`
- `metadata`
- layout state (`x`, `y`, `depth`)

The renderer then:

- computes a top-down tree layout with `d3-hierarchy`
- assigns coordinates for each node based on hierarchy depth and sibling spacing
- draws edges between parent and child nodes
- paints nodes by role
- labels nodes with their identity

## Architecture Notes

The project is intentionally structured so data extraction, layout, and rendering can evolve independently:

- extraction can change without rewriting the renderer
- layout can improve without changing the UI shell
- interaction can be layered on top of the existing SVG graph

This keeps the codebase friendly to experimentation, which is useful for a userscript targeting a fast-changing web app.

## ChatGPT DOM Research

The repository includes [`chatgpt_dom_structure_analysis.md`](./chatgpt_dom_structure_analysis.md), which documents the ChatGPT thread structure, stable selectors, and the branch signals used to reconstruct a logical conversation tree from a mostly linear DOM.

## Roadmap

- Extract live conversation data from the ChatGPT DOM instead of sample data
- Persist branch history across edits and regenerated responses
- Improve layout quality to reduce overlap in larger trees
- Click a node to jump to the corresponding message in the page
- Hover nodes for previews and metadata
- Highlight the currently active branch

## Tech Stack

- TypeScript
- Vite
- `vite-plugin-monkey`
- `d3-hierarchy`
- Tampermonkey
- SVG for rendering

## License

ISC
