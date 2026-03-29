import { defineConfig, type UserConfig } from 'vite';
import { resolve } from 'path';

/** Shared Vite config that all build targets extend. */
export const baseConfig: UserConfig = {
  root: resolve(__dirname),
  build: {
    sourcemap: true,
  },
};

export default defineConfig(baseConfig);
