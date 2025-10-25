import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/ws': {
        target: 'http://145.79.13.143:8080',
        changeOrigin: true,
        ws: true,
      },
      '/app': {
        target: 'http://145.79.13.143:8080',
        changeOrigin: true,
      },
      '/topic': {
        target: 'http://145.79.13.143:8080',
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})
