import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@bookstore': fileURLToPath(new URL('./src/modules/bookstore', import.meta.url)),
      '@reader': fileURLToPath(new URL('./src/modules/reader', import.meta.url)),
      '@writer': fileURLToPath(new URL('./src/modules/writer', import.meta.url)),
      '@user': fileURLToPath(new URL('./src/modules/user', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/modules/admin', import.meta.url))
    },
  },
})
