import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

// 主题系统 - 必须在样式之前初始化
import { initTheme } from '@/design-system/tokens/theme'
initTheme('qingyu')  // 初始化青羽主题

// 全局样式
import './style.css'  // Tailwind CSS - MUST be imported first
import '@/styles/variables.scss'
import '@/styles/common.scss'

// 全局指令
import { vLazy } from '@/directives/lazy'

// 全局错误处理
import { createVueErrorHandler, createPromiseRejectionHandler } from './utils/errorHandler'

// 性能监控
import { performanceMonitor, measureFirstScreenTime } from './utils/performance'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册全局指令
app.directive('lazy', vLazy)

// Vue错误处理
app.config.errorHandler = createVueErrorHandler()

// Promise拒绝处理
window.addEventListener('unhandledrejection', createPromiseRejectionHandler())

// 性能监控
const isDev = (import.meta as any).env?.DEV
if (isDev) {
  // 开发环境监控性能
  measureFirstScreenTime((time) => {
    console.log(`[Performance] 首屏渲染时间: ${time}ms`)
  })

  // 页面加载完成后输出性能报告
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = performanceMonitor.collectPageMetrics()
      console.log('[Performance] 页面性能指标:', metrics)
    }, 1000)
  })
}

// 先注册 Pinia，确保 store 可用
app.use(createPinia())
// 再注册 Router，路由守卫需要访问 store
app.use(router)
app.use(ElementPlus)

app.mount('#app')

