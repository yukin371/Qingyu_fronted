import type { Router, LocationQueryRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useAuthStore } from '@/stores/auth'

// 配置 NProgress
NProgress.configure({ showSpinner: false })

/**
 * 设置全局路由守卫
 */
export function setupRouterGuards(router: Router) {
  createProgressGuard(router)
  createTitleGuard(router)
  createAuthGuard(router)
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
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 3.1 登录状态检查
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath } as LocationQueryRaw,
      })
      return
    }

    // 3.2 已登录用户访问 Guest 页面 (如登录页) 自动跳走
    if (authStore.isLoggedIn && ['/login', '/register'].includes(to.path)) {
      next({ path: '/' }) // 或者是 /bookstore
      return
    }

    // 3.3 角色/权限检查
    // 假设路由 meta 中定义了 roles 数组: meta: { roles: ['writer', 'admin'] }
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const requiredRoles = to.meta.roles
      const hasRole = authStore.user?.roles?.some((role) => requiredRoles.includes(role))

      // 如果没有权限
      if (!hasRole) {
        // 如果是去作家后台，但没权限，可能是普通读者，跳转申请页或首页
        if (to.path.startsWith('/writer')) {
          // 可以跳转到一个 "申请成为作家" 的页面，或者直接回首页提示
          // next({ name: 'apply-writer' })
          next({ path: '/bookstore', query: { error: 'permission_denied' } })
        } else {
          next({ path: '/403' }) // 建议添加 403 页面
        }
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
