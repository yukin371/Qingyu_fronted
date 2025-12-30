import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards' // 引入封装好的守卫

// 导入模块路由
import { authRoutes } from './auth-routes'
import { errorRoutes } from './error-routes'
import bookstoreRoutes from '@/modules/bookstore/routes'
import readerRoutes from '@/modules/reader/routes'
import userRoutes from '@/modules/user/routes'
import writerRoutes from '@/modules/writer/routes'
import adminRoutes from '@/modules/admin/routes'

// 定义路由元数据类型扩展
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[] // 支持角色数组配置
    layout?: 'blank' | 'main' | 'writer' // 支持布局配置
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/bookstore' },

  ...authRoutes,
  ...bookstoreRoutes,
  ...readerRoutes,
  ...userRoutes,
  ...writerRoutes,
  ...adminRoutes,

  // 404 处理 (必须放在最后)
  ...errorRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
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
