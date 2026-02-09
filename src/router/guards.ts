import type { Router, LocationQueryRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAuthStore } from '@/stores/auth'
import { setupTestModeGuard } from './test-mode-guard'

// 配置 NProgress
NProgress.configure({ showSpinner: false })

/**
 * 设置全局路由守卫
 */
export function setupRouterGuards(router: Router) {
  createProgressGuard(router)
  createTitleGuard(router)
  createAuthGuard(router)
  setupTestModeGuard(router) // 设置测试模式守卫
}

/**
 * 1. 进度条守卫
 */
function createProgressGuard(router: Router) {
  router.beforeEach(() => {
    NProgress.start()
  })

  router.afterEach(() => {
    NProgress.done()
  })
}

/**
 * 2. 标题守卫
 */
function createTitleGuard(router: Router) {
  router.afterEach((to) => {
    // 使用 afterEach 设置标题更合理，防止跳转失败标题却变了
    const appTitle = import.meta.env.VITE_APP_TITLE || '青羽写作平台'
    if (to.meta.title) {
      document.title = `${to.meta.title} - ${appTitle}`
    } else {
      document.title = appTitle
    }
  })
}

/**
 * 3. 核心认证与权限守卫
 */
function createAuthGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    console.log('[Route Guard] Checking:', to.path)

    const authStore = useAuthStore()
    console.log('[Route Guard] Auth status:', authStore.isLoggedIn)

    // 处理 guest 页面（登录、注册等）- 已登录用户访问 guest 页面时重定向
    if (authStore.isLoggedIn && to.meta.guest) {
      console.log('[Route Guard] Redirecting guest page to /bookstore')
      next({ path: '/bookstore', replace: true })
      return
    }

    // 检查需要认证的页面
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      console.log('[Route Guard] Auth required, redirecting to /auth')
      next({
        path: '/auth',
        query: { redirect: to.fullPath } as LocationQueryRaw,
        replace: true,
      })
      return
    }

    // 已登录用户访问登录/注册页面时重定向
    if (authStore.isLoggedIn && !to.meta.guest && ['/login', '/register'].includes(to.path)) {
      console.log('[Route Guard] Redirecting logged-in user from login page')
      next({ path: '/bookstore', replace: true })
      return
    }

    // 3.3 角色/权限检查
    // writer 模块当前策略：登录即可访问，不再走角色门禁
    if (to.path.startsWith('/writer')) {
      next()
      return
    }

    // 其他模块仍按路由 meta.roles 做权限控制
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const requiredRoles = to.meta.roles
      const userRoles = authStore.roles?.length ? authStore.roles : authStore.user?.roles || []
      const hasRole = userRoles.some((role) => requiredRoles.includes(role))

      if (!hasRole) {
        next({ path: '/403', replace: true })
        return
      }
    }

    // 3.4 动态路由加载 (如果你的应用涉及后端返回路由表)
    // if (authStore.isLoggedIn && !authStore.routesLoaded) {
    //    await authStore.generateRoutes()
    //    next({ ...to, replace: true })
    //    return
    // }

    next()
  })
}
