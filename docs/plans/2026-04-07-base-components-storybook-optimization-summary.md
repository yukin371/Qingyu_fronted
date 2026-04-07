# 2026-04-07 Base Components Storybook Optimization Summary

## 背景

本轮工作聚焦前端子仓库基础组件的视觉收口与 Storybook 展示优化，目标是：

- 为后续替代 Element 组件打基础
- 将基础组件从“参考示例”提升到“可落地设计系统部件”
- 降低组件视觉上的 AI 感，统一为更克制的 Apple / Google / 设计系统风格
- 确保 Storybook 可作为后续持续优化的稳定验收面板

工作目录：

- `E:\Github\Qingyu\.worktrees\qingyu_fronted-tailwind-v4-optimizer`

## 本次完成

### 1. Avatar

已完成基础 Avatar 的一轮深度优化：

- 优化 fallback 文案生成逻辑
  - 支持中文首字
  - 支持双首字母
  - 支持 `+5` 等群组缩写
- 改善交互状态
  - 支持键盘触发
  - 避免所有实例都被误判为 button
- 优化视觉结构
  - 更稳定的玻璃感外框
  - 更柔和的内层表面和状态点
- 修正 fallback 配色
  - 移除高饱和 neon 渐变
  - 改为低饱和、同色族的柔和 tonal palette

涉及文件：

- `src/design-system/base/Avatar/Avatar.vue`
- `src/design-system/base/Avatar/Avatar.stories.ts`
- `src/design-system/base/Avatar/types.ts`

### 2. Badge

已将 Badge 从简单数字小球优化为更接近设计系统的轻量状态组件：

- 重做 tonal 风格配色
- 区分 pill 与 dot 两类视觉模式
- 优化绝对定位附着态的边缘、ring 和阴影
- 改写 Storybook 展示为真实产品场景
  - default
  - variants
  - sizes
  - dots
  - attached
  - overflow
  - notification rail

涉及文件：

- `src/design-system/base/Badge/Badge.vue`
- `src/design-system/base/Badge/Badge.stories.ts`

### 3. Textarea

已将 Textarea 从基础输入框提升为更完整的表单 surface：

- 新增更成熟的 surface 层次
  - 轻玻璃感边框
  - tonal 状态背景
  - focus ring 与状态联动
- 补齐自适应高度逻辑
  - `rowsMin`
  - `rowsMax`
  - 自动高度同步
- 优化字数统计样式
- 改写 Storybook 场景为更贴近真实工作流的展示
  - default
  - sizes
  - states
  - with character count
  - disabled / readonly
  - adaptive height
  - workspace composer

涉及文件：

- `src/design-system/base/Textarea/Textarea.vue`
- `src/design-system/base/Textarea/Textarea.stories.ts`

### 4. Divider

已完成 Divider 的基础视觉升级：

- 支持更柔和的 solid / dashed / dotted 线型表现
- 增加 label 胶囊化表现
- 改善纵向 divider 的语义与布局
- 增强 Storybook 场景表达
  - editorial cadence
  - section labels
  - vertical split
  - variants

涉及文件：

- `src/design-system/base/Divider/Divider.vue`
- `src/design-system/base/Divider/Divider.stories.ts`

### 5. Empty

已完成 Empty 的基础空状态升级：

- 加入更完整的卡片化 surface
- 优化 icon 容器、间距与文案层次
- 将 Storybook 改成更像真实业务场景的展示
  - default
  - search empty
  - team empty
  - compact panel
- 修正故事中无效图标名导致的 `?` 占位

涉及文件：

- `src/design-system/base/Empty/Empty.vue`
- `src/design-system/base/Empty/Empty.stories.ts`

## Storybook 验证

### 已完成验证

- 本地 Storybook 已重启
- 已检查以下 docs 页面：
  - `Base/Badge`
  - `Base/Textarea`
  - `Base/Empty`
  - `Base/Divider`
- 运行时控制台无 `error` / `warn`
- `npm run build-storybook` 已通过

### 构建结果说明

`build-storybook` 成功通过，但仍有两类非阻塞告警：

- Storybook runtime 中 `eval` 的通用警告
- 若干 chunk size 超过 500 kB 的体积提示

这两项不是本轮组件修改引入的问题，可后续统一处理。

## 本轮设计原则

本轮优化遵循以下原则：

- 避免高饱和、过强渐变、浮夸玻璃感
- 用 subtle / muted / tonal 的方式做视觉区分
- 优先修“基础体验缺口”，而不只是换皮
- Storybook 不再只展示裸组件，要展示真实语境下的使用方式
- 保持 API 稳定，除非已有实现明显失真或 Storybook 表现错误

## 当前已知后续方向

下次可优先继续以下组件：

1. `Skeleton`
2. `Icon`
3. `Image`
4. 继续回看 `Avatar / Badge / Empty / Textarea / Divider` 的细节一致性

建议下轮继续做的事情：

- 统一 base 组件的 spacing scale、圆角等级、边框透明度和阴影强度
- 清理 Storybook 中 remaining 的旧式示例文案和场景
- 继续检查基础组件是否存在“类型已声明但行为未兑现”的 API
- 逐步向 `Qy*` 业务组件回灌这套基础视觉语言

## 备注

本次工作未处理完整仓库的全量类型错误；仓库中仍存在与本任务无关的基线问题。

本次工作重点是：

- 提升基础组件完成度
- 稳定 Storybook 验收面
- 为下一轮基础组件替代与统一打样提供起点
