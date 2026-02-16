<template>
  <div class="demo-hub">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <QyIcon name="flask" size="sm" />
          <span>Development Demo Hub</span>
        </div>
        <h1 class="hero-title">青羽组件库 <span class="gradient-text">Demo 中心</span></h1>
        <p class="hero-description">
          快速验证页面样式、组件功能与交互效果
          <br />
          所有页面自动启用 Mock 数据模式，无需后端支持
        </p>
        <div class="hero-actions">
          <QyButton variant="primary" size="lg" @click="scrollToDemos">
            <QyIcon name="arrow-down" size="sm" />
            浏览 Demo
          </QyButton>
          <QyButton variant="secondary" size="lg" @click="showHelp">
            <QyIcon name="question-circle" size="sm" />
            使用说明
          </QyButton>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ demoPages.length }}</div>
            <div class="stat-label">Demo 页面</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalComponents }}</div>
            <div class="stat-label">组件展示</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ businessPageCount }}</div>
            <div class="stat-label">业务页面</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" :class="{ active: isTestMode }">
              {{ isTestMode ? '已启用' : '未启用' }}
            </div>
            <div class="stat-label">Mock 模式</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Business Entrances Section -->
    <div class="business-entrances-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">业务模块直达</h2>
          <p class="section-subtitle">用于第 5 章实现展示的关键页面入口，自动附加 Mock 参数。</p>
        </div>
        <div class="entrance-grid">
          <div v-for="group in businessEntrances" :key="group.key" class="entrance-card">
            <div class="entrance-card-header">
              <div class="entrance-icon" :style="{ background: group.color }">
                <QyIcon :name="group.icon" size="md" />
              </div>
              <div>
                <h3 class="entrance-title">{{ group.title }}</h3>
                <p class="entrance-description">{{ group.description }}</p>
              </div>
            </div>
            <div class="entrance-buttons">
              <QyButton
                v-for="item in group.items"
                :key="item.key"
                size="sm"
                variant="secondary"
                class="entrance-btn"
                @click="navigateToRoute(item.route)"
              >
                {{ item.label }}
              </QyButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thesis Showcase Section -->
    <div class="thesis-showcase-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">第 5 章答辩直达</h2>
          <p class="section-subtitle">按论文小节组织：页面直达 + 建议展示代码文件，覆盖 5.1 ~ 5.4。</p>
        </div>
        <div class="showcase-grid">
          <div v-for="group in thesisShowcaseGroups" :key="group.key" class="showcase-card">
            <div class="showcase-header">
              <h3>{{ group.title }}</h3>
              <p>{{ group.description }}</p>
            </div>
            <div class="showcase-list">
              <div v-for="item in group.items" :key="item.section" class="showcase-row">
                <div class="showcase-main">
                  <span class="showcase-section">{{ item.section }}</span>
                  <span class="showcase-title">{{ item.title }}</span>
                </div>
                <div class="showcase-actions">
                  <QyButton size="sm" variant="secondary" @click="navigateToRoute(item.route)">
                    页面直达
                  </QyButton>
                </div>
                <div class="showcase-code">
                  <code>{{ item.frontendFile }}</code>
                  <code>{{ item.backendFile }}</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Demo Pages Section -->
    <div class="demos-section" ref="demosSectionRef">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">可用 Demo 页面</h2>
          <div class="section-actions">
            <QyInput
              v-model="searchQuery"
              placeholder="搜索 demo 页面..."
              size="md"
              class="search-input"
            >
              <template #prefix>
                <QyIcon name="search" size="sm" />
              </template>
            </QyInput>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="category-tabs">
          <button
            v-for="category in categories"
            :key="category.key"
            :class="['category-tab', { active: selectedCategory === category.key }]"
            @click="selectedCategory = category.key"
          >
            <QyIcon :name="category.icon" size="sm" />
            {{ category.label }}
            <span class="count">{{ getFilteredDemos(category.key).length }}</span>
          </button>
        </div>

        <!-- Demo Cards Grid -->
        <div class="demos-grid">
          <div
            v-for="demo in filteredDemos"
            :key="demo.key"
            class="demo-card"
            @click="navigateToDemo(demo)"
          >
            <div class="card-header">
              <div class="card-icon" :style="{ background: demo.color }">
                <QyIcon :name="demo.icon" size="md" />
              </div>
              <div class="card-badges">
                <QyBadge v-if="demo.new" type="status" text="NEW" color="cyan" />
                <QyBadge v-if="demo.updated" type="status" text="UPDATED" color="blue" />
                <QyBadge v-if="demo.business" type="status" text="业务页面" color="purple" />
                <QyBadge v-else type="status" :text="getCategoryName(demo.category)" color="green" />
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ demo.title }}</h3>
              <p class="card-description">{{ demo.description }}</p>
              <div class="card-meta">
                <span class="meta-item">
                  <QyIcon name="Grid" size="xs" />
                  {{ demo.componentCount }} 个组件
                </span>
                <span class="meta-item">
                  <QyIcon name="clock" size="xs" />
                  {{ demo.lastUpdated }}
                </span>
              </div>
            </div>
            <div class="card-footer">
              <QyButton variant="primary" size="sm" block>
                <QyIcon name="arrow-right" size="sm" />
                查看 Demo
              </QyButton>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredDemos.length === 0" class="empty-state">
          <QyIcon name="search" size="xl" class="empty-icon" />
          <h3>未找到匹配的 Demo</h3>
          <p>试试其他搜索词或分类筛选</p>
        </div>
      </div>
    </div>

    <!-- Quick Links Section -->
    <div class="quick-links-section">
      <div class="container">
        <h2 class="section-title">快捷链接</h2>
        <div class="quick-links-grid">
          <a
            v-for="link in quickLinks"
            :key="link.key"
            :href="link.url"
            class="quick-link-card"
            target="_blank"
          >
            <QyIcon :name="link.icon" size="lg" />
            <div>
              <h4>{{ link.title }}</h4>
              <p>{{ link.description }}</p>
            </div>
          </a>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div v-if="showHelpModal" class="modal-overlay" @click="showHelpModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>使用说明</h2>
          <button class="close-btn" @click="showHelpModal = false">
            <QyIcon name="x-mark" size="md" />
          </button>
        </div>
        <div class="modal-body">
          <div class="help-section">
            <h3>
              <QyIcon name="lightbulb" size="sm" />
              关于 Demo Hub
            </h3>
            <p>
              Demo Hub 是青羽项目的组件库演示中心，汇集了所有用于快速验证页面样式和组件功能的 Demo 页面。
              所有 Demo 页面自动使用 Mock 数据，无需依赖后端服务。
            </p>
          </div>
          <div class="help-section">
            <h3>
              <QyIcon name="check-circle" size="sm" />
              Mock 数据模式
            </h3>
            <p>
              点击任意 Demo 页面时，会自动添加 <code>?test=true</code> 参数。
              该参数告诉页面使用 Mock 数据而非真实 API 数据，方便前端开发和样式调试。
            </p>
          </div>
          <div class="help-section">
            <h3>
              <QyIcon name="code" size="sm" />
              添加新 Demo
            </h3>
            <p>
              要添加新的 Demo 页面，请参考以下步骤：
            </p>
            <ol>
              <li>在 <code>src/views/demo/</code> 目录下创建新的 Vue 文件</li>
              <li>在 <code>src/views/demo/mock-data.ts</code> 中添加对应的 Mock 数据</li>
              <li>在本页面（DemoHub.vue）的 <code>demoPages</code> 数组中注册新 Demo</li>
              <li>在 <code>src/router/index.ts</code> 中添加路由配置</li>
            </ol>
          </div>
          <div class="help-section">
            <h3>
              <QyIcon name="book" size="sm" />
              相关文档
            </h3>
            <ul>
              <li><a href="/docs" target="_blank">项目文档</a></li>
              <li><a href="https://vuejs.org/" target="_blank">Vue 3 官方文档</a></li>
              <li><a href="https://tailwindcss.com/" target="_blank">Tailwind CSS 文档</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="demo-hub-footer">
      <div class="container">
        <p>© {{ currentYear }} 青羽 Qingyu - Design System Demo Hub</p>
        <p>Built with Vue 3 + TypeScript + Tailwind CSS</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { QyButton, QyIcon, QyInput, QyBadge } from '@/design-system/components'

