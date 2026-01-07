import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/directus': {
        target: 'https://tto.com.ar',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/directus/, ''),
      },
    },
  },
})