import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on GitHub Pages under /<repo-name>/.
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    // Three.js alone is ~550 kB minified; that is expected for a 3D app.
    chunkSizeWarningLimit: 800,
  },
});
