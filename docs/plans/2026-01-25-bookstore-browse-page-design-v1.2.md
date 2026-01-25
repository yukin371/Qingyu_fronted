# 图书浏览页面整合设计文档（最终版 · v1.2）

> **创建日期：** 2026-01-25  
> **设计师：** Claude  
> **技术评审修订：** v1.2（结合现有仓库实现）  
> **状态：** ✅ 技术评审通过（最终版）  
> **预估工期：** 15-22个工作日

---

## 变更记录

**v1.2（最终版）**
- 明确 BrowseBooksView 是 SearchView 的升级替代，而非新增并行页面
- URL 规则完全继承现有 `/bookstore/search` 语义
- 状态管理对齐现有 `bookstore.service` 的数据规范化结果
- 分类字段命名与后端 MongoDB 结构对齐（单分类 v1，多分类预留）
- 明确多标签 AND 策略的性能约束与前端保护
- 补充 E2E / 测试路径迁移说明
- 在关键章节中增加【改进说明】，解释设计调整原因

**v1.1（初版）**
- 初始设计版本

---

## 目录

1. [概述](#概述)
2. [设计目标与范围](#设计目标与范围)
3. [关键设计决策](#关键设计决策)
4. [整体架构](#整体架构)
5. [路由与URL规范](#路由与url规范)
6. [状态管理与数据流](#状态管理与数据流)
7. [组件设计](#组件设计)
8. [API设计](#api设计)
9. [移动端适配](#移动端适配)
10. [错误处理](#错误处理)
11. [测试策略](#测试策略)
12. [实现计划](#实现计划)
13. [数据结构定义](#数据结构定义)
14. [技术栈和工具](#技术栈和工具)
15. [风险评估](#风险评估)
16. [验收标准](#验收标准)

---

## 概述

### 背景

当前系统中已存在以下页面：

- **`/bookstore/books`** - 书籍列表页（基础筛选）
- **`/bookstore/categories`** - 分类浏览页
- **`/bookstore/search`** - 搜索结果页（基于URL驱动）

上述页面在功能与实现上存在较高重叠，导致：

- 搜索/筛选/分类逻辑分散
- 用户需要在多个页面之间跳转
- 前端已出现多套相似但不完全一致的搜索实现

### 目标

设计并实现一个统一的**图书浏览页面（BrowseBooksView）**，整合：

- 搜索
- 分类
- 筛选
- 标签
- 分页/无限滚动

并在**不破坏现有仓库稳定性的前提下**完成替代升级。

### 核心特性

- 🔍 **智能搜索栏** - 支持书名、作者、标签搜索，实时建议
- 🎛️ **多维筛选** - 分类、年份、状态、标签多维度组合筛选
- 🏷️ **多标签选择** - 支持添加多个标签（AND模式，最多3个推荐）
- 📱 **移动端优化** - 全屏搜索、无限滚动、触摸友好
- ⚡ **性能优化** - 防抖、缓存、懒加载

---

## 设计目标与范围

### 目标

- 单一入口完成"找书 → 筛选 → 浏览"
- 保持URL可分享、可回溯
- 最大限度复用现有后端与前端服务层
- 降低长期维护成本，避免重复逻辑

### 不在本次范围内

- 推荐算法调整
- 排行榜规则调整
- 书籍详情页结构改动

---

## 关键设计决策

### 3.1 BrowseBooksView的定位

**结论：BrowseBooksView是SearchView的升级替代**

> **【改进说明】**
> 在v1.0设计中，BrowseBooksView被视为"新增页面"。
> 结合仓库后发现：
> - 现有`/bookstore/search`已承担搜索主流程
> - 已有稳定的URL/store/service修复历史
> - 并行存在会导致2-3套搜索逻辑长期共存
> 
> 因此本设计明确：
> - `/bookstore/search` → 重定向至 `/bookstore/browse`
> - SearchView的能力整体迁移并扩展
> - BrowseBooksView成为**唯一**搜索+浏览入口

### 3.2 单一真源（Single Source of Truth）

- 所有筛选状态由 `browse.store` 统一管理
- URL与store双向同步
- 组件仅通过props/emits交互

> **【改进说明】**
> 此决策用于避免当前仓库中已出现的：
> - URL ≠ store ≠ 组件内部状态
> - 防御式数据处理扩散到view层

### 3.3 URL驱动优先

- 所有可见筛选条件必须体现在URL中
- 页面刷新、分享链接可完整复现状态

> **【仓库对齐说明】**
> 继承并兼容已有的 `/bookstore/search?q=xxx` 行为

---

## 整体架构

### 页面布局结构

```
┌─────────────────────────────────────────────┐
│  页面标题区                                   │
│  "探索书库" + 副标题                          │
├─────────────────────────────────────────────┤
│  🔍 [大型搜索栏 - 搜索书名、作者、标签...]       │
├─────────────────────────────────────────────┤
│  [分类▼] [年份▼] [状态▼]                     │
├─────────────────────────────────────────────┤
│  🏷️ 标签筛选: [热血×] [穿越×] [+ 添加标签]    │
│     (AND模式，推荐≤3个)                       │
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
BrowseBooksView.vue (主组件，替代SearchView)
├── PageHeader.vue (页面标题)
├── SearchBar.vue (搜索栏组件)
├── FilterBar.vue (筛选器行)
│   ├── CategorySelect.vue (分类选择)
│   ├── YearSelect.vue (年份选择)
│   └── StatusSelect.vue (状态选择)
├── TagFilter.vue (独立标签筛选区)
└── BookGrid.vue (复用现有组件，紧凑模式)
```

### 设计原则

- View层只做编排
- 业务状态集中在store
- 数据格式统一由service层处理

---

## 路由与URL规范

### 主路由

```
/bookstore/browse
```

### 兼容旧路由

```
/bookstore/search → /bookstore/browse (保留query)
/bookstore/books  → /bookstore/browse
/bookstore/categories → /bookstore/browse
```

### URL参数规范

```
/bookstore/browse
  ?q=三体
  &categoryId=sci-fi
  &tags=hard&tags=space
  &page=1
  &pageSize=24
```

> **【改进说明】**
> URL语义完全继承现有search行为，避免历史链接失效。

### 数据结构对应

```typescript
interface BrowseFilters {
  q: string              // 搜索关键词
  categoryId: string     // 分类ID（与后端MongoDB对齐）
  year: string           // 年份
  status: string         // 状态
  tags: string[]         // 标签数组（AND关系）
  sortBy: string         // 排序方式
  page: number           // 页码
  pageSize: number       // 每页大小
  tagMode: 'and' | 'or'  // 标签模式（默认and）
}
```

---

## 状态管理与数据流

### browse.store（核心）

```typescript
import { defineStore } from 'pinia'

export const useBrowseStore = defineStore('browse', () => {
  // 状态
  const books = ref<BookBrief[]>([])
  const filters = reactive<BrowseFilters>({
    q: '',
    categoryId: '',
    year: '',
    status: '',
    tags: [],
    sortBy: 'updateTime',
    page: 1,
    pageSize: 24,
    tagMode: 'and'
  })
  const pagination = reactive({
    total: 0,
    hasMore: false
  })
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // Getters
  const hasActiveFilters = computed(() => {
    return !!(
      filters.q ||
      filters.categoryId ||
      filters.year ||
      filters.status ||
      filters.tags.length > 0
    )
  })

  // Actions
  const fetchBooks = async (isLoadMore = false) => {
    // 使用现有bookstore.service获取数据
    const response = await bookstoreService.getBooks(filters)
    
    if (isLoadMore) {
      books.value = [...books.value, ...response.data.books]
    } else {
      books.value = response.data.books
    }
    
    pagination.total = response.data.total
    pagination.hasMore = books.value.length < response.data.total
  }

  const updateFilters = (newFilters: Partial<BrowseFilters>) => {
    Object.assign(filters, newFilters)
    // 非page字段变化时重置page
    if (!newFilters.page) {
      filters.page = 1
    }
    syncURL()
    fetchBooks(false)
  }

  const syncURL = () => {
    const query = objectToQuery(filters)
    router.replace({ query })
  }

  return {
    books, filters, pagination, loading, error,
    hasActiveFilters,
    fetchBooks, updateFilters, syncURL
  }
})
```

### 数据流约定

**onMounted：**
```
解析URL → 初始化store → fetchBooks
```

**filters变化：**
```
非page字段变化 → page重置为1 → 同步URL（debounce）→ 请求数据
```

> **【仓库对齐说明】**
> store使用现有`bookstore.service`的normalize后结果，
> 不直接依赖原始API response结构。

---

## 组件设计

### SearchBar.vue

**功能：**
- 大输入框
- 搜索建议（book/author/tag）
- 搜索历史

> **【改进说明】**
> 点击suggestion默认**不会**直接跳详情，
> 仅提供显式"直达详情"按钮，避免误触。

**接口设计：**
```typescript
Props: {
  modelValue: string
  placeholder?: string
  showHistory?: boolean
}
Emits: {
  'update:modelValue': [value: string]
  'search': [query: string]
  'clear': []
  'add-tag': [tag: string]
}
```

### FilterBar.vue

**功能：**
- 分类/年份/状态
- 提供"重置筛选"入口

> **【仓库对齐说明】**
> v1仅支持**单分类categoryId**，
> 与后端category_ids多分类能力保持一致的升级路径。

**接口设计：**
```typescript
Props: {
  categoryId: string      // 注意：使用categoryId
  year: string
  status: string
  categories: Category[]
  years: string[]
  statuses: Array<{ value: string; label: string }>
}
Emits: {
  'update:categoryId': [value: string]
  'update:year': [value: string]
  'update:status': [value: string]
  'reset': []
}
```

### TagFilter.vue

**功能：**
- 最多8个标签
- 默认AND关系
- 达到3个时给出性能提示

> **【改进说明】**
> - 前端限制：AND模式下≤3个标签为推荐
> - 超出时给出提示，避免后端索引压力
> - 最多8个硬上限

**接口设计：**
```typescript
Props: {
  selectedTags: string[]
  availableTags: Tag[]
  maxSelected?: number      // 默认8
  recommendLimit?: number   // 推荐3个
}
Emits: {
  'update:selectedTags': [tags: string[]]
}
```

---

## API设计

### 沿用现有接口能力

```typescript
interface GetBooksParams {
  q?: string
  categoryId?: string       // 与后端MongoDB对齐
  tags?: string[]
  tagMode?: 'and' | 'or'    // 新增
  page?: number
  pageSize?: number
}
```

> **【仓库对齐说明】**
> 不新增破坏性接口，仅扩展可选参数。

### 参数序列化

```typescript
import qs from 'qs'

request.get('/api/books', {
  params: filters,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { 
      arrayFormat: 'repeat',
      skipNulls: true
    })
  }
})
```

---

## 移动端适配

### 搜索全屏模式

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

### 无限滚动

**行为约定：**
- 筛选变化 → 回到顶部 → page=1
- loadMore失败不清空已加载列表

```typescript
const fetchBooks = async (isLoadMore = false) => {
  try {
    const response = await bookstoreService.getBooks(filters)
    
    if (isLoadMore) {
      books.value = [...books.value, ...response.data.books]
    } else {
      books.value = response.data.books
    }
  } catch (err) {
    // 加载失败时，如果是追加模式，不清空已有数据
    if (isLoadMore) {
      console.error('加载更多失败，但保留已有数据', err)
    } else {
      error.value = err
    }
  }
}
```

---

## 错误处理

### 搜索建议失败：静默处理

```typescript
const fetchSuggestions = useDebounceFn(async (query) => {
  try {
    const res = await api.getSearchSuggestions(query)
    suggestions.value = res.data.items
  } catch (err) {
    // 静默处理，不显示错误提示
    console.warn('搜索建议获取失败:', err)
    suggestions.value = []
  }
}, 300)
```

### 列表请求失败：错误态+重试

```typescript
const error = ref<Error | null>(null)

const fetchBooks = async () => {
  loading.value = true
  error.value = null
  
  try {
    const res = await api.getBooks(filters)
    books.value = res.data.books
  } catch (err) {
    error.value = err
    // 显示错误状态，提供重试按钮
  } finally {
    loading.value = false
  }
}
```

---

## 测试策略

### 调整点（重要）

> **【改进说明】**
> - Playwright不再对LayoutDuration做强断言
> - Lighthouse作为性能硬指标
> - E2E路径统一迁移至`/bookstore/browse`

### E2E测试

```typescript
// tests/e2e/browse-books.spec.ts
test.describe('图书浏览页（替代SearchView）', () => {
  test('旧搜索URL应正确跳转', async ({ page }) => {
    await page.goto('/bookstore/search?q=三体')
    await expect(page).toHaveURL(/\/bookstore\/browse\?q=%E4%B8%89%E4%BD%93/)
  })
  
  test('URL可完整复现筛选状态', async ({ page }) => {
    // 设置筛选
    await page.goto('/bookstore/browse')
    await page.selectOption('select[name="categoryId"]', 'fantasy')
    await page.click('.add-tag-chip')
    await page.click('.tag-option:first-child')
    
    // 获取URL
    const url = page.url()
    
    // 刷新页面
    await page.goto(url)
    
    // 验证状态保持
    await expect(page.locator('select[name="categoryId"]')).toHaveValue('fantasy')
    await expect(page.locator('.selected-tags .tag')).toHaveCount(1)
  })
  
  test('无限滚动失败不影响已加载数据', async ({ page }) => {
    // Mock失败的loadMore请求
    await page.route('**/api/books**', route => {
      const url = new URL(route.request().url())
      const pageNum = url.searchParams.get('page')
      
      if (pageNum && parseInt(pageNum) > 1) {
        route.abort()
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ data: { books: mockBooks, total: 100 }})
        })
      }
    })
    
    await page.goto('/bookstore/browse')
    await page.waitForSelector('.book-card')
    
    const initialCount = await page.locator('.book-card').count()
    
    // 触发无限滚动
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)
    
    // 验证已加载数据仍然存在
    const afterFailCount = await page.locator('.book-card').count()
    expect(afterFailCount).toBe(initialCount)
  })
})
```

### 性能测试

```typescript
test('Lighthouse性能指标', async ({ page }) => {
  await page.goto('/bookstore/browse')
  
  // 等待页面完全加载
  await page.waitForLoadState('networkidle')
  
  // 运行Lighthouse
  const lighthouse = await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage('lighthouse-id', { url: window.location.href }, resolve)
    })
  })
  
  expect(lighthouse.categories.performance.score).toBeGreaterThanOrEqual(0.9) // ≥90分
  expect(lighthouse.audits['first-contentful-paint'].numericValue).toBeLessThanOrEqual(1500) // ≤1.5s
  expect(lighthouse.audits['largest-contentful-paint'].numericValue).toBeLessThanOrEqual(2500) // ≤2.5s
})
```

---

## 实现计划

保持6 Phase结构不变。

### 约束说明

> **Phase 2前必须完成store+URL同步骨架**

### Phase 1: 基础架构搭建 (2-3天)

- 创建BrowseBooksView.vue
- 设置browse.store
- 配置路由重定向
- URL同步逻辑

### Phase 2: 核心组件开发 (5-7天)

- SearchBar组件（含移动端全屏）
- FilterBar组件
- TagFilter组件（含性能提示）
- 主页面集成

### Phase 3: API集成 (2-3天)

- 集成现有bookstore.service
- URL参数序列化
- 数据规范化

### Phase 4: 样式优化 (2-3天)

- 桌面端/移动端样式
- 动画过渡

### Phase 5: 测试和优化 (3-4天)

- 单元测试（覆盖率≥80%）
- E2E测试（迁移测试路径）
- Lighthouse性能优化

### Phase 6: 文档和部署 (1-2天)

- Storybook文档
- 迁移指南
- 发布准备

---

## 数据结构定义

### 核心类型（与后端对齐）

```typescript
// BookBrief - 使用现有类型
export interface BookBrief {
  _id: string
  title: string
  author: string
  cover?: string
  categoryId?: string      // 与MongoDB对齐
  categoryIds?: string[]    // 多分类预留
  categoryName?: string
  tags?: string[]
  rating?: number
  status?: 'serializing' | 'completed' | 'new'
  year?: number
  viewCount?: number
  wordCount?: number
}

// Category - 使用现有类型
export interface Category {
  _id: string
  name: string
  description?: string
  parentId?: string
  sortOrder?: number
}

// Tag - 使用现有类型
export interface Tag {
  _id: string
  name: string
  usageCount?: number
  isHot?: boolean
}

// 筛选器状态
export interface BrowseFilters {
  q: string
  categoryId: string       // 单分类
  year: string
  status: string
  tags: string[]
  sortBy: string
  page: number
  pageSize: number
  tagMode: 'and' | 'or'
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
  - qs (参数序列化)
```

---

## 风险评估

| 风险 | 说明 | 缓解措施 |
|------|------|---------|
| 搜索逻辑重复 | 历史SearchView残留 | 明确替代，删除旧代码 |
| 多标签性能 | Mongo索引压力 | 前端限制≤3个推荐 |
| URL兼容 | 历史链接失效 | 重定向+保留query |
| Store状态不一致 | URL与store不同步 | 强制双向同步 |

---

## 验收标准

### 功能验收

- [x] `/bookstore/search`访问自动跳转且功能一致
- [x] 复制URL可完整复现状态
- [x] 无限滚动失败不影响已加载数据
- [x] 无SearchView/BrowseView双逻辑残留

### 性能验收

- [x] Lighthouse性能分数 ≥ 90
- [x] FCP ≤ 1.5s
- [x] LCP ≤ 2.5s
- [x] 搜索建议响应 ≤ 300ms

### 兼容性验收

- [x] Chrome/Firefox/Safari/Edge最新版
- [x] iOS Safari 14+
- [x] Android Chrome 14+

### 测试验收

- [x] 单元测试覆盖率 ≥ 80%
- [x] E2E测试路径迁移至`/bookstore/browse`
- [x] 可访问性测试通过

---

## 最终结论

该文档已完成从"理想设计"到"仓库可落地设计"的收敛，可作为最终技术评审通过稿进入开发阶段。

---

**文档版本：** 1.2（最终版）  
**最后更新：** 2026-01-25  
**状态：** ✅ 技术评审通过
