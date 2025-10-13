# LFS → 青羽 Writer 模块 迁移计划与分段 TODO

> 参考工程文档：`Qingyu/doc/engineering/Light-Feather-Studio-迁移实施.md`

## 范围与不在范围

- 在范围：迁入编辑器、项目、文档、设置相关视图与组件；接入青羽鉴权与 API；形成独立路由与可回滚目录结构；Markdown 渲染（`marked`）或按需引入 tiptap。
- 不在范围：Electron 桌面端打包与运行；重写青羽公共组件与导航。

## 分段迁移里程碑

| 阶段 | 目标 | 主要输出 | 验收标准 |
| --- | --- | --- | --- |
| Phase 1：POC | `/writer` 路由与核心编辑器可打开；本地假数据可渲染 | 目录 `src/modules/writer/*`；`EditorView`、`MarkdownEditor`、`EditorToolbar`；新增路由 | 可从主导航进入 `/writer`；编辑器加载无报错；假数据渲染 OK |
| Phase 2：融合 | 项目/文档/设置视图接入；Pinia v3 改造；服务对接后端 API；统一 UI | `project/*`、`document/*`、`settings/*` 视图；`stores/*`（Pinia v3）；`api/writer/*` | 文档创建/编辑/保存/切换可用；与青羽风格一致；鉴权生效 |

## 分段 TODO 清单（可执行）

- Phase 0：准备
  - [ ] 创建目录：`src/modules/writer/{views,components,stores,api}`
  - [ ] 安装按需依赖：`marked`（或 tiptap 套件）
  - [ ] 新增文档索引：`doc/implementation/README_写作端迁移文档.md`

- Phase 1：POC
  - [ ] 迁入核心文件：`EditorView.vue`、`MarkdownEditor.vue`、`EditorToolbar.vue`
  - [ ] 新增 `/writer` 路由并验证可打开（示例见工程文档）
  - [ ] 假数据渲染编辑器与文件树
  - [ ] 完成《阶段一实施文档（POC）》记录与截图

- Phase 2：融合
  - [ ] 迁入 `project/*`、`document/*`、`settings/*` 视图与组件
  - [ ] 升级 LFS `stores/*` 至 Pinia v3 写法，落位 `src/modules/writer/stores/*`
  - [ ] 对接 `api/writer/*` 后端接口，统一鉴权流
  - [ ] 统一 UI：复用青羽公共组件（`Loading`、`Empty`、错误页）与主题
  - [ ] 可选：引入 tiptap 并与 Markdown 并存/替换
  - [ ] 完成《阶段二实施文档（融合）》记录与截图

- 验收与回滚
  - [ ] 按《验收标准与回滚方案》自测与回滚演练
  - [ ] 形成实施总结并归档

## 依赖与风险

- 依赖：Vue 3.5、Vite 7、Element Plus 2.11.x、Pinia 3（以青羽版本为准）
- 风险与缓解：依赖冲突（以青羽为主并必要时锁版本）；编辑器复杂度（先 Markdown，后增量）；API 差异（先假数据后接入）。
