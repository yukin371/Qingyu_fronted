# Light-Feather-Studio → Qingyu 前端 迁移实施文档

> 路径建议：`Qingyu/doc/engineering/Light-Feather-Studio-迁移实施.md`
> 目标：将 Light-Feather-Studio（简称 LFS）的“创作端（Writer）能力”迁移并入青羽前端，形成 `/writer/*` 功能域。

---

## 1. 目标与范围

- 目标：沉淀 LFS 中的写作编辑、项目/文档管理、创作设置等能力，作为青羽的创作端 Writer 模块。
- 范围：
  - 迁移 LFS 的视图与组件（编辑器、项目、文档、设置相关）。
  - 对接青羽现有的认证与 API 体系（Pinia v3 + Axios 封装）。
  - 移除 Electron 相关内容，作为 Web 端能力集成。

不在本次范围：
- 桌面端（Electron）构建与发布流程；
- 重写现有青羽公共组件与导航框架。

---

## 2. 兼容性与总体评估

- 技术兼容：双方均为 Vue 3 + Vite + Element Plus + Pinia + Vue Router，结构匹配度高。
- 差异项：
  - LFS 使用 `vite-plugin-electron`（需剥离）；
  - LFS 依赖 `marked` 与部分 tiptap 扩展（青羽按需新增或替换）；
  - LFS 为 Pinia v2 写法，青羽为 Pinia v3（需适配）。

结论：选择性复用（集成为 Writer 模块）优于重写，开发成本更低、收益更高。

---

## 3. 迁移策略（两阶段）

- 阶段1（POC，0.5–1 天）：
  - 在青羽中创建 `src/modules/writer/`，迁入核心视图与编辑器组件；
  - 新增 `/writer/*` 路由，以本地假数据跑通；
  - 不引入 Electron 相关配置与代码；
- 阶段2（融合，1–2 天）：
  - 统一依赖到青羽版本（Vue 3.5、Pinia 3、Vite 7、Element Plus 2.11.x）；
  - 改造 LFS stores/services 对接青羽后端 API；
  - 统一 UI（复用青羽 Header/公共组件，Writer 内部保留侧栏导航）；
  - 按需增强编辑器（tiptap/marked 方案二选一或并存）。

---

## 4. 目录映射（建议落位）

- LFS → 青羽 Writer 模块（新增）：
  - `Light-Feather-Studio/src/views/EditorView.vue` → `Qingyu/src/modules/writer/views/EditorView.vue`
  - `Light-Feather-Studio/src/views/NovelWorkspace.vue` → `Qingyu/src/modules/writer/views/NovelWorkspace.vue`
  - `Light-Feather-Studio/src/views/document/*` → `Qingyu/src/modules/writer/views/document/*`
  - `Light-Feather-Studio/src/views/project/*` → `Qingyu/src/modules/writer/views/project/*`
  - `Light-Feather-Studio/src/views/settings/*` → `Qingyu/src/modules/writer/views/settings/*`
  - `Light-Feather-Studio/src/components/editor/*` → `Qingyu/src/modules/writer/components/editor/*`
  - `Light-Feather-Studio/src/components/project/*` → `Qingyu/src/modules/writer/components/project/*`
  - `Light-Feather-Studio/src/components/common/*` → `Qingyu/src/modules/writer/components/common/*`
  - `Light-Feather-Studio/src/components/ui/*`（按需） → `Qingyu/src/modules/writer/components/ui/*`

- 舍弃 / 不迁移：
  - `Light-Feather-Studio/electron/*`, `electron-main.cjs`, `vite-plugin-electron` 相关配置；
  - `__tests__`（可后续补齐到青羽测试体系）。

---

## 5. 依赖与版本策略

- 以青羽为基准：
  - Vue：^3.5.x；Vite：^7；Element Plus：^2.11.x；Pinia：^3。
- 新增（按需）：
  - `marked@^16`（Markdown 渲染）；
  - 所见即所得方案若采用 tiptap：`@tiptap/core @tiptap/starter-kit @tiptap/vue-3 @tiptap/extension-color`。
- 移除/忽略：Electron 相关 devDependencies 不并入青羽。

---

## 6. 状态管理与服务接入

- stores：
  - 将 LFS `src/stores/*` 改造为 Pinia v3 写法，落位 `src/modules/writer/stores/*`；
  - 避免 `this.$patch` 老式用法，使用 actions 明确修改；
