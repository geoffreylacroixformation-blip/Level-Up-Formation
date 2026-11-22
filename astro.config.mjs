// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://levelup-formation.pages.dev',
  build: {
    assets: 'assets',
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
