import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/rankings',
      name: 'rankings',
      component: () => import('@/views/RankingsView.vue')
    },
    {
      path: '/books',
      name: 'books',
      component: () => import('@/views/BooksView.vue')
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/views/CategoriesView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/AuthView.vue')
    },
    {
      path: '/shared-api-test',
      name: 'shared-api-test',
      component: () => import('@/views/SharedAPITestView.vue')
    },
    // Writer 模块路由
    {
      path: '/writer',
      name: 'writer',
      redirect: '/writer/projects',
      meta: { title: '青羽创作' }
    },
    {
      path: '/writer/projects',
      name: 'writer-projects',
      component: () => import('@/modules/writer/views/ProjectListView.vue'),
      meta: { title: '我的项目' }
    },
    {
      path: '/writer/project/:projectId',
      name: 'writer-project',
      component: () => import('@/modules/writer/views/ProjectWorkspace.vue'),
      meta: { title: '项目工作区' }
    },
    {
      path: '/writer/editor',
      name: 'writer-editor',
      component: () => import('@/modules/writer/views/EditorView.vue'),
      meta: { title: '编辑器' }
    },
    // 错误页面路由
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/views/error/Forbidden.vue'),
      meta: { title: '403 - 访问被拒绝' }
    },
    {
      path: '/500',
      name: 'server-error',
      component: () => import('@/views/error/ServerError.vue'),
      meta: { title: '500 - 服务器错误' }
    },
    // 404页面必须放在最后
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/error/NotFound.vue'),
      meta: { title: '404 - 页面未找到' }
    }
  ]
})

export default router
