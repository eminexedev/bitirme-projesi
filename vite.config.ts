import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { personalInfoApiHandler } from './server/personalInfoApi.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'personal-info-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (await personalInfoApiHandler(req, res)) return;
          next();
        });
      },
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'SecureKey Password Generator',
        short_name: 'SecureKey',
        description: 'Guvenli parola olusturma ve guc analizi uygulamasi',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})
