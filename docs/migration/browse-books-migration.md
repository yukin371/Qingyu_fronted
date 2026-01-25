# BrowseBooks页面迁移指南

## 概述

BrowseBooks页面是SearchView的升级替代版本，整合了原有的书库、分类和搜索功能，提供统一的图书浏览体验。

## URL变更

### 旧URL → 新URL

| 旧URL | 新URL | 说明 |
|-------|-------|------|
| `/bookstore/search?q=xxx` | `/bookstore/browse?q=xxx` | 搜索参数保持 |
| `/bookstore/books` | `/bookstore/browse` | 重定向 |
| `/bookstore/categories?id=xxx` | `/bookstore/browse?categoryId=xxx` | 分类参数转换 |

### URL参数映射

| 旧参数 | 新参数 | 说明 |
|---------|---------|------|
| `id` (分类) | `categoryId` | 与后端MongoDB对齐 |
| 无 | `tagMode` | 默认`and`，新增标签模式 |

## 功能变更

### 新增功能

1. **多标签筛选** - 支持最多8个标签（推荐≤3个）
   - AND模式：所有标签同时匹配
   - OR模式：任一标签匹配即可
   - 性能保护：超过3个标签时显示警告提示

2. **无限滚动** - 移动端自动加载更多
   - 使用 Intersection Observer API
   - 自动检测滚动位置触发加载
   - 支持手动"加载更多"按钮

3. **URL状态同步** - 所有筛选条件可分享
   - URL与Store双向同步
   - 支持直接URL访问恢复状态
   - 浏览器前进/后退正常工作

4. **骨架屏加载** - 提升加载体验
   - Shimmer动画效果
   - 响应式网格布局
   - 自定义骨架屏数量

5. **智能缓存** - 静态数据缓存
   - 分类列表缓存
   - 年份列表缓存
   - 标签列表缓存
   - 支持强制刷新

### 保持兼容

1. **搜索功能** - 完全兼容现有搜索逻辑
2. **筛选逻辑** - API参数向后兼容
3. **历史链接** - 自动重定向保留参数

## 代码迁移

### 替换SearchView引用

在代码中搜索以下模式并替换：

```typescript
// 旧
import SearchView from '@/modules/bookstore/views/SearchView.vue'
{ path: 'search', component: SearchView }

// 新
import BrowseBooksView from '@/modules/bookstore/views/BrowseBooksView.vue'
{ path: 'browse', component: BrowseBooksView }
```

### Store使用

```typescript
// 旧
import { useSearchStore } from '@/modules/bookstore/stores/search.store'

// 新
import { useBrowseStore } from '@/modules/bookstore/stores/browse.store'
```

### API调用

```typescript
// 旧
import { bookstoreService } from '@/modules/bookstore/services/bookstore.service'

// 新
import { browseService } from '@/modules/bookstore/services/browse.service'
```

## 组件变更

### 新增组件

| 组件 | 路径 | 用途 |
|------|------|------|
| SearchBar | `components/BrowseBooks/SearchBar.vue` | 搜索栏组件 |
| FilterBar | `components/BrowseBooks/FilterBar.vue` | 筛选器组件 |
| TagFilter | `components/BrowseBooks/TagFilter.vue` | 标签筛选组件 |
| BookGridSkeleton | `components/BrowseBooks/BookGridSkeleton.vue` | 骨架屏组件 |

### 新增工具

| 工具 | 路径 | 用途 |
|------|------|------|
| url-sync | `utils/url-sync.ts` | URL与筛选条件双向转换 |

### 新增Store

| Store | 路径 | 用途 |
|-------|------|------|
| browse.store | `stores/browse.store.ts` | 浏览页状态管理 |
| meta.store | `stores/meta.store.ts` | 静态数据缓存 |

## 测试清单

部署前确认：

- [ ] `/bookstore/search` 自动跳转到 `/bookstore/browse`
- [ ] `/bookstore/books` 自动跳转到 `/bookstore/browse`
- [ ] `/bookstore/categories?id=xxx` 跳转到 `/bookstore/browse?categoryId=xxx`
- [ ] 搜索功能正常
- [ ] 所有筛选器正常工作
- [ ] 标签筛选正常（含性能提示）
- [ ] URL可正确同步
- [ ] 分页/无限滚动正常
- [ ] 移动端响应式正常
- [ ] E2E测试全部通过
- [ ] 性能测试通过

## 性能指标

### 目标性能

- **DOM节点数量**: < 2000
- **首次内容绘制(FCP)**: < 1.5s
- **搜索框响应时间**: < 500ms
- **JS堆大小**: < 100MB
- **布局稳定性**: CLS < 0.1

### 优化措施

1. **虚拟滚动** - 大量数据时考虑使用
2. **懒加载** - 图片懒加载
3. **代码分割** - 路由级代码分割
4. **缓存策略** - 合理使用缓存
5. **防抖节流** - 搜索输入防抖

## 回滚方案

如果出现问题需要回滚：

1. 恢复路由配置（移除重定向）
2. 恢复旧页面组件
3. 通知用户使用旧URL
4. 记录问题并修复

## 常见问题

### Q: 搜索功能与旧版有什么不同？

A: 搜索逻辑完全兼容，但新版本支持URL状态同步，可以直接分享搜索结果。

### Q: 标签筛选为什么限制8个？

A: 出于性能考虑，过多标签会导致查询复杂度指数增长。推荐使用3个以下标签。

### Q: 移动端无限滚动如何触发？

A: 滚动到页面底部自动触发，也可以点击"加载更多"按钮手动触发。

### Q: 如何自定义骨架屏数量？

A: 通过 `count` prop 设置，默认为12个。

### Q: 静态数据如何刷新？

A: meta.store 提供 `force` 参数，传入 `true` 可强制刷新缓存数据。

## 相关文档

- [实现计划](../plans/2026-01-25-browse-books-implementation.md)
- [测试报告](../test-reports/)
- [API文档](../api-migration.md)

## 更新日志

- **2026-01-25**: 创建迁移文档
