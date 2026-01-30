import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Element Plus - 保留类型导入和部分组件
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

// Qingyu 全局服务
import { message, messageBox, notification } from '@/design-system/services'

// 主题系统 - 必须在样式之前初始化
import { initTheme } from '@/design-system/tokens/theme'
initTheme()  // 自动从 localStorage 读取保存的主题，如果没有则使用默认的青羽主题

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
// Element Plus - 仅保留部分组件（如 ElTree）
app.use(ElementPlus)

// 注册 Qingyu 全局服务（兼容 Element Plus API）
app.config.globalProperties.$message = message
app.config.globalProperties.$MessageBox = messageBox
app.config.globalProperties.$notify = notification

// 添加类型声明
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $message: typeof message
    $MessageBox: typeof messageBox
    $notify: typeof notification
  }
}

app.mount('#app')

