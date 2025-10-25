/**
 * Vue Router Configuration
 * Module-based routing with centralized configuration
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import module routes
import bookstoreRoutes from '@/modules/bookstore/routes'
import readerRoutes from '@/modules/reader/routes'
import userRoutes from '@/modules/user/routes'
import writerRoutes from '@/modules/writer/routes'
import adminRoutes from '@/modules/admin/routes'

// Error page routes
const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/Forbidden.vue'),
    meta: { title: '403 - 访问被拒绝' }
  },
  {
    path: '/500',
    name: 'server-error',
    component: () => import('@/views/error/ServerError.vue'),
    meta: { title: '500 - 服务器错误' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '404 - 页面未找到' }
  }
]

// Combine all routes
const routes: RouteRecordRaw[] = [
  ...bookstoreRoutes,
  ...readerRoutes,
  ...userRoutes,
  ...writerRoutes,
  ...adminRoutes,
  ...errorRoutes
]

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - 青羽`
  } else {
    document.title = '青羽 - 在线阅读平台'
  }

  // Check authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // Not logged in, redirect to auth page
      next({
        name: 'auth',
        query: { redirect: to.fullPath, mode: 'login' }
      })
      return
    }

    // Check admin permission
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // Not admin, redirect to 403
      next({ name: 'forbidden' })
      return
    }
  }

  // Logged in user trying to access guest-only pages
  if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'home' })
    return
  }

  next()
})

// Global after hooks
router.afterEach((to, from) => {
  // Track page views (if analytics is enabled)
  if (import.meta.env.PROD) {
    // TODO: Implement analytics tracking
    console.debug(`[Router] Navigated to ${to.path}`)
  }
})

export default router

