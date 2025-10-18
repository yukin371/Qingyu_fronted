import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/rankings',
      name: 'rankings',
      component: () => import('@/views/RankingsView.vue')
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('@/views/BooksView.vue')
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue')
    },
    // 用户认证路由
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录/注册', guest: true }
    },
    // 用户中心路由（需要认证）
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { title: '个人中心', requiresAuth: true }
    },
    // 管理员路由（需要管理员权限）
    {
      path: '/admin',
      name: 'admin',
      redirect: '/admin/users',
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UserManagement.vue'),
      meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/shared-api-test',
      name: 'shared-api-test',
      component: () => import('@/views/SharedAPITestView.vue')
    },
    {
      path: '/api-test',
      name: 'api-test',
      component: () => import('@/views/APITestView.vue'),
      meta: { title: 'API测试工具' }
    },
    {
      path: '/api-test-comprehensive',
      name: 'api-test-comprehensive',
      component: () => import('@/views/ComprehensiveAPITestView.vue'),
      meta: { title: '完整API测试工具' }
    },
    // Writer 模块路由
    {
      path: '/writer',
      name: 'writer',
      redirect: '/writer/projects',
      meta: { title: '青羽创作' }
    },
    {
      path: '/writer/projects',
      name: 'writer-projects',
      component: () => import('@/modules/writer/views/ProjectListView.vue'),
      meta: { title: '我的项目' }
    },
    {
      path: '/writer/project/:projectId',
      name: 'writer-project',
      component: () => import('@/modules/writer/views/ProjectWorkspace.vue'),
      meta: { title: '项目工作区' }
    },
    {
      path: '/writer/editor',
      name: 'writer-editor',
      component: () => import('@/modules/writer/views/EditorView.vue'),
      meta: { title: '编辑器' }
    },
    // 错误页面路由
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
    // 404页面必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/NotFound.vue'),
      meta: { title: '404 - 页面未找到' }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 青羽`
  } else {
    document.title = '青羽 - 在线阅读平台'
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // 未登录，跳转到登录页
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // 非管理员，跳转到403页面
      next({ name: 'forbidden' })
      return
    }
  }

  // 已登录用户访问登录页，跳转到首页
  if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
