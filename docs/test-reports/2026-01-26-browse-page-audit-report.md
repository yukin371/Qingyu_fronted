# BrowseBooksPage 审查报告

**日期**: 2026-01-26
**测试环境**: Chrome DevTools MCP
**测试 URL**: http://localhost:5182/bookstore/browse
**测试工具**: Vite 7.1.12 + Chrome DevTools
**审查状态**: ❌ **未通过 - 发现阻塞性问题**

---

## 📋 执行摘要

### 🚨 关键发现

BrowseBooksView 页面存在**阻塞性 API 路径错误**，导致页面无法正常加载任何数据。页面架构设计符合要求，但实现细节存在多处需要修复的问题。

### 问题优先级分布

| 优先级 | 数量 | 状态 |
|--------|------|------|
| P0 - 阻塞性 | 1 | 🔴 必须修复 |
| P1 - 高优先级 | 2 | 🟠 建议修复 |
| P2 - 中优先级 | 1 | 🟡 可选修复 |
| P3 - 低优先级 | 2 | ⚪ 非关键 |

---

## 🔍 详细发现

### P0: 阻塞性问题（必须修复）

#### ❌ 1. API 路径前缀重复

**问题描述**：
`browse.service.ts` 中的 API 路径配置错误，导致所有请求返回 404。

**错误路径**：
```typescript
// browse.service.ts (当前错误实现)
httpService.get('/api/books', ...)          // → /api/v1/api/books ❌
httpService.get('/api/categories', ...)     // → /api/v1/api/categories ❌
httpService.get('/api/books/years', ...)    // → /api/v1/api/books/years ❌
httpService.get('/api/tags', ...)           // → /api/v1/api/tags ❌
```

**根本原因**：
- `http.service.ts` 拦截器（第63-66行）自动添加 `/api/v1` 前缀
- `browse.service.ts` 路径已包含 `/api`，导致重复

**正确格式**（参考 `categories.ts` 和 `bookstore.ts`）：
```typescript
// 应该使用
httpService.get('/bookstore/books', ...)
httpService.get('/bookstore/categories/tree', ...)
httpService.get('/bookstore/books/years', ...)  // 需确认后端是否支持
httpService.get('/bookstore/tags', ...)         // 需确认后端是否支持
```

**影响范围**：
- ❌ 分类数据无法加载
- ❌ 年份数据无法加载
- ❌ 标签数据无法加载
- ❌ 书籍列表无法加载

**网络请求证据**：
```
reqid=204 GET http://localhost:8080/api/v1/api/categories [404]
reqid=205 GET http://localhost:8080/api/v1/api/books/years [404]
reqid=206 GET http://localhost:8080/api/v1/api/tags [404]
reqid=207 GET http://localhost:8080/api/v1/api/books [404]
```

**修复方案**：
```typescript
// src/modules/bookstore/services/browse.service.ts

export const browseService = {
  async getBooks(filters: BrowseFilters): Promise<GetBooksResponse> {
    const params = { /* ... */ }
    // 修复：移除 /api 前缀
    return httpService.get('/bookstore/books', { params: cleanParams })
  },

  async getSearchSuggestions(query: string) {
    // 修复：移除 /api 前缀
    return httpService.get('/bookstore/books/suggestions', { params: { q: query } })
  },

  async getTags(categoryId?: string) {
    // 修复：移除 /api 前缀
    return httpService.get('/bookstore/tags', { params: { categoryId } })
  },

  async getCategories() {
    // 修复：使用正确的分类端点
    return httpService.get('/bookstore/categories/tree')
  },

  async getYears() {
    // 修复：移除 /api 前缀
    return httpService.get('/bookstore/books/years')
  }
}
```

**修复位置**：
- `src/modules/bookstore/services/browse.service.ts`: 35, 42, 49, 56, 63 行

---

### P1: 高优先级问题（影响用户体验）

#### ⚠️ 2. Element Plus 组件未迁移

**问题描述**：
BrowseBooksView.vue 仍在使用 Element Plus 的 `el-pagination` 组件，违反了组件库迁移计划。

**问题代码**：
```vue
<!-- BrowseBooksView.vue:81-89 -->
<el-pagination
  v-model:current-page="browseStore.filters.page"
  :page-size="browseStore.filters.pageSize"
  :total="browseStore.pagination.total"
  :page-sizes="[12, 24, 36, 48]"
  layout="total, sizes, prev, pager, next"
  @current-change="handlePageChange"
  @size-change="handleSizeChange"
/>
```

**影响**：
- 与青羽设计系统风格不一致
- 违反 Tailwind 重构计划
- 增加打包体积（Element Plus 依赖）

**修复方案**：
1. 使用现有的青羽设计系统分页组件
2. 或创建新的 QyPagination 组件（参考设计文档）

---

#### ⚠️ 3. Message 调用方式错误

**问题描述**：
页面显示错误：`message2.error is not a function`

**控制台证据**：
```
uid=1_21 StaticText "message2.error is not a function"
```

**根本原因**：
- Element Plus 的 message 调用方式已更改
- 或使用了错误的青羽消息组件导入方式

