import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards' // 引入封装好的守卫

// 导入自动生成的路由
import { routes as autoRoutes } from 'vue-router/auto-routes'

// 导入布局系统包装函数
import { setupLayouts } from 'virtual:generated-layouts'

// 导入手动维护的路由（仅 auth 相关）
import { authRoutes } from './auth-routes'

// 导入模块路由（逐步迁移后将被移除）
import { errorRoutes } from './error-routes' // 废弃：将由 pages/[...all].page.vue 处理
// bookstoreRoutes 已迁移到 auto-routes ✅
import readerRoutes from '@/modules/reader/routes'
// userRoutes 已迁移到 auto-routes ✅
import writerRoutes from '@/modules/writer/routes'
import adminRoutes from '@/modules/admin/routes'
import financeRoutes from '@/modules/finance/routes'
import notificationRoutes from '@/modules/notification/routes'
import socialRoutes from '@/modules/social/routes'
import aiRoutes from '@/modules/ai/routes'

// 新增模块路由 (暂未实现，已注释)
// import reviewRoutes from '@/modules/review/routes'
// import discoveryRoutes from '@/modules/discovery/routes'
// import booklistRoutes from '@/modules/booklist/routes'
// import vipRoutes from '@/modules/vip/routes'
// import communityRoutes from '@/modules/community/routes'
// import achievementRoutes from '@/modules/achievement/routes'
// import readingStatsRoutes from '@/modules/reading-stats/routes'

// 定义路由元数据类型扩展
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[] // 支持角色数组配置
    layout?: 'blank' | 'main' | 'writer' // 支持布局配置
  }
}

// 手动添加的路由（重定向、auth 等）
const manualRoutes: RouteRecordRaw[] = [
  // / 永久重定向到 /bookstore
  { path: '/', redirect: '/bookstore' },

  // 兼容旧搜索路径
  { path: '/search', redirect: to => ({ path: '/bookstore/search', query: to.query }) },

  // 认证路由
  ...authRoutes,
]

// 模块路由（逐步迁移中，迁移完成后将移除）
// 注意：迁移模块时必须从下面的数组中移除对应路由
const moduleRoutes: RouteRecordRaw[] = [
  // bookstoreRoutes 已迁移到 auto-routes ✅
  ...readerRoutes,
  // userRoutes 已迁移到 auto-routes ✅
  ...writerRoutes,
  ...adminRoutes,
  ...financeRoutes,
  ...notificationRoutes,
  ...socialRoutes,
  ...aiRoutes,

  // 新增模块路由 (暂未实现，已注释)
  // ...reviewRoutes,
  // ...discoveryRoutes,
  // ...booklistRoutes,
  // ...vipRoutes,
  // ...communityRoutes,
  // ...achievementRoutes,
  // ...readingStatsRoutes,

  // 404 处理 (废弃：将由 pages/[...all].page.vue 处理)
  ...errorRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

// 合并所有路由：手动路由 + 模块路由 + 自动路由（使用布局包装）
const routes: RouteRecordRaw[] = [
  ...manualRoutes,
  ...moduleRoutes,
  ...setupLayouts(autoRoutes),
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // 如果是哈希跳转
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

// 初始化守卫
setupRouterGuards(router)

export default router
