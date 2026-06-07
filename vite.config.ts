import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

// ES module-compatible __dirname replacement
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    // Optional: specify port if needed
    // port: 3000,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optional: rollup options
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  
  // Optional: optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
