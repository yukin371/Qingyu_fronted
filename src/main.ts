import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Qingyu 全局服务
import { message, messageBox, notification } from '@/design-system/services'

// 主题系统 - 必须在样式之前初始化
import { initTheme } from '@/design-system/tokens/theme'
initTheme()  // 自动从 localStorage 读取保存的主题，如果没有则使用默认的青羽主题

// 测试模式 API 拦截器
import { initTestModeApiInterceptor } from '@/utils/test-mode-api-interceptor'
initTestModeApiInterceptor()  // 初始化测试模式 API 拦截器

// 全局样式
import './style.css'  // Tailwind CSS - MUST be imported first
import '@/styles/variables.scss'
import '@/styles/reader-variables.scss'  // TDD Phase 2: 阅读器设计系统变量
import '@/design-system/themes/vscode-dark.scss'  // VSCode 深色主题
import '@/styles/common.scss'

// 全局指令
import { vLazy } from '@/directives/lazy'

// 全局错误处理
import { createVueErrorHandler, createPromiseRejectionHandler } from './utils/errorHandler'

// 性能监控

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
  // 仅在开发环境按需加载调试能力，避免进入生产首屏主包
  void import('./utils/performance').then(({ performanceMonitor, measureFirstScreenTime }) => {
    measureFirstScreenTime((time) => {
      console.log(`[Performance] 首屏渲染时间: ${time}ms`)
    })

    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = performanceMonitor.collectPageMetrics()
        console.log('[Performance] 页面性能指标:', metrics)
      }, 1000)
    })
  })

  void import('./utils/api-health').then(({ initApiHealthCheck }) => {
    initApiHealthCheck()
  })
}

// 先注册 Pinia，确保 store 可用
app.use(createPinia())
// 再注册 Router，路由守卫需要访问 store
app.use(router)
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

// 空闲时补齐全量组件注册，避免后续页面因未注册组件报错
const runWhenIdle = (task: () => void) => {
  const requestIdle = (window as Window & {
    requestIdleCallback?: (() => void) => number
  }).requestIdleCallback

  if (requestIdle) {
    requestIdle(task)
    return
  }
  window.setTimeout(task, 800)
}

const bootstrap = async () => {
  const path = window.location.pathname || '/'
  const isBookstoreFirstScreen = path === '/' || path.startsWith('/bookstore')

  if (!isBookstoreFirstScreen) {
    // 非书城首屏优先保证完整组件可用，避免直达后台页面缺组件
    const { default: ElementPlus } = await import('element-plus')
    app.use(ElementPlus)
    app.mount('#app')
    return
  }

  app.mount('#app')

  runWhenIdle(() => {
    void import('element-plus').then(({ default: ElementPlus }) => {
      app.use(ElementPlus)
    })
  })
}

void bootstrap()
