import type { RouteRecordRaw } from 'vue-router'

// 使用懒加载引入组件
// 如果有特定的 Layout 给作者后台使用，建议替换 MainLayout
const WriterLayout = () => import('@/modules/writer/layouts/WriterLayout.vue')

const writerRoutes: RouteRecordRaw[] = [
  {
    // 成为作者引导页 - 不需要author权限
    path: '/writer/become-author',
    name: 'become-author',
    component: () => import('./views/BecomeAuthor.vue'),
    meta: {
      title: '成为作者',
      requiresAuth: true,
    },
  },
  {
    path: '/writer',
    component: WriterLayout,
    meta: { requiresAuth: true }, // 登录用户均可进入，发布后自动升级作者身份
    children: [
      {
        path: '',
        redirect: { name: 'writer-dashboard' },
      },
      {
        path: 'dashboard',
        name: 'writer-dashboard',
        component: () => import('./views/WriterDashboard.vue'),
        meta: { title: '创作工作台' },
      },
      {
        path: 'projects',
        name: 'writer-projects',
        component: () => import('./views/ProjectListView.vue'),
        meta: { title: '我的项目' },
      },
      {
        // 项目概览/工作区 (通常是侧边栏+大纲+设定)
        path: 'project/:projectId',
        name: 'writer-project',
        component: () => import('./views/ProjectWorkspace.vue'),
        meta: { title: '项目管理' },
        props: true,
      },
      {
        path: 'encyclopedia/:projectId?',
        name: 'writer-encyclopedia',
        redirect: (to) => {
          const projectId = String(to.params.projectId || '')
          if (!projectId) {
            return { name: 'writer-dashboard', query: to.query }
          }
          return {
            name: 'writer-project',
            params: { projectId },
            query: { ...to.query, tool: 'encyclopedia' },
          }
        },
        meta: { title: '设定百科' },
      },
      {
        path: 'statistics/:bookId?',
        name: 'writer-statistics',
        component: () => import('./views/StatisticsView.vue'),
        meta: { title: '数据分析' },
        props: true,
      },
      {
        path: 'revenue/:bookId?',
        name: 'writer-revenue',
        component: () => import('./views/RevenueView.vue'),
        meta: { title: '稿费收入' },
        props: true,
      },
      {
        path: 'publish',
        name: 'writer-publish',
        component: () => import('./views/PublishManagementView.vue'),
        meta: { title: '发布管理' },
      },
    ],
  },
  {
    // 兼容旧编辑器链接，统一重定向到 writer-project 工作区
    path: '/writer/editor/:projectId/:chapterId?',
    name: 'writer-editor',
    redirect: (to) => ({
      name: 'writer-project',
      params: { projectId: to.params.projectId },
      query: {
        ...to.query,
        ...(to.params.chapterId ? { chapterId: String(to.params.chapterId) } : {}),
      },
    }),
    meta: {
      requiresAuth: true,
      deprecated: true,
      replacement: 'writer-project',
    },
  },
]

export default writerRoutes
