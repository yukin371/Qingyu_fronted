# 工具面板统一

**日期**: 2026-03-29
**状态**: 已完成

## 目标

将分散的写作辅助工具整合为统一的工具面板，通过快捷键快速访问。

## 架构

```
┌─────────────────────────────────────────────────────────┐
│  WorkspaceToolOverlay (全屏工具面板)                    │
├────────┬────────────────────────────────────────────────┤
│ ToolSidebar │              工具内容区                    │
│ [关系图谱] │  CharacterGraphView / TimelineOutlineView │
│ [时间线]   │  StoryBranchView / StructureStageView     │
│ [故事分支] │                                                │
│ [结构舞台] │                                                │
└────────┴────────────────────────────────────────────────┘
```

## 核心组件

| 组件 | 文件 | 职责 |
|------|------|------|
| `useToolOverlay` | `composables/useToolOverlay.ts` | 状态管理、键盘事件处理 |
| `WorkspaceToolOverlay` | `components/workspace/WorkspaceToolOverlay.vue` | 容器组件 |
| `ToolSidebar` | `components/workspace/tool-overlay/ToolSidebar.vue` | 侧边栏切换器 |

## 快捷键

| 快捷键 | 功能 | 配置 ID |
|--------|------|---------|
| `Ctrl+G` | 打开/关闭工具面板 | `tool.open` |
| `Ctrl+1` | 切换到关系图谱 | `tool.switchRelations` |
| `Ctrl+2` | 切换到时间线 | `tool.switchTimeline` |
| `Ctrl+3` | 切换到故事分支 | `tool.switchBranches` |
| `Ctrl+4` | 切换到结构舞台 | `tool.switchStructure` |
| `Esc` | 关闭工具面板 | - |

快捷键可通过 `useShortcutConfig` 自定义。

## 状态管理

`useToolOverlay` 使用单例模式，自动持久化上次使用的工具到 localStorage：

```typescript
// 关键 API
toolOverlay.open()           // 打开（上次使用的工具）
toolOverlay.open('relations') // 打开指定工具
toolOverlay.close()          // 关闭
toolOverlay.toggle()          // 切换
toolOverlay.switchTool('timeline') // 切换工具
toolOverlay.handleKeyboardEvent(event) // 处理键盘事件
```

## 文件变更

### 新增
- `composables/useToolOverlay.ts`
- `components/workspace/tool-overlay/ToolSidebar.vue`
- `components/workspace/WorkspaceToolOverlay.vue`
- `docs/tool-overlay-unification.md`

### 废弃
- `components/workspace/WorkspaceFullscreenOverlay.vue.deprecated`

### 修改
- `components/workspace/WorkspaceEditorContent.vue` - 集成工具面板
- `components/editor/TipTapEditor.vue` - Ctrl+G 改为 emit 事件
- `components/editor/EditorPanel.vue` - 移除图谱按钮
- `composables/useShortcutConfig.ts` - 添加工具快捷键分类

## 实施记录

| 提交 | 说明 |
|------|------|
| `d1a528b9` | 暂存编辑器状态 |
| `dafb93bc` | Phase 1-2: 新增 WorkspaceToolOverlay |
| `c848b6b1` | Phase 3: 快捷键配置 |
| `473aa3b9` | Phase 4: 废弃旧组件 |

## 待清理

- [ ] TipTapEditor 中的 QyGraphOverlay 相关代码
- [ ] CharacterGraph.vue 废弃（QyGraphOverlay 仍有引用）
