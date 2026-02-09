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
    meta: { requiresAuth: true }, // 登录即可访问作者模块
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
    // 编辑器通常需要全屏，所以把它提取到 Layout 之外，或者使用 BlankLayout
    path: '/writer/editor/:projectId/:chapterId?',
    name: 'writer-editor',
    component: () => import('./views/EditorView.vue'),
    meta: {
      title: '编辑器',
      requiresAuth: true,
      layout: 'blank', // 标记为无布局
    },
    props: true,
  },
]

export default writerRoutes
