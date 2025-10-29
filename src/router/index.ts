/**
 * Vue Router 配置
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes: RouteRecordRaw[] = [
  // ============ 公开路由 ============
  {
    path: '/',
    redirect: '/bookstore',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/Auth/Register.vue'),
    meta: { requiresAuth: false, title: '注册' },
  },

  // ============ 书城（读者端）============
  {
    path: '/bookstore',
    name: 'Bookstore',
    component: () => import('@/pages/Bookstore/Home.vue'),
    meta: { requiresAuth: false, title: '书城' },
  },
  {
    path: '/bookstore/category/:id',
    name: 'Category',
    component: () => import('@/pages/Bookstore/Category.vue'),
    meta: { requiresAuth: false, title: '分类' },
  },
  {
    path: '/bookstore/search',
    name: 'Search',
    component: () => import('@/pages/Bookstore/Search.vue'),
    meta: { requiresAuth: false, title: '搜索' },
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import('@/pages/Book/Detail.vue'),
    meta: { requiresAuth: false, title: '书籍详情' },
  },

  // ============ 阅读器 ============
  {
    path: '/reader/:chapterId',
    name: 'Reader',
    component: () => import('@/pages/Reader/Index.vue'),
    meta: { requiresAuth: false, title: '阅读' },
  },

  // ============ 用户中心 ============
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/User/Profile.vue'),
    meta: { requiresAuth: true, title: '个人中心' },
  },
  {
    path: '/reading-history',
    name: 'ReadingHistory',
    component: () => import('@/pages/User/ReadingHistory.vue'),
    meta: { requiresAuth: true, title: '阅读历史' },
  },

  // ============ 写作端 ============
  {
    path: '/writer',
    name: 'WriterLayout',
    component: () => import('@/layouts/WriterLayout.vue'),
    meta: { requiresAuth: true, requiresWriter: true },
    children: [
      {
        path: '',
        redirect: '/writer/projects',
      },
      {
        path: 'projects',
        name: 'ProjectList',
        component: () => import('@/pages/Writer/ProjectList.vue'),
        meta: { title: '我的项目' },
      },
      {
        path: 'projects/:id',
        name: 'ProjectDetail',
        component: () => import('@/pages/Writer/ProjectDetail.vue'),
        meta: { title: '项目详情' },
      },
      {
        path: 'editor/:documentId',
        name: 'Editor',
        component: () => import('@/pages/Writer/Editor.vue'),
        meta: { title: '编辑器' },
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/pages/Writer/Statistics.vue'),
        meta: { title: '数据统计' },
      },
    ],
  },

  // ============ 钱包 ============
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import('@/pages/Wallet/Index.vue'),
    meta: { requiresAuth: true, title: '我的钱包' },
  },

  // ============ 404 ============
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/Error/NotFound.vue'),
    meta: { title: '页面不存在' },
  },
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
  const userStore = useUserStore()

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 青羽写作平台`
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // 检查是否需要写作权限
  if (to.meta.requiresWriter && !userStore.isWriter) {
    next({
      path: '/bookstore',
      query: { message: '需要写作权限' },
    })
    return
  }

  // 已登录用户访问登录/注册页，重定向到首页
  if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    next({ path: '/bookstore' })
    return
  }

  next()
})

export default router