// Router
const router = useRouter()

// Refs
const demosSectionRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('all')
const showHelpModal = ref(false)

// Demo pages configuration
interface DemoPage {
  key: string
  title: string
  description: string
  icon: string
  color: string
  category: string
  componentCount: number
  lastUpdated: string
  new?: boolean
  updated?: boolean
  route: string
  external?: boolean
  url?: string
  business?: boolean // 标识是否为业务页面
}

interface BusinessEntranceItem {
  key: string
  label: string
  route: string
}

interface BusinessEntranceGroup {
  key: string
  title: string
  description: string
  icon: string
  color: string
  items: BusinessEntranceItem[]
}

interface ThesisShowcaseItem {
  section: string
  title: string
  route: string
  frontendFile: string
  backendFile: string
}

interface ThesisShowcaseGroup {
  key: string
  title: string
  description: string
  items: ThesisShowcaseItem[]
}

const demoPages = ref<DemoPage[]>([
  // ===== 基础组件 Demo =====
  {
    key: 'qingyu-components',
    title: '青羽组件库演示',
    description: '展示青羽设计系统的基础组件，包括按钮、卡片、输入框、徽章和头像等核心组件。',
    icon: 'grid',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'components',
    componentCount: 8,
    lastUpdated: '2024-01-15',
    new: true,
    route: '/demo/qingyu-components'
  },
  {
    key: 'navigation-components',
    title: '导航组件演示',
    description: '展示各类导航组件，包括面包屑、标签页、菜单等导航相关组件。',
    icon: 'navigation',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    category: 'components',
    componentCount: 5,
    lastUpdated: '2024-01-10',
    route: '/demo/navigation-components'
  },
  {
    key: 'advanced-components',
    title: '高级组件演示',
    description: '展示复杂交互组件，包括表单验证、数据表格、弹窗等高级功能组件。',
    icon: 'puzzle',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    category: 'components',
    componentCount: 6,
    lastUpdated: '2024-01-12',
    updated: true,
    route: '/demo/advanced-components'
  },

  // ===== 风格展示 Demo =====
  {
    key: 'tailwind-v4-design-system',
    title: 'Tailwind v4 组件库',
    description: '基于 Tailwind v4 CSS-First 配置的新一代组件库，包含完整的设计令牌系统和 CVA 变体管理。',
    icon: 'sparkles',
    color: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    category: 'style',
    componentCount: 20,
    lastUpdated: '2026-02-09',
    route: '/demo/tailwind-v4-design-system',
    new: true
  },
  {
    key: 'apple-style',
    title: 'Apple 风格组件',
    description: '展示 Apple 设计风格的组件，包括毛玻璃效果、平滑动画等 iOS 风格元素。',
    icon: 'apple',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    category: 'style',
    componentCount: 4,
    lastUpdated: '2024-01-08',
    route: '/demo/apple-style'
  },
  {
    key: 'qy-icon',
    title: 'QyIcon 图标库',
    description: '展示青羽项目使用的图标库，包含所有可用的图标及其使用方法。',
    icon: 'star',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    category: 'style',
    componentCount: 50,
    lastUpdated: '2024-01-05',
    route: '/demo/qy-icon'
  },

  // ===== 功能验证 Demo =====
  {
    key: 'typescript-fixes',
    title: 'TypeScript 修复验证',
    description: '验证已修复的类型定义和组件功能，包括评论、书架、审核、交易等模块的数据展示。',
    icon: 'code',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    category: 'validation',
    componentCount: 12,
    lastUpdated: '2024-01-20',
    updated: true,
    route: '/demo/typescript-fixes'
  },
  {
    key: 'register-simple-demo',
    title: '简洁注册演示',
    description: '用于论文答辩展示的极简注册页面，聚焦注册核心流程与表单校验。',
    icon: 'user-plus',
    color: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
    category: 'validation',
    componentCount: 1,
    lastUpdated: '2026-02-16',
    new: true,
    route: '/demo/register-simple'
  },

  // ===== 业务页面（Mock 数据验证） =====
  {
    key: 'bookstore-home',
    title: '书城首页',
    description: '书城首页 Mock 数据验证，包含 Banner、推荐书籍、榜单等内容的样式展示。',
    icon: 'home',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    category: 'business',
    componentCount: 6,
    lastUpdated: '2024-02-09',
    new: true,
    route: '/bookstore',
    business: true
  },
  {
    key: 'bookstore-browse',
    title: '浏览书籍',
    description: '书籍列表页面 Mock 数据验证，展示分类筛选、排序、分页等功能。',
    icon: 'books',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    category: 'business',
    componentCount: 4,
    lastUpdated: '2024-02-09',
    new: true,
    route: '/bookstore/browse',
    business: true
  },
  {
    key: 'bookstore-detail',
    title: '书籍详情',
    description: '书籍详情页 Mock 数据验证，包含书籍信息、章节列表、评论等功能。',
    icon: 'book-open',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    category: 'business',
    componentCount: 5,
    lastUpdated: '2024-02-09',
    new: true,
    route: '/bookstore/books-demo',
    business: true
  },
  {
    key: 'writer-projects',
    title: '创作中心',
    description: '创作中心项目列表 Mock 数据验证，展示写作项目、统计信息等功能。',
    icon: 'edit',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    category: 'business',
    componentCount: 3,
    lastUpdated: '2024-02-09',
    new: true,
    route: '/writer/projects',
    business: true
  },
  {
    key: 'user-profile',
    title: '用户中心',
    description: '用户中心 Mock 数据验证，包含个人信息、书架、钱包等功能。',
    icon: 'user',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'business',
    componentCount: 4,
    lastUpdated: '2024-02-09',
    new: true,
    route: '/account/profile',
    business: true
  },
  {
    key: 'community-posts',
    title: '社区论坛',
    description: '社区帖子列表 Mock 数据验证，展示帖子内容、评论、点赞等功能。',
    icon: 'users',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    category: 'business',
    componentCount: 3,
    lastUpdated: '2024-02-09',
    new: true,
    route: '/community',
    business: true
  }
])

