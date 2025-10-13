# 阶段二实施文档（融合）

## 目标

- 迁入 `project/*`、`document/*`、`settings/*` 视图与组件；
- 将 LFS `stores/*` 升级为 Pinia v3 写法；
- 对接 `api/writer/*` 后端接口；
- 统一 UI 与主题，复用青羽公共组件；
- 可选：引入 tiptap 并与 Markdown 并存或替换。

## 实施步骤

1) 视图迁入
- `Qingyu/src/modules/writer/views/project/*`
- `Qingyu/src/modules/writer/views/document/*`
- `Qingyu/src/modules/writer/views/SettingsView.vue`

2) 状态管理
- 新建 `Qingyu/src/modules/writer/stores/*`（Pinia v3）；
- 避免 `this.$patch` 老式用法，使用 actions 修改状态；
- 定义清晰的实体：项目、文档、编辑状态、用户首选项。

3) 服务与 API
- 新建 `Qingyu/src/modules/writer/api/*` 或复用 `Qingyu/src/api/*`；
- 统一鉴权流：沿用 `stores/auth.js` + `api/auth.js`；
- 方法覆盖：项目列表/详情/创建/删除；文档列表/详情/保存；设置项读写；
- 错误处理与响应封装对齐青羽规范。

4) UI 与交互
- 复用青羽公共组件：`Loading`、`Empty`、错误页；
- 对齐 Element Plus 主题变量与布局；
- Writer 内部保留侧栏导航，风格统一。

5) 可选：tiptap
- 若采用，按需引入 `@tiptap/core`、`@tiptap/starter-kit`、`@tiptap/vue-3`、常用扩展；
- 保留 Markdown 与 tiptap 并存的模式并提供切换；
- 自动保存（本地/服务端）与冲突合并策略。

## 验证

- 文档创建/编辑/保存/切换无异常；
- 项目和文件树操作（新建、重命名、删除）可用；
- 设置项持久化（本地/服务端）生效；
- 鉴权触发与权限验证正确。

## 进度记录

- [x] 视图组件迁入完成：2025-10-13
- [x] Stores（Pinia v3）完成：2025-10-13
- [ ] API 对接完成：待实施（当前使用 localStorage 模拟）
- [x] UI 统一与主题调整完成：2025-10-13

## 实施详情

### 已完成项目

1. **视图迁移**
   - `ProjectListView.vue`：项目列表视图，支持创建、删除项目
   - `ProjectWorkspace.vue`：项目工作区，包含文档列表和编辑器
   - `EditorView.vue`：独立编辑器视图（Phase 1 已完成）

2. **Pinia v3 Store**
   - `writerStore.js`：使用 Composition API 重写
   - 状态管理：项目列表、当前项目、文档列表、当前文档、编辑器设置
   - Actions：CRUD 操作（项目、文档）、设置保存/加载

3. **路由配置**
   - `/writer`：重定向到项目列表
   - `/writer/projects`：项目列表
   - `/writer/project/:projectId`：项目工作区
   - `/writer/editor`：独立编辑器

4. **UI 组件使用**
   - Element Plus：Card、Dialog、Button、Input、Dropdown、Tag、Icon
   - 青羽公共组件：Loading、Empty
   - 统一配色与交互风格

5. **功能实现**
   - 项目管理：创建、删除、列表展示
   - 文档管理：创建、删除、重命名、内容编辑
   - 自动保存：1.5 秒防抖保存
   - 实时字数统计
   - localStorage 数据持久化（POC 阶段）

### 技术亮点

- **Pinia v3 最佳实践**：使用 Composition API 风格，清晰的 state/getters/actions 分离
- **响应式设计**：左右布局，文档列表与编辑器分屏
- **用户体验优化**：自动保存、草稿恢复、快捷操作
- **代码复用**：复用青羽 Loading/Empty 组件，减少冗余

### 待后续优化

- 对接后端 API（当前使用 localStorage）
- 设置页面（编辑器偏好、AI 设置、模板管理）
- 文件树支持（文件夹层级）
- Markdown 实时预览
- 版本历史与协作功能
