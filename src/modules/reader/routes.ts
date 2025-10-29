/**
 * Reader Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const readerRoutes: RouteRecordRaw[] = [
  {
    path: '/reader/:chapterId',
    name: 'reader',
    component: () => import('./views/ReaderView.vue'),
    meta: { title: '阅读器' },
    props: true
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'bookshelf',
        name: 'bookshelf',
        component: () => import('./views/BookshelfView.vue'),
        meta: { title: '我的书架', requiresAuth: true }
      },
      {
        path: 'reader/history',
        name: 'reading-history',
        component: () => import('./views/ReadingHistoryView.vue'),
        meta: { title: '阅读历史', requiresAuth: true }
      },
      {
        path: 'reader/bookmarks',
        name: 'bookmarks',
        component: () => import('./views/BookmarkManagementView.vue'),
        meta: { title: '我的书签', requiresAuth: true }
      },
      {
        path: 'comment/:commentId',
        name: 'comment-detail',
        component: () => import('./views/CommentDetailView.vue'),
        meta: { title: '评论详情' },
        props: true
      }
    ]
  }
]

export default readerRoutes