const businessEntrances = ref<BusinessEntranceGroup[]>([
  {
    key: 'reader',
    title: '读者端',
    description: '读者阅读与社区主流程',
    icon: 'book-open',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    items: [
      { key: 'bookstore-home', label: '书城首页', route: '/bookstore' },
      { key: 'bookstore-browse', label: '浏览书籍', route: '/bookstore/browse' },
      { key: 'bookstore-detail', label: '书籍详情', route: '/bookstore/books-demo' },
      { key: 'reader-demo', label: '章节阅读', route: '/bookstore/reader-demo' },
      { key: 'community', label: '社区论坛', route: '/community' },
      { key: 'collections', label: '收藏管理', route: '/reading/collections' },
      { key: 'profile', label: '个人中心', route: '/account/profile' },
      { key: 'login', label: '登录页', route: '/login' },
      { key: 'register', label: '注册页', route: '/register' },
      { key: 'register-simple-demo', label: '注册Demo', route: '/demo/register-simple' }
    ]
  },
  {
    key: 'author',
    title: '作者端',
    description: '项目管理、编辑、发布链路',
    icon: 'edit',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    items: [
      { key: 'writer-dashboard', label: '创作工作台', route: '/writer/dashboard' },
      { key: 'writer-projects', label: '项目列表', route: '/writer/projects' },
      { key: 'writer-publish', label: '发布管理', route: '/writer/publish' },
      { key: 'become-author', label: '成为作者引导', route: '/writer/become-author' }
    ]
  },
  {
    key: 'admin',
    title: '管理员端',
    description: '审核、配置与用户治理',
    icon: 'shield-check',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    items: [
      { key: 'admin-dashboard', label: '后台仪表板', route: '/admin/dashboard' },
      { key: 'admin-users', label: '用户管理', route: '/admin/users' },
      { key: 'admin-reviews', label: '内容审核', route: '/admin/reviews' },
      { key: 'admin-system-config', label: '系统配置', route: '/admin/system-config' }
    ]
  },
  {
    key: 'ai',
    title: 'AI服务',
    description: 'AI 网关、模型与健康检查',
    icon: 'sparkles',
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    items: [
      { key: 'ai-overview', label: 'AI 总览', route: '/admin/ai/overview' },
      { key: 'ai-providers', label: '提供商管理', route: '/admin/ai/providers' },
      { key: 'ai-models', label: '模型管理', route: '/admin/ai/models' },
      { key: 'ai-health', label: '健康检查', route: '/admin/ai/health' }
    ]
  }
])

