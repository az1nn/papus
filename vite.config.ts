import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Universal Reader AI',
        short_name: 'Reader AI',
        description: 'Leitor universal de documentos com interfaces inteligentes',
        theme_color: '#101724',
        background_color: '#101724',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,js,mjs,css,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
      }
    })
  ]
});
