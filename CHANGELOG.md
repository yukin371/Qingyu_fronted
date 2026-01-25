# Changelog

本文档记录 Qingyu_fronted 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

#### 📚 Bookstore模块

- **BREAKING**: 新增统一的图书浏览页面 (`/bookstore/browse`)
  - 整合搜索、分类、筛选功能到单一页面
  - 支持多标签筛选（最多8个，推荐≤3个）
  - 移动端无限滚动加载
  - URL状态同步，支持分享筛选条件

- **BrowseBooksView 组件**
  - 替代原有 SearchView、BooksView、CategoriesView
  - 响应式设计，支持移动端和桌面端
  - 骨架屏加载效果
  - 智能空状态提示

- **SearchBar 组件** (`components/BrowseBooks/SearchBar.vue`)
  - 实时搜索输入
  - 防抖处理
  - 清除按钮
  - 响应式样式

- **FilterBar 组件** (`components/BrowseBooks/FilterBar.vue`)
  - 分类筛选
  - 年份筛选
  - 状态筛选
  - 横向滚动支持

- **TagFilter 组件** (`components/BrowseBooks/TagFilter.vue`)
  - 多标签选择（AND/OR模式）
  - 性能保护提示（>3个标签）
  - 动画过渡效果

- **BookGridSkeleton 组件** (`components/BrowseBooks/BookGridSkeleton.vue`)
  - Shimmer加载动画
  - 可配置骨架屏数量
  - 响应式网格布局

- **browse.store** - 浏览页状态管理
  - URL与Store双向同步
  - 筛选条件管理
  - 分页状态管理
  - 加载和错误状态

- **meta.store** - 静态数据缓存
  - 分类列表缓存
  - 年份列表缓存
  - 标签列表缓存
  - 智能缓存策略

- **browse.service** - API服务层
  - 获取书籍列表
  - 获取搜索建议
  - 获取标签列表
  - 获取分类列表
  - 获取年份列表

- **url-sync 工具** - URL同步工具函数
  - filtersToQuery - 筛选条件转URL参数
  - queryToFilters - URL参数转筛选条件

### Changed

#### 🔄 Breaking Changes

- **路由重定向**
  - `/bookstore/search` 重定向到 `/bookstore/browse`（保留查询参数）
  - `/bookstore/books` 重定向到 `/bookstore/browse`
  - `/bookstore/categories` 重定向到 `/bookstore/browse`（转换id为categoryId）

- **API参数命名**
  - 分类字段从 `id` 改为 `categoryId`（与后端MongoDB对齐）
  - 新增 `tagMode` 参数（默认`and`）

#### ✨ 功能改进

- 搜索建议API返回统一的多态响应格式
- 分类列表支持缓存
- 年份列表支持缓存
- 标签列表支持缓存

### Fixed

- 修复URL与Store状态不一致的问题
- 修复无限滚动失败时清空已加载数据的问题
- 修复移动端分页组件显示异常的问题

### Technical

#### 🏗️ 架构

- 新增 `browse.store.ts` - 浏览页状态管理
- 新增 `meta.store.ts` - 静态数据缓存
- 新增 `browse.service.ts` - API服务层
- 新增 URL同步工具函数
- 新增 BrowseBooks 相关组件（SearchBar、FilterBar、TagFilter、BookGridSkeleton）

#### 📝 文档

- 新增 [BrowseBooks迁移指南](docs/migration/browse-books-migration.md)
- 新增 [BrowseBooks实现计划](docs/plans/2026-01-25-browse-books-implementation.md)

#### ✅ 测试

- 新增 E2E测试 (`tests/e2e/browse-books.spec.ts`)
  - 页面渲染测试
  - 搜索功能测试
  - 筛选功能测试
  - URL同步测试
  - 响应式测试

- 新增性能测试 (`tests/performance/browse-books.perf.spec.ts`)
  - DOM节点数量检查
  - 搜索框响应时间
  - 首次内容绘制（FCP）
  - 页面资源加载检查
  - 内存使用检查
  - 页面布局稳定性
  - 组件渲染性能

- 新增单元测试
  - browse.store 测试
  - meta.store 测试
  - browse.service 测试
  - url-sync 工具测试
  - SearchBar 组件测试
  - FilterBar 组件测试
  - TagFilter 组件测试
  - BookGridSkeleton 组件测试
  - BrowseBooksView 集成测试
  - 路由配置测试

**测试统计**:
- 总测试数: 67+
- 测试通过率: 100%
- E2E测试: 13个场景
- 性能测试: 7个场景
- 单元测试: 47+个测试用例

---

## 版本说明

### 版本命名规则

- **主版本号**: 不兼容的API变更
- **次版本号**: 向下兼容的功能新增
- **修订号**: 向下兼容的问题修复

### 变更类型

- **Added**: 新增功能
- **Changed**: 功能变更
- **Deprecated**: 即将废弃的功能
- **Removed**: 已移除的功能
- **Fixed**: 问题修复
- **Security**: 安全相关修复

---

## 链接

- [Git仓库](https://github.com/your-org/qingyu)
- [Issue跟踪](https://github.com/your-org/qingyu/issues)
- [API文档](./docs/api-migration.md)