const thesisShowcaseGroups = ref<ThesisShowcaseGroup[]>([
  {
    key: 'chapter-5-1',
    title: '5.1 读者端功能模块',
    description: '建议按登录 -> 首页 -> 浏览 -> 详情 -> 阅读 -> 互动的顺序演示。',
    items: [
      { section: '5.1.1', title: '登录注册界面', route: '/login', frontendFile: 'src/modules/user/views/AuthenticationView.vue', backendFile: 'Qingyu_backend/service/auth/auth_service.go' },
      { section: '5.1.2', title: '首页界面', route: '/bookstore', frontendFile: 'src/modules/bookstore/views/HomeView.vue', backendFile: 'Qingyu_backend/service/bookstore/bookstore_service.go' },
      { section: '5.1.3', title: '书城浏览界面', route: '/bookstore/browse', frontendFile: 'src/modules/bookstore/views/BrowseBooksView.vue', backendFile: 'Qingyu_backend/service/search/search.go' },
      { section: '5.1.4', title: '书籍详情界面', route: '/bookstore/books-demo', frontendFile: 'src/modules/bookstore/views/BookDetailDemo.vue', backendFile: 'Qingyu_backend/service/bookstore/book_detail_service.go' },
      { section: '5.1.5', title: '章节阅读界面', route: '/bookstore/reader-demo', frontendFile: 'src/modules/reader/views/ReaderView.vue', backendFile: 'Qingyu_backend/service/reader/chapter_service.go' },
      { section: '5.1.6', title: '评论发表界面', route: '/bookstore/books-demo', frontendFile: 'src/modules/bookstore/views/BookDetailDemo.vue', backendFile: 'Qingyu_backend/service/social/comment_service.go' },
      { section: '5.1.7', title: '收藏管理界面', route: '/reading/collections', frontendFile: 'src/modules/reader/views/CollectionsView.vue', backendFile: 'Qingyu_backend/service/reader/collection_service.go' },
      { section: '5.1.8', title: '个人中心界面', route: '/account/profile', frontendFile: 'src/modules/user/views/ProfileView.vue', backendFile: 'Qingyu_backend/service/user/user_service.go' }
    ]
  },
  {
    key: 'chapter-5-2',
    title: '5.2 作者端功能模块',
    description: '建议按项目管理 -> 编辑 -> AI辅助 -> 统计分析演示。',
    items: [
      { section: '5.2.1', title: '作品管理界面', route: '/writer/projects', frontendFile: 'src/modules/writer/views/ProjectListView.vue', backendFile: 'Qingyu_backend/service/writer/project/project_service.go' },
      { section: '5.2.2', title: '章节编写界面', route: '/writer/editor/project-1/chapter-1', frontendFile: 'src/modules/writer/views/EditorView.vue', backendFile: 'Qingyu_backend/service/writer/document/document_service.go' },
      { section: '5.2.3', title: 'AI续写界面', route: '/writer/editor/project-1/chapter-1', frontendFile: 'src/modules/writer/components/ai/AIPanel.vue', backendFile: 'Qingyu_backend/service/ai/chat_service.go' },
      { section: '5.2.4', title: '数据统计界面', route: '/writer/statistics', frontendFile: 'src/modules/writer/views/StatisticsView.vue', backendFile: 'Qingyu_backend/service/shared/stats/stats_service.go' }
    ]
  },
  {
    key: 'chapter-5-3',
    title: '5.3 管理员端功能模块',
    description: '建议按用户管理 -> 内容审核 -> 分类管理演示。',
    items: [
      { section: '5.3.1', title: '用户管理界面', route: '/admin/users', frontendFile: 'src/modules/admin/views/UserManagement.vue', backendFile: 'Qingyu_backend/service/admin/user_admin_service.go' },
      { section: '5.3.2', title: '内容审核界面', route: '/admin/reviews', frontendFile: 'src/modules/admin/views/ReviewManagement.vue', backendFile: 'Qingyu_backend/service/audit/content_audit_service.go' },
      { section: '5.3.3', title: '分类管理界面', route: '/admin/system-config', frontendFile: 'src/modules/admin/views/SystemConfig.vue', backendFile: 'Qingyu_backend/service/admin/admin_service.go' }
    ]
  },
  {
    key: 'chapter-5-4',
    title: '5.4 AI服务模块',
    description: '建议展示模型路由、提供商配置和健康检查。',
    items: [
      { section: '5.4.1', title: 'AI网关与模型路由', route: '/admin/ai/overview', frontendFile: 'src/modules/ai/views/AIMainView.vue', backendFile: 'Qingyu_backend/service/ai/ai_service.go' },
      { section: '5.4.2', title: 'RAG检索增强服务', route: '/admin/ai/health', frontendFile: 'src/modules/ai/views/AIHealthView.vue', backendFile: 'Qingyu_backend/service/ai/context_service.go' }
    ]
  }
])

