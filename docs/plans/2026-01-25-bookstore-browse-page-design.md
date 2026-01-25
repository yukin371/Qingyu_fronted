# 图书浏览页面整合设计文档

> **创建日期：** 2026-01-25  
> **设计师：** Claude  
> **状态：** 待审查  
> **预估工期：** 15-22个工作日

---

## 目录

1. [概述](#概述)
2. [整体架构](#整体架构)
3. [组件设计](#组件设计)
4. [API设计](#api设计)
5. [移动端适配](#移动端适配)
6. [错误处理](#错误处理)
7. [测试策略](#测试策略)
8. [实现计划](#实现计划)
9. [数据结构定义](#数据结构定义)
10. [技术栈和工具](#技术栈和工具)
11. [Mock数据开发](#mock数据开发)
12. [代码示例](#代码示例)
13. [设计亮点](#设计亮点)
14. [风险评估](#风险评估)
15. [验收标准](#验收标准)

---

## 概述

### 背景

当前系统存在两个独立页面：
- **书库** (`/bookstore/books`) - 通过下拉框筛选所有书籍
- **分类** (`/bookstore/categories`) - 左侧分类树 + 右侧书籍列表

两个页面功能重叠，用户需要在页面间切换才能完成"选分类 → 筛选书籍"的完整流程，体验不佳。

### 目标

创建一个全新的**图书浏览页面**，整合书库和分类功能，提供统一、现代、高效的书籍发现体验。

### 核心特性

- 🔍 **智能搜索栏** - 支持书名、作者、标签搜索，实时建议
- 🎛️ **多维筛选** - 类型、年份、状态、标签多维度组合筛选
- 🏷️ **多标签选择** - 支持添加多个标签，智能推荐热门标签
- 📱 **移动端优化** - 全屏搜索、无限滚动、触摸友好
- ⚡ **性能优化** - 防抖、缓存、懒加载、虚拟滚动

---

## 整体架构

### 路由设计

```
新路由: /bookstore/browse (主页面)
旧路由处理:
  /bookstore/books → 重定向到新页面
  /bookstore/categories → 重定向到新页面并保留分类ID参数
```

### 页面布局结构

```
┌─────────────────────────────────────────────┐
│  页面标题区                                   │
│  "探索书库" + 副标题                          │
├─────────────────────────────────────────────┤
│  🔍 [大型搜索栏 - 搜索书名、作者、标签...]       │
├─────────────────────────────────────────────┤
│  [类型▼] [年份▼] [状态▼]                     │
├─────────────────────────────────────────────┤
│  🏷️ 标签筛选: [热血×] [穿越×] [+ 添加标签]    │
├─────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │书籍 │ │书籍 │ │书籍 │ │书籍 │  紧凑网格   │
│  │卡片 │ │卡片 │ │卡片 │ │卡片 │            │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
├─────────────────────────────────────────────┤
│  < 1 2 3 ... >  分页器 (桌面端)             │
│  加载更多... (移动端)                        │
└─────────────────────────────────────────────┘
```

### 技术组件

```typescript
BrowseBooksView.vue (主组件)
├── PageHeader.vue (页面标题)
├── SearchBar.vue (搜索栏组件)
├── FilterBar.vue (筛选器行)
│   ├── TypeSelect.vue (类型选择)
│   ├── YearSelect.vue (年份选择)
│   └── StatusSelect.vue (状态选择)
├── TagFilter.vue (独立标签筛选区)
└── BookGrid.vue (复用现有组件，紧凑模式)
```

---

## 组件设计

### 1. SearchBar.vue

**功能：**
- 大尺寸输入框，支持搜索书名、作者、标签
- 实时搜索建议（防抖300ms）
- 搜索历史记录（最多10条）
- 移动端全屏搜索模式

**接口设计：**
```typescript
Props: {
  modelValue: string
  placeholder?: string
  showHistory?: boolean
  debounceMs?: number
}
Emits: {
  'update:modelValue': [value: string]
  'search': [query: string]
  'clear': []
  'add-tag': [tag: string]
}
```

**搜索建议类型：**
- `book` - 直接跳转到书籍详情
- `author` - 填入搜索框并触发搜索
- `tag` - 添加到标签筛选

### 2. FilterBar.vue

**功能：**
- 类型、年份、状态三个筛选器
- 横向滚动布局（移动端）
- 支持v-model双向绑定

**接口设计：**
```typescript
Props: {
  type: string
  year: string
  status: string
  categories: Category[]
  years: string[]
  statuses: Array<{ value: string; label: string }>
}
Emits: {
  'update:type': [value: string]
  'update:year': [value: string]
  'update:status': [value: string]
}
```

### 3. TagFilter.vue

**功能：**
- 横向滚动显示已选标签
- 点击×移除标签
- "+ 添加标签"按钮打开下拉框
- 下拉框包含热门标签 + 搜索框
- 最多选择8个标签

**接口设计：**
```typescript
Props: {
  selectedTags: string[]
  availableTags: Tag[]
  maxSelected?: number
}
Emits: {
  'update:selectedTags': [tags: string[]]
}
```

---

## API设计

### 1. 获取书籍列表

```typescript
// GET /api/books
interface GetBooksParams {
  q?: string              // 搜索关键词
  type?: string           // 分类ID
  year?: string           // 年份
  status?: string         // 状态
  tags?: string[]         // 标签数组（AND关系）
  page?: number           // 页码
  pageSize?: number       // 每页数量
  sortBy?: string         // 排序方式
}

interface GetBooksResponse {
  code: number
  data: {
    books: BookBrief[]
    total: number
    page: number
    pageSize: number
  }
}
```

### 2. 搜索建议（多态响应）

```typescript
// GET /api/books/suggestions?q=xxx
interface SuggestionItem {
  type: 'book' | 'author' | 'tag'
  id: string
  text: string
  cover?: string
}

interface SuggestionsResponse {
  code: number
  data: {
    items: SuggestionItem[]
  }
}
```

### 3. 获取标签列表

```typescript
// GET /api/tags?category=xxx
interface GetTagsParams {
  category?: string
  limit?: number
}

interface TagsResponse {
  code: number
  data: {
    popular: Tag[]
    all: Tag[]
  }
}
```

### 4. 静态数据接口

```typescript
// GET /api/categories - 获取分类列表
// GET /api/books/years - 获取年份选项
```

### 参数序列化

使用 `qs` 库处理数组参数：

```typescript
import qs from 'qs'

request.get('/api/books', {
  params,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
  }
})

// 生成: /api/books?tags=magic&tags=dark&page=1
```

### 静态数据缓存

使用 Pinia Store 缓存不常变化的数据：

```typescript
// src/modules/bookstore/stores/meta.store.ts
export const useMetaStore = defineStore('bookstoreMeta', {
  state: () => ({
    categories: [],
    years: [],
    _categoriesLoaded: false,
    _yearsLoaded: false
  }),
  
  actions: {
    async getCategories(force = false) {
      if (this._categoriesLoaded && !force) {
        return this.categories
      }
      const res = await getCategories()
      this.categories = res.data
      this._categoriesLoaded = true
      return this.categories
    }
  }
})
```

---

## 移动端适配

### 响应式断点

```scss
$breakpoints: (
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px
);
```

### 1. 搜索栏全屏交互

移动端搜索时全屏覆盖，带"取消"按钮：

```vue
<div v-if="isMobile && isSearching" class="mobile-search-overlay">
  <div class="mobile-search-header">
    <button @click="closeSearch">取消</button>
    <input v-model="query" ref="mobileInput" autofocus />
    <button @click="handleSearch">搜索</button>
  </div>
  <SuggestionsList />
</div>
```

### 2. 筛选器横向滚动

```scss
.filter-scroll-wrapper {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  scrollbar-width: none;  // 隐藏滚动条
  
  &::-webkit-scrollbar {
    display: none;
  }
}
```

### 3. 无限滚动加载

移动端使用无限滚动替代分页：

```typescript
const fetchBooks = async (isLoadMore = false) => {
  if (isLoadMore) {
    // 追加模式
    books.value = [...books.value, ...newBooks]
  } else {
    // 替换模式
    books.value = newBooks
  }
}

// 使用 Intersection Observer 触发加载
useIntersectionObserver(loadMoreTrigger, ([{ isIntersecting }]) => {
  if (isIntersecting && isMobile.value && !loading.value) {
    loadMore()
  }
})
```

### 4. 触摸优化

```scss
// 所有可点击元素
.button, .select, .tag {
  @media (max-width: 640px) {
    min-height: 44px;  // iOS推荐的最小触摸区域
    min-width: 44px;
  }
}
```

### 5. 底部安全区

```scss
.browse-view {
  @media (max-width: 640px) {
    padding-bottom: 80px;  // 为可能的悬浮元素预留空间
  }
}
```

---

## 错误处理

### 1. API错误拦截

```typescript
// src/utils/request.ts
import { ElMessage } from 'element-plus'

const ERROR_MESSAGES = {
  400: '请求参数错误',
  401: '请先登录',
  404: '请求的资源不存在',
  500: '服务器错误，请稍后重试'
}

request.interceptors.response.use(
  response => response,
  error => {
    const { response } = error
    if (!response) {
      ElMessage.error('网络连接失败')
      return Promise.reject(error)
    }
    
    const message = ERROR_MESSAGES[response.status] || '请求失败'
    ElMessage.error(message)
    
    if (response.status === 401) {
      router.push('/login')
    }
    
    return Promise.reject(error)
  }
)
```

### 2. 空状态细分

```typescript
const emptyStateConfig = computed(() => {
  const { searchQuery, type, year, status, tags } = filters
  
  if (searchQuery) {
    return {
      icon: 'magnifying-glass',
      title: '没有找到相关书籍',
      description: `没有找到与"${searchQuery}"相关的书籍`
    }
  }
  
  if (type || year || status || tags.length > 0) {
    return {
      icon: 'funnel',
      title: '没有符合条件的书籍',
      description: '试试调整筛选条件'
    }
  }
  
  return {
    icon: 'book-open',
    title: '暂时没有书籍',
    description: '书架正在补充中，敬请期待~'
  }
})
```

### 3. 搜索防抖

```typescript
import { useDebounceFn } from '@vueuse/core'

const fetchSuggestions = useDebounceFn(async (query) => {
  if (!query || query.length < 2) {
    suggestions.value = []
    return
  }
  
  const res = await api.getSearchSuggestions(query)
  suggestions.value = res.data.items
}, 300)
```

---

## 测试策略

### 1. 单元测试

```typescript
// tests/unit/TagFilter.spec.ts
describe('TagFilter', () => {
  it('should emit add-tag event when tag is selected', async () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: [],
        availableTags,
        maxSelected: 8
      }
    })
    
    await wrapper.vm.addTag('热血')
    
    expect(wrapper.emitted('update:selectedTags')).toBeTruthy()
    expect(wrapper.emitted('update:selectedTags')[0]).toEqual([['热血']])
  })
  
  it('should not exceed maxSelected limit', async () => {
    const wrapper = mount(TagFilter, {
      props: {
        selectedTags: new Array(8).fill('tag'),
        maxSelected: 8
      }
    })
    
    const canAddMore = wrapper.vm.canAddTag()
    expect(canAddMore).toBe(false)
  })
})
```

### 2. E2E测试

```typescript
// tests/e2e/browse-books.spec.ts
test.describe('图书浏览页', () => {
  test('应该能够搜索书籍', async ({ page }) => {
    await page.goto('/bookstore/browse')
    
    const searchInput = page.locator('input[placeholder*="搜索"]')
    await searchInput.fill('三体')
    await searchInput.press('Enter')
    
    await page.waitForSelector('.book-grid')
    expect(page.url()).toContain('q=%E4%B8%89%E4%BD%93')
  })
  
  test('应该能够添加和删除标签', async ({ page }) => {
    await page.goto('/bookstore/browse')
    
    await page.click('.add-tag-chip')
    await page.click('.tag-option:first-child')
    
    await expect(page.locator('.selected-tags .tag')).toHaveCount(1)
    
    await page.click('.tag .close-btn')
    await expect(page.locator('.selected-tags .tag')).toHaveCount(0)
  })
})
```

### 3. 性能测试

```typescript
test('应该能流畅渲染大量书籍卡片', async ({ page }) => {
  await page.goto('/bookstore/browse?page_size=100')
  
  const metrics = await page.metrics()
  expect(metrics.LayoutDuration).toBeLessThan(100)
  
  await page.mouse.wheel(0, 1000)
  // 验证滚动FPS > 30
})
```

### 4. 可访问性测试

```typescript
import { injectAxe, checkA11y } from 'axe-playwright'

test('不应该有可访问性问题', async ({ page }) => {
  await injectAxe(page)
  await page.goto('/bookstore/browse')
  await checkA11y(page)
})
```

---

## 实现计划

### Phase 1: 基础架构搭建 (2-3天)

**任务1.1: 创建路由和页面骨架**
- 创建 `BrowseBooksView.vue`
- 更新路由配置
- 设置重定向

**任务1.2: 设置Pinia Store**
- 创建 `browse.store.ts`
- 创建 `meta.store.ts`

### Phase 2: 核心组件开发 (5-7天)

**任务2.1: SearchBar组件**
- 桌面端搜索框UI
- 移动端全屏搜索UI
- 防抖搜索建议
- 键盘导航
- 搜索历史

**任务2.2: FilterBar组件**
- 三个筛选器Select
- 响应式布局

**任务2.3: TagFilter组件**
- 已选标签展示
- 添加标签下拉框
- 最大数量限制

**任务2.4: 主页面集成**
- 集成所有子组件
- 筛选逻辑
- 无限滚动
- 空状态处理

### Phase 3: API集成 (2-3天)

**任务3.1: 创建API接口**
- `getBooks`
- `getSearchSuggestions`
- `getTags`
- `getYears`

**任务3.2: 设置数据缓存**

### Phase 4: 样式优化 (2-3天)

- 桌面端样式
- 移动端样式
- 动画过渡
- 主题适配

### Phase 5: 测试和优化 (3-4天)

- 单元测试 (覆盖率 > 80%)
- E2E测试
- 性能优化
- Lighthouse测试

### Phase 6: 文档和部署 (1-2天)

- Storybook文档
- API文档
- 用户手册
- 发布准备

### 时间线

| Phase | 任务 | 预估时间 |
|-------|------|---------|
| 1 | 基础架构 | 2-3天 |
| 2 | 核心组件 | 5-7天 |
| 3 | API集成 | 2-3天 |
| 4 | 样式优化 | 2-3天 |
| 5 | 测试优化 | 3-4天 |
| 6 | 文档部署 | 1-2天 |
| **总计** | | **15-22天** |

---

## 数据结构定义

### 核心类型

```typescript
// src/types/models/book.ts
export interface BookBrief {
  id: string
  title: string
  author: string
  cover?: string
  categoryName?: string
  tags?: string[]
  rating?: number
  status?: 'serializing' | 'completed' | 'new'
  year?: number
  viewCount?: number
  wordCount?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  parentId?: string
  children?: Category[]
}

export interface Tag {
  id: string
  name: string
  category?: string
  usageCount?: number
  isHot?: boolean
}

export interface BookFilters {
  searchQuery: string
  type: string
  year: string
  status: string
  tags: string[]
  sortBy: string
}
```

### 组件Props类型

```typescript
// src/types/components/browse-books.ts
export interface SearchBarProps {
  modelValue: string
  placeholder?: string
  showHistory?: boolean
}

export interface FilterBarProps {
  type: string
  year: string
  status: string
  categories: Category[]
  years: string[]
  statuses: Array<{ value: string; label: string }>
}

export interface TagFilterProps {
  selectedTags: string[]
  availableTags: Tag[]
  maxSelected?: number
}
```

---

## 技术栈和工具

### 核心技术栈

```yaml
前端框架:
  - Vue 3.4+ (Composition API)
  - TypeScript 5.3+
  - Vite 5.0+

状态管理:
  - Pinia 2.1+

路由:
  - Vue Router 4.2+

UI组件:
  - Element Plus
  - 自定义设计系统

工具库:
  - @vueuse/core
  - lodash-es
  - qs
  - date-fns
```

### 开发工具

```yaml
代码质量:
  - ESLint
  - Prettier
  - TypeScript

测试:
  - Vitest
  - @vue/test-utils
  - Playwright
  - MSW

样式:
  - SCSS
  - Tailwind CSS
```

---

## Mock数据开发

使用MSW进行API Mock：

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/books', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    
    // 筛选逻辑
    let filtered = booksData
    const type = url.searchParams.get('type')
    if (type) {
      filtered = filtered.filter(b => b.category === type)
    }
    
    const start = (page - 1) * 24
    const paginated = filtered.slice(start, start + 24)
    
    return HttpResponse.json({
      code: 200,
      data: {
        books: paginated,
        total: filtered.length
      }
    })
  }),
  
  http.get('/api/books/suggestions', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    
    const suggestions = [
      ...booksData.filter(b => b.title.includes(q)).slice(0, 3),
      ...authorsData.filter(a => a.includes(q)).slice(0, 2)
    ]
    
    return HttpResponse.json({
      code: 200,
      data: { items: suggestions }
    })
  })
]
```

---

## 代码示例

完整代码示例见附录文件：
- `BrowseBooksView.vue` - 主页面
- `SearchBar.vue` - 搜索栏组件
- `FilterBar.vue` - 筛选器组件
- `TagFilter.vue` - 标签筛选组件
- `browse.store.ts` - Pinia Store

---

## 设计亮点

### 1. 用户体验优化

- **统一入口** - 合并书库和分类页面
- **多维筛选** - 支持多维度组合筛选
- **智能搜索** - 搜索建议支持多种类型
- **移动优先** - 完整的移动端优化
- **即时反馈** - 筛选变化立即触发搜索

### 2. 技术架构优势

- **组件化设计** - 高内聚低耦合
- **标准化接口** - 统一使用v-model
- **类型安全** - 完整的TypeScript类型
- **性能优化** - 防抖、缓存、懒加载
- **错误边界** - 完善的错误处理

### 3. 移动端适配亮点

- **全屏搜索** - 带明确的"取消"按钮
- **横向滚动筛选** - 充分利用屏幕空间
- **无限滚动加载** - 更自然的浏览体验
- **触摸优化** - 最小44×44px触摸区域

---

## 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| 后端API未就绪 | 高 | 中 | 使用MSW Mock数据 |
| 性能不达标 | 中 | 低 | 提前性能测试 |
| 移动端兼容性 | 中 | 中 | 多设备真机测试 |
| 大数据量卡顿 | 中 | 中 | 虚拟滚动、分页加载 |

---

## 验收标准

### 功能验收

- [ ] 搜索框输入显示建议
- [ ] 所有筛选器可独立/组合使用
- [ ] 标签支持添加多个
- [ ] 重置筛选功能正常
- [ ] 桌面端分页正常
- [ ] 移动端无限滚动正常
- [ ] 旧路由正确重定向

### 性能验收

- [ ] Lighthouse性能分数 ≥ 90
- [ ] FCP ≤ 1.5s
- [ ] LCP ≤ 2.5s
- [ ] 搜索建议响应 ≤ 300ms
- [ ] 筛选变化响应 ≤ 500ms

### 兼容性验收

- [ ] Chrome/Firefox/Safari/Edge最新版
- [ ] iOS Safari 14+
- [ ] Android Chrome 14+

### 测试验收

- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 所有E2E测试通过
- [ ] 可访问性测试通过

---

## 附录

### 相关文件

```
src/modules/bookstore/
├── views/
│   └── BrowseBooksView.vue          # 主页面
├── components/BrowseBooks/
│   ├── SearchBar.vue                # 搜索栏
│   ├── FilterBar.vue                # 筛选器
│   ├── TagFilter.vue                # 标签筛选
│   └── BookGridSkeleton.vue         # 骨架屏
├── stores/
│   ├── browse.store.ts              # 浏览页Store
│   └── meta.store.ts                # 元数据Store
└── api/
    └── browse.ts                    # API接口
```

---

**文档版本：** 1.0  
**最后更新：** 2026-01-25  
**状态：** 待审查
