/**
 * 通知模块路由
 */
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/modules/notification/views/NotificationView.vue'),
    meta: {
      title: '通知中心',
      requiresAuth: true,
      layout: 'main'
    }
  }
]

export default routes
