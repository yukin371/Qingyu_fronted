import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 使用 MainLayout 的主要页面
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'books',
          name: 'books',
          component: () => import('@/views/BooksView.vue'),
          meta: { title: '书库' }
        },
        {
          path: 'books/:id',
          name: 'book-detail',
          component: () => import('@/views/BookDetailView.vue'),
          meta: { title: '书籍详情' }
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/CategoriesView.vue'),
          meta: { title: '分类' }
        },
        {
          path: 'rankings',
          name: 'rankings',
          component: () => import('@/views/RankingsView.vue'),
          meta: { title: '排行榜' }
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('@/views/SearchView.vue'),
          meta: { title: '搜索' }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: '个人中心', requiresAuth: true }
        },
        {
          path: 'bookshelf',
          name: 'bookshelf',
          component: () => import('@/views/BookshelfView.vue'),
          meta: { title: '我的书架', requiresAuth: true }
        },
        // 用户设置路由组
        {
          path: 'settings',
          name: 'settings',
          redirect: '/settings/account',
          meta: { requiresAuth: true }
        },
        {
          path: 'settings/account',
          name: 'settings-account',
          component: () => import('@/views/user/AccountSettings.vue'),
          meta: { title: '账户设置', requiresAuth: true }
        },
        {
          path: 'settings/security',
          name: 'settings-security',
          component: () => import('@/views/user/SecuritySettings.vue'),
          meta: { title: '安全设置', requiresAuth: true }
        }
      ]
    },

    // 管理员后台 - 使用 AdminLayout
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
          meta: { title: '仪表板', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'reviews',
          name: 'admin-reviews',
          component: () => import('@/views/admin/ReviewManagement.vue'),
          meta: { title: '内容审核', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'withdrawals',
          name: 'admin-withdrawals',
          component: () => import('@/views/admin/WithdrawalManagement.vue'),
          meta: { title: '提现审核', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
        },
        {
          path: 'logs',
          name: 'admin-logs',
          component: () => import('@/views/admin/OperationLogs.vue'),
          meta: { title: '操作日志', requiresAuth: true, requiresAdmin: true }
        }
      ]
    },

    // 阅读器 - 使用独立布局（全屏）
    {
      path: '/reader/:chapterId',
      name: 'reader',
      component: () => import('@/views/ReaderView.vue'),
      meta: { title: '阅读器' }
    },

    // 认证页面 - 使用独立布局
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthenticationView.vue'),
      meta: { title: '登录 / 注册', guest: true }
    },

    // Writer 模块路由 - 使用 MainLayout
    {
      path: '/writer',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/writer/projects'
        },
        {
          path: 'projects',
          name: 'writer-projects',
          component: () => import('@/modules/writer/views/ProjectListView.vue'),
          meta: { title: '我的项目' }
        },
        {
          path: 'project/:projectId',
          name: 'writer-project',
          component: () => import('@/modules/writer/views/ProjectWorkspace.vue'),
          meta: { title: '项目工作区' }
        },
        {
          path: 'editor',
          name: 'writer-editor',
          component: () => import('@/modules/writer/views/EditorView.vue'),
          meta: { title: '编辑器' }
        }
      ]
    },

    // 错误页面 - 使用独立布局
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
      // 未登录，跳转到认证页
      next({
        name: 'auth',
        query: { redirect: to.fullPath, mode: 'login' }
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

  // 已登录用户访问认证页，跳转到首页
  if (to.meta.guest && authStore.isLoggedIn) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
