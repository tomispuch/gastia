import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',

      // Usamos el manifest.json existente en public/
      manifest: false,

      // Assets estáticos a incluir en el precaché
      includeAssets: [
        'logo-icon.png', 'logo-gastia.png', 'logo-full.png',
        'Logo-trs.png', 'icon-192.png', 'icon-512.png',
      ],

      workbox: {
        // Precachear todos los assets del build
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MB

        // App Shell: ante navegación offline, servir el index.html cacheado
        navigateFallback: 'index.html',

        runtimeCaching: [
          {
            // Supabase API — NetworkFirst: intenta red, usa caché si no hay conexión
            urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hs
              },
            },
          },
          {
            // Google Fonts (estilos) — CacheFirst: raramente cambian
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 año
              },
            },
          },
          {
            // Google Fonts (archivos) — CacheFirst
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          // N8N webhooks NO se cachean (quedan fuera porque son externos
          // y no coinciden con ninguna de las reglas anteriores — van por red)
        ],
      },
    }),
  ],
})