**修复方案**：
使用正确的青羽设计系统消息组件：
```typescript
import { message } from '@/design-system/services'

// 使用
message.error('错误信息')
message.success('成功信息')
```

---

### P2: 中优先级问题（可访问性）

#### 📝 4. 表单字段缺少可访问性属性

**问题描述**：
2 个表单输入字段缺少 `id` 或 `name` 属性，影响浏览器自动填充和可访问性。

**受影响元素**：
1. `uid=1_9` - 顶部导航搜索框
2. `uid=1_16` - Browse页面搜索框

**控制台警告**：
```
A form field element should have an id or name attribute (count: 2)
```

**修复方案**：
```vue
<!-- 添加 id 或 name 属性 -->
<input
  id="browse-search-input"
  name="search"
  v-model="searchQuery"
  placeholder="搜索书名、作者、标签..."
/>
```

---

### P3: 低优先级问题（非关键）

#### ℹ️ 5. Menu 组件引用未解析

**问题描述**：
```
[Vue warn]: Failed to resolve component: Menu
```

**位置**：MainLayout.vue

**建议**：检查 Menu 组件是否已迁移到 QyMenu 或移除引用

---

#### ℹ️ 6. baseline-browser-mapping 过期

**问题描述**：
```
[baseline-browser-mapping] The data in this module is over two months old
```

**修复方案**：
```bash
npm i baseline-browser-mapping@latest -D
```

---

## ✅ 符合设计文档的部分

以下功能已正确实现，符合 `docs/plans/2026-01-25-bookstore-browse-page-design-v1.2.md` 要求：

| 功能 | 要求 | 实现 | 状态 |
|------|------|------|------|
| 页面标题 | "探索书库" | ✅ "探索书库" | ✅ |
| 页面副标题 | "发现你喜欢的精彩书籍" | ✅ 完全匹配 | ✅ |
| SearchBar 组件 | 支持搜索建议 | ✅ 已实现 | ✅ |
| FilterBar 组件 | 分类/年份/状态筛选 | ✅ 已实现 | ✅ |
| TagFilter 组件 | 多标签筛选（AND模式） | ✅ 已实现 | ✅ |
| BookGrid 组件 | 紧凑网格模式 | ✅ 已实现 | ✅ |
| 分页/无限滚动 | 桌面/移动端适配 | ✅ 已实现 | ⚠️ |
| URL 驱动 | URL ↔ Store 双向同步 | ✅ 已实现 | ✅ |
| 空状态处理 | 多种空状态场景 | ✅ 已实现 | ✅ |
| 错误处理 | 重试机制 | ✅ 已实现 | ✅ |

---

## 🔧 修复建议

### 立即修复（P0）

1. **修复 browse.service.ts API 路径**
   ```bash
   # 编辑文件
   src/modules/bookstore/services/browse.service.ts
   ```
   将所有 `/api/...` 路径改为 `/bookstore/...`

### 高优先级修复（P1）

2. **迁移 el-pagination 到 QyPagination**
3. **修复 message 调用方式**

### 建议修复（P2）

4. **添加表单字段可访问性属性**

### 可选修复（P3）

5. **修复 Menu 组件引用**
6. **更新 baseline-browser-mapping**

---

## 📊 对比设计文档的差异

### 架构差异：无

页面架构完全符合设计文档要求：
- ✅ 单页入口设计
- ✅ URL 驱动优先
- ✅ 单一真源（Pinia Store）
- ✅ 组件化设计

### 实现差异：轻微

1. **分页组件**：使用了 Element Plus 而非青羽设计系统
2. **API 路径**：使用了错误的前缀导致 404

### 功能差异：无

所有设计文档要求的功能均已实现（除 API 错误导致无法验证）

---

## 🎯 验收标准

修复后应满足以下标准：

### 功能验收
- [ ] 所有 API 请求返回 200（非 404）
- [ ] 页面能正常显示书籍列表
- [ ] 搜索功能正常工作
- [ ] 筛选功能正常工作
- [ ] 分页功能正常工作
- [ ] 无限滚动功能正常工作（移动端）

### 技术验收
- [ ] 不使用 Element Plus 组件（el-*）
- [ ] 无控制台错误
- [ ] 所有表单字段有 id/name 属性
- [ ] API 路径符合 `/bookstore/...` 格式

### 性能验收
- [ ] Lighthouse 性能分数 ≥ 90
- [ ] FCP ≤ 1.5s
- [ ] LCP ≤ 2.5s

---

## 📝 后续步骤

1. **立即修复 P0 问题**（API 路径）
2. **验证后端端点**：
   - `/bookstore/books/years` 是否存在
   - `/bookstore/tags` 是否存在
3. **迁移 P1 组件**（分页、消息）
4. **改进 P2 可访问性**
5. **重新测试**并更新此报告

---

**报告生成时间**: 2026-01-26
**审查工具**: Chrome DevTools MCP + Serena
**审查人员**: Claude (Serena Agent)
**审查状态**: ❌ 未通过 - 需要修复 P0-P1 问题
