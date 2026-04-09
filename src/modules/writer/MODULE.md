# Writer Module

> 最后更新：2026-04-09

## 职责

承接写作工作区、Editor V3、Story Harness、AI 工作台与辅助工具的一体化前端宿主。`src/modules/writer` 负责把章节编辑、建议生成、提案暂存、工具查看与 AI handoff 串成同一条作者工作流；不负责后端事实真相，也不在主编辑区再维护第二套工具页宿主。

## 数据流

```
章节/项目路由 → ProjectWorkspace → WorkspaceEditorContent
                               ├→ TipTap + Story Harness（主写作面）
                               ├→ WorkspaceToolOverlay（关系图谱/时间线/分支/结构舞台）
                               └→ WorkspaceRightPanel（AI 工作台 / proposal / apply feedback）

工具交互/选区动作 → trigger-ai-action → handleWorkflowAction → 右侧 AI 工作台
快捷键配置 → useShortcutConfig → useWorkspaceShortcuts → overlay / workspace action
旧 encyclopedia deep-link → ProjectWorkspace 兼容层 → 打开 overlay → 主路由回收为 writing
```

## 约定 & 陷阱

- **工具唯一入口**：`relations / timeline / branches / structure` 只允许通过 `WorkspaceToolOverlay` 承载；不要再让 `WorkspaceEditorContent` 主内容区直接切成工具页。
- **主区优先写作**：即使从旧 `tool=encyclopedia&encyclopediaView=*` 链接进入，也应自动转成 overlay 打开，并让主工作区保持写作态。
- **快捷键 owner 已收口**：`useToolOverlay` 只做状态管理；快捷键动作定义在 `workspaceShortcutActions.ts`，配置由 `useShortcutConfig` 承接，行为绑定由 `useWorkspaceShortcuts` 承接。
- **快捷键锁定规则按 action id**：快捷键设置面板不得再按 `Tab`、`Escape` 这类具体键名推断“系统键”；是否可编辑必须复用 `workspaceShortcutActions.ts` 中声明的 action 级锁定口径，避免编辑器宿主拆分后再次回到键位硬编码。
- **AI handoff 不要断链**：工具页、Story Harness、编辑器选区发出的 `trigger-ai-action` 必须继续落到 `ProjectWorkspace.handleWorkflowAction`，否则右栏 AI 工作台会失去上下文注入。
- **test=true 兼容**：writer 模块保留 mock/test-mode 工作区入口，新增宿主或工具边界时要同时确认真实 API 路径和 mock 路径都能跑通。
- **文档同步触发条件**：只要修改工作区宿主边界、工具入口策略、快捷键 owner 或 AI handoff 主链，就必须同步本文件和 `docs/plans/v3/implementation/*` 的对应检查点文档。
