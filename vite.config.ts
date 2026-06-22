import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import { boneyardPlugin } from 'boneyard-js/vite'

export default defineConfig({
  plugins: [
    react(),
    boneyardPlugin({
      routes: ['/', '/general', '/category/local', '/category/regional', '/category/national'],
    }),
    // Exclude dev-only test files from production build
    {
      name: 'exclude-dev-files',
      resolveId(id) {
        if (id.includes('facebook-test')) {
          return { id: '\0excluded', external: true };
        }
        return null;
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['LOGO.jpg', 'LOGO.ico', 'favicon.svg', 'icons.svg'],
      manifest: {
        name: 'Radyo Bandera Surallah 98.1 FM',
        short_name: 'Radyo Bandera',
        description: 'Latest news and updates from Surallah, South Cotabato, and the Philippines.',
        theme_color: '#cc0000',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/LOGO.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: '/LOGO.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,jpg,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/graph\.facebook\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'facebook-api',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          // ponytail: SW serves cached API response while revalidating — sub-50ms on repeat visits
          {
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
        ],
      },
    }),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'react-vendor';
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/embla-carousel')) return 'ui-vendor';
          if (id.includes('node_modules/hls.js')) return 'media-vendor';
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/dompurify')) return 'utility-vendor';
          if (id.includes('node_modules/zustand')) return 'state-vendor';
          if (id.includes('node_modules/@sentry')) return 'monitoring-vendor';
          return undefined;
        },
      },
    },
    target: 'es2020',
    cssMinify: 'lightningcss',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
