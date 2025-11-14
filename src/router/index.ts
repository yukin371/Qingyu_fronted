/**
 * Vue Router 配置
 *
 * 统一路由定义为聚合模式：
 * - 认证路由 (auth-routes.ts)
 * - 各模块路由 (modules/{module}/routes.ts)
 * - 错误路由 (error-routes.ts)
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 导入各部分路由
import { authRoutes } from './auth-routes'
import { errorRoutes } from './error-routes'
import bookstoreRoutes from '@/modules/bookstore/routes'
import readerRoutes from '@/modules/reader/routes'
import userRoutes from '@/modules/user/routes'
import writerRoutes from '@/modules/writer/routes'
import adminRoutes from '@/modules/admin/routes'

// 聚合所有路由
const routes: RouteRecordRaw[] = [
  // 默认重定向
  { path: '/', redirect: '/bookstore' },

  // 认证路由
  ...authRoutes,

  // 功能模块路由
  ...bookstoreRoutes,
  ...readerRoutes,
  ...userRoutes,
  ...writerRoutes,
  ...adminRoutes,

  // 错误路由（必须最后）
  ...errorRoutes,
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 青羽写作平台`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // 检查是否需要写作权限
  if (to.meta.requiresWriter && !authStore.roles.includes('writer') && !authStore.roles.includes('admin')) {
    next({
      path: '/bookstore',
      query: { message: '需要写作权限' },
    })
    return
  }

  // 已登录用户访问登录/注册页，重定向到首页
  if ((to.path === '/login' || to.path === '/register') && authStore.isLoggedIn) {
    next({ path: '/bookstore' })
    return
  }

  next()
})

export default router
