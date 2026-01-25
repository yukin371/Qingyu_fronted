# Radio 组件开发任务

## 任务背景

正在为 Tailwind UI 设计系统开发 Radio 单选框组件。这是 P2 表单组件的一部分。

## 组件规格

### Radio.vue
单个单选框组件。

**Props:**
- `modelValue`: string | number | boolean - v-model 绑定值
- `value`: string | number | boolean - 值
- `label`: string - 标签文本
- `disabled`: boolean - 禁用状态
- `size`: 'sm' | 'md' | 'lg' - 尺寸
- `button`: boolean - 按钮模式

**Events:**
- `update:modelValue` - 值更新
- `change` - 状态改变

### RadioGroup.vue
单选框组组件。

**Props:**
- `modelValue`: string | number | boolean - v-model 绑定值
- `disabled`: boolean - 全局禁用
- `size`: 'sm' | 'md' | 'lg' - 统一尺寸
- `vertical`: boolean - 垂直排列
- `button`: boolean - 按钮模式

## 参考组件

参考 Button 组件的开发模式：
- 使用 CVA 定义变体
- 使用 cn 工具函数合并类名
- 完整的类型定义
- Storybook 故事文件
- README 文档

## 文件路径

- `src/design-system/form/Radio/Radio.vue`
- `src/design-system/form/Radio/RadioGroup.vue`
- `src/design-system/form/Radio/types.ts`
- `src/design-system/form/Radio/Radio.stories.ts`
- `src/design-system/form/Radio/README.md`
- `src/design-system/form/Radio/index.ts`
- `src/design-system/form/index.ts`
- `tests/unit/design-system/form/Radio.test.ts`
