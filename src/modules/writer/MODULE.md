# Writer Module

> 最后更新：2026-04-15

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
- **资产总览也走 overlay owner**：`assets` 与 `structure / relations / timeline / branches` 一样，只允许通过 `WorkspaceToolOverlay` 承载；分类状态 owner 在 overlay，自身视图只负责展示与发事件，避免路由、宿主、视图三处各维护一套资产分类状态。
- **结构舞台跳资产总览也只走 overlay 切换**：`StructureInspectorPanel` 里的“查看全局资产”只允许发 `switch-tool('assets')`，再由 `StructureStageView -> WorkspaceToolOverlay` 透传；不要在结构舞台内部内嵌资产列表、复制分类状态，或新增第二套资产宿主。
- **主区优先写作**：即使从旧 `tool=encyclopedia&encyclopediaView=*` 链接进入，也应自动转成 overlay 打开，并让主工作区保持写作态。
- **快捷键 owner 已收口**：`useToolOverlay` 只做状态管理；快捷键动作定义在 `workspaceShortcutActions.ts`，配置由 `useShortcutConfig` 承接，行为绑定由 `useWorkspaceShortcuts` 承接。
- **快捷键锁定规则按 action id**：快捷键设置面板不得再按 `Tab`、`Escape` 这类具体键名推断“系统键”；是否可编辑必须复用 `workspaceShortcutActions.ts` 中声明的 action 级锁定口径，避免编辑器宿主拆分后再次回到键位硬编码。
- **AI handoff 不要断链**：工具页、Story Harness、编辑器选区发出的 `trigger-ai-action` 必须继续落到 `ProjectWorkspace.handleWorkflowAction`，否则右栏 AI 工作台会失去上下文注入。
- **全屏工具 handoff 要复用共享实体上下文**：`CharacterGraphView / TimelineOutlineView / StoryBranchView / StructureStageView` 发给 AI 的 `add_to_chat` 文本不能只带局部节点名；应优先复用 `useWorkflowContext` 产出的 `activeEntities` / `workflowContext`，把当前章节的活跃角色、物品、地点等上下文一起带过去，避免工具页再次回到各自拼接一套孤立上下文。
- **全屏工具可见上下文由 overlay 统一展示**：`WorkspaceToolOverlay` 应使用 `useWorkflowContext` 同 owner 的摘要能力，把章节 / 场景 / 活跃实体显示在工具层顶部；不要再让 `CharacterGraphView / TimelineOutlineView / StoryBranchView / StructureStageView` 各自维护一份独立的“当前上下文”条。
- **资产总览优先复用统一实体口径**：`EncyclopediaView` 当前已被复用为 Phase 4 资产总览 MVP，数据源应优先拼接 `writerStore.characters / locations`、统一实体接口 `api/entities.ts`（至少 item / organization）与 `conceptApi`，不要再额外新建影子资产 store。若后续要升级为独立 `AssetsOverviewView`，也必须先保持这套聚合口径不变。
- **资产总览图谱深链由 overlay 接管**：`EncyclopediaView` 只负责发 `focus-graph-asset + switch-tool` 事件，不自己持有图谱 focus 状态；`WorkspaceToolOverlay` 是这条 focus payload 的 owner，并只把一次性聚焦参数透传给 `CharacterGraphView`。不要把图谱定点跳转状态再塞回路由、store 或资产视图本身。
- **最近章节/节点数属于前端聚合口径**：资产总览里的“最近出现章节 / 关联结构节点数”目前由 `writerAssetRefs` 与 `OutlineNode.documentId` 绑定推导，只代表当前前端已知引用，不等同于后端统一事实。若未来后端补正式字段，必须先明确新 owner，再替换这层前端聚合逻辑。
- **资产深链当前默认落全局图谱**：从资产总览点进“关系图谱”时，`CharacterGraphView` 当前会切到全局图谱并高亮目标节点，以保证角色/地点/物件最小可达；组织/概念若尚无图谱节点，只允许提示“未接入”，不要伪造成已接线成功。
- **概念优先复用 smart keyword 类型，不走纯文本猜测**：`writerAssetRefs` 当前已支持 `organization/concept`，但章节候选里这两类只应优先来自 TipTap smart keyword 的已解析类型或已确认绑定，避免把普通 `@文本` 误判成概念/组织。纯文本模糊提取当前仍只覆盖角色/地点/物件。
- **组织当前只进引用链路，不补创建器**：`CharacterGraphView` 已能展示并绑定已建档组织节点，但“组织建档”不在当前 writer 图谱面板 owner 范围内；不要在这里临时发散出第二套组织创建流程。
- **伏笔与未确认候选不进资产总览**：资产总览当前只展示已建档的 `角色 / 地点 / 物件 / 组织 / 概念` 五类资产。`foreshadowing` 虽已出现在实体类型枚举与 Story Harness 内部映射里，但当前没有稳定的统一实体列表 owner；未确认候选继续留在 `CharacterGraphView` 的候选绑定面板，不要在资产总览里临时扩出第六类或 pending 列表。
- **对话上下文提示只保留一处**：`add_to_chat` 注入的片段上下文只允许在 `AIInputArea` 的 prompt 提示条展示；`AISelectionNotice` 只用于 `continue/polish/expand/rewrite` 这类执行态，避免同一条 handoff 在右栏重复提示两次。
- **画布框选坐标按容器内容框与缩放比计算**：`CanvasCore/useCanvasInteraction` 的选区框必须使用容器相对坐标，并按 `getBoundingClientRect()` 与 `clientWidth/clientHeight` 的比例做归一化；平移可继续使用 viewport 坐标，但框选矩形若直接复用 `clientX/clientY`，或忽略宿主缩放比，在工具 overlay、多栏布局或后续外层 `transform: scale(...)` 下会出现框选区域与鼠标实际位置偏移。
- **test=true 兼容**：writer 模块保留 mock/test-mode 工作区入口，新增宿主或工具边界时要同时确认真实 API 路径和 mock 路径都能跑通。
- **文档同步触发条件**：只要修改工作区宿主边界、工具入口策略、快捷键 owner 或 AI handoff 主链，就必须同步本文件和 `docs/plans/v3/implementation/*` 的对应检查点文档。
