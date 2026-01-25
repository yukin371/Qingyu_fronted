# Collapse 折叠面板组件任务背景

## 任务目标
为 Tailwind UI 设计系统创建 Collapse 折叠面板组件。

## 组件规格

### Collapse.vue
折叠面板容器组件。

**Props:**
- `modelValue`: string[] - v-model 绑定值（激活的面板）
- `accordion`: boolean - 手风琴模式（只能展开一个）

**Events:**
- `update:modelValue` - 值更新
- `change` - 面板展开/收起

**Slots:**
- `default` - CollapseItem 内容

### CollapseItem.vue
折叠面板项组件。

**Props:**
- `name`: string | number - 面板标识
- `title`: string - 标题
- `disabled`: boolean - 禁用状态

**Slots:**
- `title` - 自定义标题
- `default` - 面板内容
- `arrow` - 自定义箭头图标

## 技术要求

1. 组件文件: `src/design-system/data/Collapse/Collapse.vue`, `CollapseItem.vue`
2. 类型定义: `src/design-system/data/Collapse/types.ts`
3. Storybook: `src/design-system/data/Collapse/Collapse.stories.ts`
4. 单元测试: `tests/unit/design-system/data/Collapse.test.ts`
5. README 文档: `src/design-system/data/Collapse/README.md`
6. 导出文件: `src/design-system/data/Collapse/index.ts`
7. 更新主导出: `src/design-system/data/index.ts`

## 开发规范
- 使用 Icon 组件显示箭头
- 参考 Divider 组件等现有组件的开发模式
- 遵循 Tailwind CSS 设计系统
- 支持 v-model 双向绑定
