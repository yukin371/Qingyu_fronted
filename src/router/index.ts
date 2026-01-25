import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards' // 引入封装好的守卫

// 导入自动生成的路由
import { routes as autoRoutes } from 'vue-router/auto-routes'

// 导入布局系统包装函数
import { setupLayouts } from 'virtual:generated-layouts'

// 导入手动维护的路由（仅 auth 相关）
import { authRoutes } from './auth-routes'

// ✅ 所有模块已迁移到 auto-routes！
// ✅ bookstore, reader, user, writer, admin, finance, notification, social, ai
// ✅ achievement, booklist, community, discovery, reading-stats, review, vip
// ✅ 所有 routes.ts 文件已删除，error-routes.ts 已删除
// ✅ 404 统一由 pages/[...all].page.vue 处理

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

// 模块路由已全部迁移到 auto-routes ✅
// 404 处理由 pages/[...all].page.vue 统一处理
const routes: RouteRecordRaw[] = [
  // 手动路由（重定向、auth 等）
  ...manualRoutes,
  // 自动路由（使用布局包装）
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
