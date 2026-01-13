/**
 * AI管理模块路由
 */

import type { RouteRecordRaw } from 'vue-router'
import AIMainView from '../views/AIMainView.vue'
import AIProvidersView from '../views/AIProvidersView.vue'
import AIModelsView from '../views/AIModelsView.vue'
import AIHealthView from '../views/AIHealthView.vue'

const aiRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/ai',
    redirect: '/admin/ai/overview',
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'ai:manage'
    }
  },
  {
    path: '/admin/ai/overview',
    component: AIMainView,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'ai:manage',
      title: 'AI系统总览'
    }
  },
  {
    path: '/admin/ai/providers',
    component: AIProvidersView,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'ai:manage',
      title: 'AI提供商管理'
    }
  },
  {
    path: '/admin/ai/models',
    component: AIModelsView,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'ai:manage',
      title: 'AI模型管理'
    }
  },
  {
    path: '/admin/ai/health',
    component: AIHealthView,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      permission: 'ai:manage',
      title: 'AI健康检查'
    }
  }
]

export default aiRoutes
