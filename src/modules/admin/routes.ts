/**
 * Admin Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/shared/components/layout/AdminLayout.vue'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('./views/DashboardView.vue'),
        meta: { title: '仪表板', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'reviews',
        name: 'admin-reviews',
        component: () => import('./views/ReviewManagement.vue'),
        meta: { title: '内容审核', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'withdrawals',
        name: 'admin-withdrawals',
        component: () => import('./views/WithdrawalManagement.vue'),
        meta: { title: '提现审核', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('./views/UserManagement.vue'),
        meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'logs',
        name: 'admin-logs',
        component: () => import('./views/OperationLogs.vue'),
        meta: { title: '操作日志', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'system-config',
        name: 'admin-system-config',
        component: () => import('./views/SystemConfig.vue'),
        meta: { title: '系统配置', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'banners',
        name: 'admin-banners',
        component: () => import('./views/BannerManagement.vue'),
        meta: { title: 'Banner管理', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'announcements',
        name: 'admin-announcements',
        component: () => import('./views/AnnouncementManagement.vue'),
        meta: { title: '公告管理', requiresAuth: true, requiresAdmin: true }
      }
    ]
  }
]

export default adminRoutes

