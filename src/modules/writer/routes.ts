/**
 * Writer Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const writerRoutes: RouteRecordRaw[] = [
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
        component: () => import('./views/ProjectListView.vue'),
        meta: { title: '我的项目', requiresAuth: true }
      },
      {
        path: 'project/:projectId',
        name: 'writer-project',
        component: () => import('./views/ProjectWorkspace.vue'),
        meta: { title: '项目工作区', requiresAuth: true },
        props: true
      },
      {
        path: 'editor',
        name: 'writer-editor',
        component: () => import('./views/EditorView.vue'),
        meta: { title: '编辑器', requiresAuth: true }
      },
      {
        path: 'statistics/:bookId?',
        name: 'writer-statistics',
        component: () => import('./views/StatisticsView.vue'),
        meta: { title: '作品统计', requiresAuth: true },
        props: true
      },
      {
        path: 'revenue/:bookId?',
        name: 'writer-revenue',
        component: () => import('./views/RevenueView.vue'),
        meta: { title: '收入统计', requiresAuth: true },
        props: true
      }
    ]
  }
]

export default writerRoutes

