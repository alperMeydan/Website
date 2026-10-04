import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/', // Correct for abstractmindsbureau.com
  build: {
    outDir: 'dist', // Default output directory
    assetsDir: 'assets', // Assets will be in dist/assets/
    sourcemap: true, // Optional: for debugging
    rollupOptions: {
      input: {
        en: fileURLToPath(new URL('./index.html', import.meta.url)),
        tr: fileURLToPath(new URL('./tr/index.html', import.meta.url)),
        ru: fileURLToPath(new URL('./ru/index.html', import.meta.url)),
      },
    },
  },
  publicDir: 'public', // Ensure public folder is copied to dist
});
