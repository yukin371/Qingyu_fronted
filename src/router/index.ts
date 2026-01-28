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
import financeRoutes from '@/modules/finance/routes'
import notificationRoutes from '@/modules/notification/routes'
import socialRoutes from '@/modules/social/routes'
import aiRoutes from '@/modules/ai/routes'

// Phase 1 模块路由
import booklistRoutes from '@/modules/booklist/routes'
import communityRoutes from '@/modules/community/routes'
import discoveryRoutes from '@/modules/discovery/routes'
import readingStatsRoutes from '@/modules/reading-stats/routes'

// 后续阶段模块路由 (暂未实现，已注释)
// import reviewRoutes from '@/modules/review/routes'
// import vipRoutes from '@/modules/vip/routes'
// import achievementRoutes from '@/modules/achievement/routes'

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

  // 搜索路由重定向（兼容旧路径）
  { path: '/search', redirect: to => ({ path: '/bookstore/search', query: to.query }) },

  ...authRoutes,
  ...bookstoreRoutes,
  ...readerRoutes,
  ...userRoutes,
  ...writerRoutes,
  ...adminRoutes,
  ...financeRoutes,
  ...notificationRoutes,
  ...socialRoutes,
  ...aiRoutes,

  // Phase 1 模块路由
  ...booklistRoutes,
  ...communityRoutes,
  ...discoveryRoutes,
  ...readingStatsRoutes,

  // 演示页面
  {
    path: '/demo/apple-style',
    name: 'demo-apple-style',
    component: () => import('@/views/demo/AppleStyleDemo.vue'),
    meta: {
      title: 'Apple 风格组件演示',
      layout: 'blank'
    }
  },
  {
    path: '/demo/qingyu-components',
    name: 'QingyuComponentsDemo',
    component: () => import('@/views/demo/QingyuComponentsDemo.vue'),
    meta: {
      title: '青羽组件库演示',
      layout: 'blank'
    }
  },
  {
    path: '/demo/navigation-components',
    name: 'NavigationComponentsDemo',
    component: () => import('@/views/demo/NavigationComponentsDemo.vue'),
    meta: {
      title: '青羽导航组件演示',
      layout: 'blank'
    }
  },
  {
    path: '/demo/advanced-components',
    name: 'AdvancedComponentsDemo',
    component: () => import('@/views/demo/AdvancedComponentsDemo.vue'),
    meta: {
      title: '青羽高级组件演示',
      layout: 'blank'
    }
  },

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
