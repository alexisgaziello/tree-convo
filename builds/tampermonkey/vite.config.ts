import { defineConfig, mergeConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { resolve } from 'path';
import { baseConfig } from '../../vite.config';

export default defineConfig(
  mergeConfig(baseConfig, {
    plugins: [
      monkey({
        entry: 'src/main.ts',
        userscript: {
          name: 'Chat Tree',
          namespace: 'chat-tree',
          version: '1.1.0',
          description: 'Tree visualizer for branched ChatGPT conversations',
          icon: 'https://raw.githubusercontent.com/alexisgaziello/tree-convo/main/assets/icon.svg',
          match: ['https://chatgpt.com/*', 'https://chat.openai.com/*'],
          grant: 'none',
          'inject-into': 'page',
        },
      }),
    ],
    build: {
      outDir: resolve(__dirname, '../../dist/tampermonkey'),
    },
  }),
);