// Categories
const categories = [
  { key: 'all', label: '全部', icon: 'apps' },
  { key: 'components', label: '基础组件', icon: 'component' },
  { key: 'style', label: '风格展示', icon: 'palette' },
  { key: 'validation', label: '功能验证', icon: 'check-circle' },
  { key: 'business', label: '业务页面', icon: 'store' }
]

// Quick links
const quickLinks = ref([
  {
    key: 'storybook',
    title: 'Storybook',
    description: '组件库文档和交互式演示 (需要先运行 npm run storybook)',
    icon: 'book',
    url: 'http://localhost:6006',
    external: true
  },
  {
    key: 'api-docs',
    title: 'API 文档',
    description: '后端 API 接口文档 (Swagger/Scalar)',
    icon: 'api',
    url: 'http://localhost:8080/swagger.html',
    external: true
  },
  {
    key: 'github',
    title: 'GitHub 仓库',
    description: '查看源代码和提交 Issue',
    icon: 'github',
    url: 'https://github.com/yukin371/Qingyu',
    external: true
  }
])

// Computed
const currentYear = computed(() => new Date().getFullYear())

const isTestMode = computed(() => {
  return new URLSearchParams(window.location.search).has('test')
})

const totalComponents = computed(() => {
  return demoPages.value.reduce((sum, demo) => sum + demo.componentCount, 0)
})

