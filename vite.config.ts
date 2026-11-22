/// <reference types="vitest" />

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Set DEV_SERVER_PROXY=https://your-navidrome to sign in to http://localhost:5173
// without the server allowing cross-origin requests.
const devProxyTarget = process.env.DEV_SERVER_PROXY
const devProxy = devProxyTarget
  ? Object.fromEntries(
      ['/rest', '/auth', '/api'].map((path) => [path, { target: devProxyTarget, changeOrigin: true }])
    )
  : undefined

export default defineConfig({
  server: { proxy: devProxy },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
