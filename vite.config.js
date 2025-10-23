import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
    server: {
    proxy: {
      '/api': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/edamam': {
        target: 'https://api.edamam.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/edamam/, '')
      }
    }
  }

});
