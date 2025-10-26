/**
 * Bookstore Module Routes
 */

import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/shared/components/layout/MainLayout.vue'

const bookstoreRoutes: RouteRecordRaw[] = [
  {
    path: '/',
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
        name: 'books',
        component: () => import('./views/BooksView.vue'),
        meta: { title: '书库' }
      },
      {
        path: 'books/:id',
        name: 'book-detail',
        component: () => import('./views/BookDetailView.vue'),
        meta: { title: '书籍详情' },
        props: true
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('./views/CategoriesView.vue'),
        meta: { title: '分类' }
      },
      {
        path: 'rankings',
        name: 'rankings',
        component: () => import('./views/RankingsView.vue'),
        meta: { title: '排行榜' }
      },
      {
        path: 'search',
        name: 'search',
        component: () => import('./views/SearchView.vue'),
        meta: { title: '搜索' }
      }
    ]
  }
]

export default bookstoreRoutes

