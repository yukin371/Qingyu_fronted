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
    component: () => import(/* webpackChunkName: "auth" */ '@/pages/Auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "auth" */ '@/pages/Auth/Register.vue'),
    meta: { requiresAuth: false, title: '注册' },
  },

  // ============ 书城（读者端）============
  {
    path: '/bookstore',
    name: 'Bookstore',
    component: () => import(/* webpackChunkName: "bookstore" */ '@/pages/Bookstore/Home.vue'),
    meta: { requiresAuth: false, title: '书城' },
  },
  {
    path: '/bookstore/category/:id',
    name: 'Category',
    component: () => import(/* webpackChunkName: "bookstore" */ '@/pages/Bookstore/Category.vue'),
    meta: { requiresAuth: false, title: '分类' },
  },
  {
    path: '/bookstore/search',
    name: 'Search',
    component: () => import(/* webpackChunkName: "bookstore" */ '@/pages/Bookstore/Search.vue'),
    meta: { requiresAuth: false, title: '搜索' },
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import(/* webpackChunkName: "bookstore" */ '@/pages/Book/Detail.vue'),
    meta: { requiresAuth: false, title: '书籍详情' },
  },

  // ============ 阅读器 ============
  {
    path: '/reader/:chapterId',
    name: 'Reader',
    component: () => import(/* webpackChunkName: "reader" */ '@/pages/Reader/Index.vue'),
    meta: { requiresAuth: false, title: '阅读' },
  },

  // ============ 用户中心 ============
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(/* webpackChunkName: "user" */ '@/pages/User/Profile.vue'),
    meta: { requiresAuth: true, title: '个人中心' },
  },
  {
    path: '/reading-history',
    name: 'ReadingHistory',
    component: () => import(/* webpackChunkName: "user" */ '@/pages/User/ReadingHistory.vue'),
    meta: { requiresAuth: true, title: '阅读历史' },
  },

  // ============ 写作端 ============
  {
    path: '/writer',
    name: 'WriterLayout',
    redirect: '/writer/projects',
    meta: { requiresAuth: true },
  },
  {
    path: '/writer/projects',
    name: 'writer-projects',
    component: () => import(/* webpackChunkName: "writer" */ '@/modules/writer/views/ProjectListView.vue'),
    meta: { requiresAuth: true, title: '我的项目' },
  },
  {
    path: '/writer/project/:projectId',
    name: 'writer-project',
    component: () => import(/* webpackChunkName: "writer" */ '@/modules/writer/views/ProjectWorkspace.vue'),
    meta: { requiresAuth: true, title: '项目工作区' },
  },
  {
    path: '/writer/editor/:documentId',
    name: 'writer-editor',
    component: () => import(/* webpackChunkName: "writer" */ '@/modules/writer/views/EditorView.vue'),
    meta: { requiresAuth: true, title: '编辑器' },
  },
  {
    path: '/writer/dashboard',
    name: 'writer-dashboard',
    component: () => import(/* webpackChunkName: "writer" */ '@/modules/writer/views/WriterDashboard.vue'),
    meta: { requiresAuth: true, title: '创作工作台' },
  },
  {
    path: '/writer/statistics/:bookId?',
    name: 'writer-statistics',
    component: () => import(/* webpackChunkName: "writer" */ '@/modules/writer/views/StatisticsView.vue'),
    meta: { requiresAuth: true, title: '作品统计' },
  },
  {
    path: '/writer/revenue/:bookId?',
    name: 'writer-revenue',
    component: () => import(/* webpackChunkName: "writer" */ '@/modules/writer/views/RevenueView.vue'),
    meta: { requiresAuth: true, title: '收入统计' },
  },
  {
    path: '/writer/publish',
    name: 'writer-publish',
    component: () => import(/* webpackChunkName: "writer" */ '@/modules/writer/views/PublishManagement.vue'),
    meta: { requiresAuth: true, title: '发布管理' },
  },

  // ============ 钱包 ============
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import(/* webpackChunkName: "user" */ '@/pages/Wallet/Index.vue'),
    meta: { requiresAuth: true, title: '我的钱包' },
  },

  // ============ 404 ============
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "error" */ '@/pages/Error/NotFound.vue'),
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
