import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Chat Tree',
        namespace: 'chat-tree',
        version: '0.1.0',
        description: 'Tree visualizer for branched ChatGPT conversations',
        match: [
          'https://chatgpt.com/*',
          'https://chat.openai.com/*'
        ],
        grant: 'none',
        'inject-into': 'page',
      }
    })
  ],
  build: {
    sourcemap: true
  }
});
