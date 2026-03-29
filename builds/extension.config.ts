import { mergeConfig, type UserConfig } from 'vite';
import { resolve, basename } from 'path';
import { copyFileSync } from 'fs';
import { baseConfig } from '../vite.config';

const ICONS_DIR = resolve(__dirname, '../assets/icons/generated');
const ICON_FILES = ['icon-16.png', 'icon-48.png', 'icon-128.png'];

/** Shared extension build config. Each target passes its own dir. */
export function extensionConfig(buildDir: string): UserConfig {
  const targetName = basename(buildDir);
  const outDir = resolve(buildDir, '../../dist', targetName);

  return mergeConfig(baseConfig, {
    build: {
      outDir,
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
        name: 'copy-extension-assets',
        closeBundle() {
          copyFileSync(resolve(buildDir, 'manifest.json'), resolve(outDir, 'manifest.json'));
          for (const icon of ICON_FILES) {
            copyFileSync(resolve(ICONS_DIR, icon), resolve(outDir, icon));
          }
        },
      },
    ],
  });
}
