// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://geoffreylacroixformation-blip.github.io/Level-Up-Formation',
  build: {
    assets: 'assets',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