- services：
  - 将 LFS `src/services/*` 对接青羽前端 `src/api/*`（或新增 `src/api/writer/*`）调用后端；
  - 统一鉴权流，复用青羽 `stores/auth.js` + `api/auth.js`。

---

## 7. 路由接入（示例）

```js
// Qingyu/src/router/index.js 片段（示例）
{
  path: '/writer',
  component: () => import('@/modules/writer/views/NovelWorkspace.vue'),
  children: [
    { path: '', name: 'writer-home', component: () => import('@/modules/writer/views/EditorView.vue') },
    { path: 'editor/:id?', name: 'writer-editor', component: () => import('@/modules/writer/views/EditorView.vue') },
    { path: 'projects/:id?', name: 'writer-project', component: () => import('@/modules/writer/views/project/ProjectView.vue') },
    { path: 'documents/:id?', name: 'writer-document', component: () => import('@/modules/writer/views/document/DocumentView.vue') },
    { path: 'settings/:tab?', name: 'writer-settings', component: () => import('@/modules/writer/views/SettingsView.vue') },
  ]
}
```

---

## 8. 实施步骤（Checklist）

准备：
- [ ] 创建目录：`src/modules/writer/{views,components,stores,api}`；
- [ ] 安装按需依赖：`marked`（或 tiptap 套件）。

阶段1（POC）：
- [ ] 迁入核心文件：`EditorView.vue`、`MarkdownEditor.vue`、`EditorToolbar.vue`；
- [ ] 新增 `/writer` 路由并可访问；
- [ ] 用本地假数据渲染编辑器与文件树。

阶段2（融合）：
- [ ] 迁入 `project/*`、`document/*`、`settings/*` 视图与组件；
- [ ] 将 LFS `stores/*` 升级为 Pinia v3 并落位；
- [ ] 将 LFS `services/*` 对接到青羽后端 API（或新增 `api/writer/*`）；
- [ ] 统一 UI：复用青羽 Header/公共组件（Loading/Empty/Error），Writer 内部保留侧栏导航；
- [ ] 统一样式与主题变量（Element Plus 可选覆盖）。

编辑器增强（可选）：
- [ ] 若采用 tiptap：补齐 core/StarterKit 与常用扩展；
- [ ] 若继续 Markdown：保留 `marked`，增强工具栏、草稿自动保存。

测试与验收：
- [ ] 路由/导航/返回行为；
- [ ] 文档创建/编辑/保存/切换；
- [ ] 项目新建、文件树操作（重命名、删除）；
- [ ] 设置项持久化（本地/服务端）；
- [ ] 鉴权与权限验证。

文档与清理：
- [ ] 本实施文档完善；
- [ ] 移除未使用的 Electron 相关残留。

---

## 9. 验收标准

- 能从主导航进入 `/writer`，主要视图可正常打开无报错；
- 文档编辑可保存（草稿或后端），刷新可恢复；
- 项目/文档/设置风格与青羽一致，交互流畅；
- 端到端路径（新建→编辑→保存→切换→返回）顺畅。

---

## 10. 回滚方案

- 迁移代码完全隔离于 `src/modules/writer/` 与路由节点；
- 如需回滚，删除该目录并回退路由变更即可，不影响书城与其他模块。

---

## 11. 风险与缓解

- 依赖冲突：以青羽版本为主，LFS 依赖仅增不改；必要时锁定版本；
- 编辑器复杂度：先落地 Markdown，所见即所得随后增量；
- API 差异：先用假数据跑通，再分支接入真实 API。

---

## 12. 工期与里程碑（预估）

- D0：POC 路由 + 编辑器渲染（0.5–1 天）；
- D1：项目/文档/设置接入 + Pinia/Service 改造（1 天）；
- D2：后端 API 对接 + 样式统一 + 验收（0.5–1 天）。

---

## 附录 A：参考清单（LFS 主要文件）

- 视图：`src/views/EditorView.vue`、`src/views/NovelWorkspace.vue`、`src/views/document/*`、`src/views/project/*`、`src/views/settings/*`
- 组件：`src/components/editor/*`、`src/components/project/*`、`src/components/common/*`、`src/components/ui/*`
- Electron（忽略）：`electron/*`、`electron-main.cjs`、`vite-plugin-electron` 相关。
