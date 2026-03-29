import { defineConfig, mergeConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';
import { baseConfig } from '../../vite.config';

const ICONS_DIR = resolve(__dirname, '../../assets/icons/generated');
const ICON_FILES = ['icon-16.png', 'icon-48.png', 'icon-128.png'];

export default defineConfig(
  mergeConfig(baseConfig, {
    build: {
      outDir: resolve(__dirname, '../../dist/firefox'),
      lib: {
        entry: 'src/main.ts',
        formats: ['iife'],
        name: 'ChatTree',
        fileName: () => 'content.js',
      },
      rollupOptions: {
        output: { inlineDynamicImports: true },
      },
    },
    plugins: [
      {
        name: 'copy-firefox-assets',
        closeBundle() {
          const outDir = resolve(__dirname, '../../dist/firefox');
          copyFileSync(resolve(__dirname, 'manifest.json'), resolve(outDir, 'manifest.json'));
          copyFileSync(resolve(__dirname, 'inject.js'), resolve(outDir, 'inject.js'));
          for (const icon of ICON_FILES) {
            copyFileSync(resolve(ICONS_DIR, icon), resolve(outDir, icon));
          }
        },
      },
    ],
  })
);
