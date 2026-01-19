/**
 * Authentication Routes
 */

import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/user/views/AuthenticationView.vue'),
    meta: { requiresAuth: false, guest: true, title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/user/views/AuthenticationView.vue'),
    meta: { requiresAuth: false, guest: true, title: '注册' },
  },
]







