# Bookstore 模块重构方案

## 1. 重构目标

- **理清模块边界**：将书城相关页面、组件、状态、服务集中在 `modules/bookstore` 下，避免逻辑散落在顶层 `components` / `views` / `utils` / `api` 中。
- **统一内部分层**：在模块内部建立 `views / components / composables / services / stores / types` 的清晰分工。
- **规范数据访问路径**：书城相关的接口调用统一通过模块内的 service（或 store）访问，逐步减少视图中直接使用请求工具的情况。
- **提高可维护性**：让后续功能迭代（新列表、新筛选、新推荐位）有固定落点，降低心智负担。

## 2. 当前结构概览

当前 `modules/bookstore` 目录结构：

- `api/`（暂为空目录）
- `components/`（书城专用组件）
- `index.ts`（模块汇总或导出文件）
- `routes.ts`（书城路由配置）
- `services/`（模块相关服务，数量有限）
- `stores/`（模块内 Pinia store，数量有限）
- `types/`（模块内类型定义）
- `views/`（页面视图，如 Home、Books、BookDetail、Search 等）

结合全局结构：

- 全局 `stores/bookstore.ts` 也包含书城相关状态和逻辑。
- 全局 `api/bookstore/*`（如果后续补充）可能承担部分书城 API 调用。
- 部分书城相关逻辑可能散落在 `shared/components` 或 `utils` 中。

> 结论：Bookstore 模块已初步模块化，但内部分层和与全局层（stores/api/utils）的边界还不完全清晰。

## 3. 目标模块结构

目标将 `modules/bookstore` 收敛为如下结构（在现有基础上的整理和补全）：

```text
modules/bookstore/
  routes.ts           # 模块路由定义
  index.ts            # 模块入口/导出（按需）

  views/              # 页面视图（路由对应的顶层组件）
    HomeView.vue
    BooksView.vue
    BookDetailView.vue
    BookDetailDemo.vue
    CategoriesView.vue
    RankingsView.vue
    SearchView.vue
    ReaderDemo.vue

  components/         # 仅供 bookstore 使用的 UI 组件
    # 示例：BookCard.vue, BookList.vue, BannerCarousel.vue, FilterPanel.vue

  composables/        # 模块内部复用的组合逻辑（可选，按需补充）
    # 示例：useBookFilters.ts, useBookSearch.ts, useBookDetail.ts

  services/           # 模块业务服务（与后端交互、业务规则封装）
    # 示例：bookstoreService.ts

  stores/             # 模块专属状态（可与全局 stores/bookstore.ts 协同或迁移）
    # 示例：useBookstoreStore.ts

  types/              # 书城领域类型
    # 示例：bookstore.types.ts（Book, Category, RankingItem 等）

  api/                # 可选：如果仍需保留模块内 API 封装，可作为 services 的实现细分
```

### 分层职责约定

- `views/`：
  - 负责布局和页面级状态（如当前筛选条件、分页），不直接关心 HTTP 细节。
  - 调用 `composables` / `stores` / `services` 暴露的接口。

- `components/`：
  - 纯 UI 或轻量交互组件，不直接发请求；数据由 `props` 输入。

- `composables/`：
  - 模块内可复用的组合逻辑（例如搜索逻辑、筛选逻辑）
  - 可以使用 `stores` 与 `services`。

- `services/`：
  - 封装书城相关业务操作，对外暴露清晰方法：
    - 例如：`fetchHomeData`、`fetchBookList`、`fetchBookDetail`、`fetchCategories`、`fetchRankings`、`searchBooks` 等。
  - 内部使用 `core/http` 或 `api/*` 进行请求。

- `stores/`：
  - 管理书城的可共享状态（如当前书籍列表、筛选条件、最近浏览、预加载数据等）。
  - 暴露 actions 调用 `services` 完成异步操作。

- `types/`：
  - 定义 Book、Category、RankingItem、SearchParams 等领域类型。

## 4. 重构步骤

> 原则：**小步重构、随时可运行、每一步保持逻辑行为不变。**

### 步骤 1：梳理 Bookstore 相关入口

1. 检查 `router/modules/bookstore/routes.ts`：
   - 记录所有书城路由及对应视图组件。
