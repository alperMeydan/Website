import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // Correct for abstractmindsbureau.com
  build: {
    outDir: 'dist', // Default output directory
    assetsDir: 'assets', // Assets will be in dist/assets/
    sourcemap: true, // Optional: for debugging
  },
  publicDir: 'public', // Ensure public folder is copied to dist
});