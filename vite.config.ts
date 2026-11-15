import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // we register manually in src/pwa/registerSW.ts to show the update toast
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Dr. Jacob Familoni',
        short_name: 'Familoni',
        description: 'The story, work and Nigerian initiatives of Dr. Jacob Familoni.',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0B0F1A',
        theme_color: '#0B0F1A',
        lang: 'en-NG',
        categories: ['education', 'lifestyle'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Apply to the AI School', url: '/apply', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Sponsor a Seat', url: '/support', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // App shell + all route chunks are precached, so core pages open offline.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['media/**', '**/Admin-*.js', '**/*-{cyrillic,cyrillic-ext,greek,greek-ext,vietnamese,latin-ext}-*.woff2'], // photos are cached on first view instead of downloaded at install (saves data)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/admin/, /^\/functions\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/media/'),
            handler: 'CacheFirst',
            options: { cacheName: 'site-media', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 60 } },
          },
          {
            // Google Fonts stylesheet + files
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
          },
          {
            // Public content reads (initiatives, tracks, gallery, counters). Fresh when online, last copy when offline.
            // Only public tables/views. Personal data (applicants, payments, sponsorships, requests) is never cached on device.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              url.hostname.endsWith('.supabase.co') &&
              /^\/rest\/v1\/(initiatives|tracks|cohorts|gallery_items|site_settings|public_impact|rpc\/public_impact)(\?|$|\/)/.test(url.pathname + (url.search ? '?' : '')),
            handler: 'NetworkFirst',
            options: { cacheName: 'public-content', networkTimeoutSeconds: 4, expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
          {
            // Gallery images from Supabase Storage
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/v1/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'media', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase')) return 'supabase'
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
