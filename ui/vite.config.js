import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  define: {'process.env.NODE_ENV': JSON.stringify('production')},
  plugins: [react(), tailwindcss()],
  resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url))}},
  build: {
    lib: {entry: 'src/main.jsx', name: 'ClefReview', formats: ['iife'], fileName: () => 'report.js'},
    cssCodeSplit: false,
    rollupOptions: {output: {assetFileNames: 'report.[ext]'}},
  },
});