const businessPageCount = computed(() => {
  return demoPages.value.filter(demo => demo.business).length
})

const filteredDemos = computed(() => {
  let demos = demoPages.value

  // Filter by category
  if (selectedCategory.value !== 'all') {
    demos = demos.filter(demo => demo.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    demos = demos.filter(demo =>
      demo.title.toLowerCase().includes(query) ||
      demo.description.toLowerCase().includes(query) ||
      demo.key.toLowerCase().includes(query)
    )
  }

  return demos
})

// Methods
const scrollToDemos = () => {
  demosSectionRef.value?.scrollIntoView({ behavior: 'smooth' })
}

const showHelp = () => {
  showHelpModal.value = true
}

const navigateToDemo = (demo: DemoPage) => {
  // Automatically add ?test=true parameter
  const url = `${demo.route}?test=true`
  
  if (demo.external && demo.url) {
    window.open(url, '_blank')
  } else {
    router.push(url)
  }
  
  // Log business page navigation for debugging
  if (demo.business) {
    console.log('[DemoHub] Navigating to business page with mock data:', demo.route)
  }
}

const navigateToRoute = (route: string) => {
  router.push(`${route}?test=true`)
}

const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    components: '基础组件',
    style: '风格展示',
    validation: '功能验证',
    business: '业务页面'
  }
  return categoryMap[category] || category
}