2. 在 `views/` 中列出所有页面组件，确认它们是否全部来自书城业务。
3. 检查是否有书城相关页面/组件仍在：
   - `src/components`、`src/views`、`shared/components` 中。
   - 如果存在，记录清单，计划迁移到 `modules/bookstore` 或 `shared`。

### 步骤 2：明确书城数据访问路径

1. 搜索所有书城页面中涉及的 API 调用：
   - 例如包含 `book`、`bookshelf`、`bookstore`、`category`、`ranking` 等关键词的请求。
   - 确认它们当前是通过：
     - `api/bookstore/*`
     - `utils/request`
     - 直接在组件内拼 URL 调用
2. 为书城模块设计 `services/bookstoreService.ts`：
   - 定义清晰方法签名（例如：`getHomeData`, `getBookList`, `getBookDetail(id)` 等）。
   - 内部统一使用当前推荐的请求方式（例如基于 `core` 或 `api` 的封装）。
3. 逐步将视图中的直接请求迁移为调用 `bookstoreService`：
   - 每迁移一个视图，确保功能不变后再继续。

### 步骤 3：整理组件与 composables

1. 在 `views/` 中，识别重复使用的 UI 块：
   - 如“书籍卡片”、“banner”、“筛选面板”、“分页列表”。
2. 将这些 UI 抽取为 `components/` 内组件：
   - 如：`BookCard.vue`, `BookGrid.vue`, `BannerCarousel.vue` 等。
3. 对于跨多个视图复用的业务逻辑（如搜索、筛选、分页）：
   - 抽取为 `composables/`（例如 `useBookSearch.ts`, `useBookFilters.ts`）。

### 步骤 4：与全局 store 对齐

1. 检查 `stores/bookstore.ts` 和 `modules/bookstore/stores/*`：
   - 判断哪部分状态需要全局共享，哪部分仅限于模块内部。
2. 规划：
   - **方案 A**：保留全局 `stores/bookstore.ts` 作为书城主 store，模块内仅引用该 store。
   - **方案 B**：将 store 完全迁移到模块内部（`modules/bookstore/stores`），通过统一入口导出给其他模块使用。
3. 初步建议（保守方案）：
   - 短期内保留 `stores/bookstore.ts`，只在内部清理逻辑和命名。
   - 等模块内部结构稳定后，再评估是否下沉至模块内。

### 步骤 5：清理历史与命名

1. 清点所有带 `Bookstore` / `Book` 前缀的组件、函数、类型：
   - 对名称混乱、语义不清的进行重命名（保持 API 含义单一）。
2. 检查是否有未使用的书城组件或工具函数：
   - 标记为待删除（可移动到 `legacy/` 目录保留一段时间）。
3. 确保 `bookstore` 相关逻辑不再出现在与之无关的模块或工具中；若必须跨模块使用，应抽到 `shared` 或 `core`。

## 5. 验收检查清单

在认为 Bookstore 重构完成之前，至少满足以下条件：

- [ ] `modules/bookstore` 内部结构满足：`views / components / composables / services / stores / types` 的基本约定。
- [ ] 所有书城页面的网络请求通过 `services` 或 `stores` 统一发起，视图中不再直接使用底层请求工具。
- [ ] 书城核心 UI 块已抽取为独立组件，重复 JSX/模板代码显著减少。
- [ ] `stores/bookstore.ts` 与模块内 store 的职责边界清晰，没有明显重复状态或逻辑。
- [ ] 项目能够正常构建、运行，书城主要功能（首页、书库、详情、分类、排行榜、搜索等）全部通过回归测试。
- [ ] 新增书城功能时，开发者能明确知道：
  - 新页面 → 放在 `modules/bookstore/views`
  - 模块内部复用逻辑 → 放在 `modules/bookstore/composables`
  - 与后端交互 → 放在 `modules/bookstore/services`
  - 模块专属类型 → 放在 `modules/bookstore/types`

## 6. 实施策略

- **迭代方式**：按路由 / 页面拆分为多个小 PR 或提交，每次重构一个或少数几个视图。
- **回滚策略**：每次重构保持对旧逻辑的最小改动，在 Git 中通过分支和小步提交，发现问题时可以快速回滚到前一阶段。
- **文档更新**：重构过程中发现的新约定或特殊说明，应同步更新本文件或相关架构文档（如 `架构修复指南_*.md`），保证团队共识。
