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
                  <QyIcon name="component" size="xs" />
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
import { QyButton, QyIcon, QyInput, QyBadge, QyAvatar } from '@/design-system/components'

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
    route: '/bookstore/books/book-1', // Mock book ID
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