const getFilteredDemos = (category: string) => {
  if (category === 'all') {
    return demoPages.value
  }
  return demoPages.value.filter(demo => demo.category === category)
}

// Lifecycle
onMounted(() => {
  // Log for debugging
  console.log('[DemoHub] Demo Hub loaded with test mode:', isTestMode.value)
})
</script>

<style scoped lang="scss">
.demo-hub {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fb 0%, #ffffff 100%);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.hero-section {
  padding: 80px 0 60px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(50px, 50px) rotate(180deg); }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 30px;
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.1;
  color: #1a1a1a;
  margin-bottom: 20px;
  font-family: "Inter", -apple-system, sans-serif;

  .gradient-text {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-description {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 20px;
  }
}

/* Stats Section */
.stats-section {
  padding: 40px 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  text-align: center;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  padding: 24px;
}

.stat-value {
  font-size: 48px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 8px;

  &.active {
    color: #10b981;
  }
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.business-entrances-section {
  padding: 56px 0;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.thesis-showcase-section {
  padding: 48px 0;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
}

.showcase-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
}

.showcase-header {
  margin-bottom: 10px;

  h3 {
    margin: 0 0 2px;
    font-size: 16px;
    color: #0f172a;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: #64748b;
  }
}

.showcase-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.showcase-row {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
}

.showcase-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.showcase-section {
  font-size: 12px;
  color: #1d4ed8;
  font-weight: 700;
}

.showcase-title {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.showcase-actions {
  margin-bottom: 6px;
}

.showcase-code {
  display: flex;
  flex-direction: column;
  gap: 4px;

  code {
    display: block;
    font-size: 11px;
    color: #334155;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 4px 6px;
    word-break: break-all;
  }
}

.section-subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
}

.entrance-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.entrance-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  padding: 16px;
}

.entrance-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.entrance-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
}

.entrance-title {
  margin: 0 0 2px;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
}

.entrance-description {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.entrance-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.entrance-btn {
  min-width: 92px;
}

/* Demo Pages Section */
.demos-section {
  padding: 80px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.search-input {
  max-width: 300px;
  width: 100%;
}

/* Category Tabs */
.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  overflow-x: auto;
  padding-bottom: 8px;

  @media (max-width: 768px) {
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 30px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    border-color: #6366f1;
    color: #6366f1;
  }

  &.active {
    background: #6366f1;
    border-color: #6366f1;
    color: white;
  }

  .count {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
  }
}

/* Demo Cards Grid */
.demos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.demo-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
    border-color: #6366f1;
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-body {
  flex: 1;
  margin-bottom: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon {
    color: #d1d5db;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px;
  }

  p {
    color: #666;
    margin: 0;
  }
}

/* Quick Links Section */
.quick-links-section {
  padding: 60px 0;
  background: linear-gradient(180deg, #f8f9fb 0%, #ffffff 100%);
  border-top: 1px solid #e5e7eb;

  .section-title {
    margin-bottom: 32px;
  }
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.quick-link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1);
    border-color: #6366f1;
  }

  h4 {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 4px;
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

/* Help Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
}

.modal-body {
  padding: 24px;
}

.help-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 12px;
  }

  p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin: 0 0 12px;
  }

  code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: #ef4444;
  }

  ol, ul {
    padding-left: 24px;
    margin: 0;

    li {
      font-size: 14px;
      color: #666;
      line-height: 1.8;

      a {
        color: #6366f1;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

/* Footer */
.demo-hub-footer {
  padding: 40px 0;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  background: white;

  p {
    font-size: 14px;
    color: #999;
    margin: 4px 0;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .hero-description {
    font-size: 16px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>
