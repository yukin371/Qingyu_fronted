/**
 * User Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'
import UserRedirect from './components/UserRedirect.vue'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: UserRedirect,
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('./views/AuthenticationView.vue'),
    meta: { title: '登录 / 注册', guest: true }
  },
  {
    path: '/account',
    component: MainLayout,
    children: [
      {
        path: 'profile',
        name: 'profile',
        component: () => import('./views/ProfileView.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'settings',
        redirect: '/account/settings/account',
        meta: { requiresAuth: true }
      },
      {
        path: 'settings/account',
        name: 'settings-account',
        component: () => import('./views/AccountSettings.vue'),
        meta: { title: '账户设置', requiresAuth: true }
      },
      {
        path: 'settings/security',
        name: 'settings-security',
        component: () => import('./views/SecuritySettings.vue'),
        meta: { title: '安全设置', requiresAuth: true }
      },
      {
        path: 'wallet',
        name: 'wallet',
        component: () => import('./views/WalletView.vue'),
        meta: { title: '我的钱包', requiresAuth: true }
      },
      {
        path: 'transfer',
        name: 'transfer',
        component: () => import('./views/TransferView.vue'),
        meta: { title: '转账', requiresAuth: true }
      },
      {
        path: 'user/:userId',
        name: 'user-profile',
        component: () => import('./views/AuthorProfile.vue'),
        meta: { title: '用户主页' },
        props: true
      },
      {
        path: 'reader/:userId',
        name: 'reader-profile',
        component: () => import('./views/ReaderProfile.vue'),
        meta: { title: '读者主页' },
        props: true
      }
    ]
  }
]

export default userRoutes
