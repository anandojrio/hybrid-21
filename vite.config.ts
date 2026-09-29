import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // The app asks before activating a new version ("Update available").
      registerType: 'prompt',
      includeAssets: ['icons/favicon-32.png', 'icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Hybrid 21',
        short_name: 'H21',
        description: 'Half-marathon, strength and hockey training plan.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#D7E8FA',
        theme_color: '#272B3A',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell, all lazy screens and the immutable plan are precached for offline use.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep large libraries out of the entry chunk so Today opens fast.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/recharts|d3-|victory|decimal\.js/.test(id)) return 'charts'
          if (/react-hook-form|@hookform|zod/.test(id)) return 'forms'
          if (/dexie/.test(id)) return 'storage'
          if (/[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'react'
          if (/motion|framer|radix|vaul|sonner|lucide/.test(id)) return 'ui'
          return undefined
        },
      },
    },
  },
})
