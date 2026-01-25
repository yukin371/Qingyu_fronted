/**
 * Bookstore Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const bookstoreRoutes: RouteRecordRaw[] = [
  {
    path: '/bookstore',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('./views/HomeView.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'books',
        redirect: '/bookstore/browse'
      },
      {
        path: 'browse',
        name: 'browse',
        component: () => import('./views/BrowseBooksView.vue'),
        meta: { title: '浏览书籍' }
      },
      {
        path: 'books/:id',
        name: 'book-detail',
        component: () => import('./views/BookDetailView.vue'),
        meta: { title: '书籍详情' },
        props: true
      },
      {
        path: 'books-demo',
        name: 'book-detail-demo',
        component: () => import('./views/BookDetailDemo.vue'),
        meta: { title: '书籍详情（演示）' }
      },
      {
        path: 'categories',
        redirect: to => {
          const categoryId = to.query.id as string
          return {
            path: '/bookstore/browse',
            query: categoryId ? { categoryId } : undefined
          }
        }
      },
      {
        path: 'rankings',
        name: 'rankings',
        component: () => import('./views/RankingsView.vue'),
        meta: { title: '排行榜' }
      },
      {
        path: 'search',
        redirect: to => ({
          path: '/bookstore/browse',
          query: to.query
        })
      }
      ,
      {
        path: 'reader-demo',
        name: 'reader-demo',
        component: () => import('./views/ReaderDemo.vue'),
        meta: { title: '阅读器演示' }
      }
    ]
  }
]

export default bookstoreRoutes

