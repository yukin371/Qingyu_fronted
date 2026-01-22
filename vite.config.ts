import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'

// 根据环境决定是否加载 VueDevTools
// Vitest 环境下禁用，避免兼容性问题
const isTest = process.env.VITEST || process.env.NODE_ENV === 'test'
const plugins = [vue()]
if (!isTest) {
  plugins.push(VueDevTools())
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@bookstore': fileURLToPath(new URL('./src/modules/bookstore', import.meta.url)),
      '@reader': fileURLToPath(new URL('./src/modules/reader', import.meta.url)),
      '@user': fileURLToPath(new URL('./src/modules/user', import.meta.url)),
      '@writer': fileURLToPath(new URL('./src/modules/writer', import.meta.url)),
      '@admin': fileURLToPath(new URL('./src/modules/admin', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/modules/shared', import.meta.url)),
      '@ai': fileURLToPath(new URL('./src/modules/ai', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true
  }
})
