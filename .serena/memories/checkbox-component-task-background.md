# Checkbox 复选框组件开发任务背景

## 任务概述
为 Tailwind UI 设计系统创建 Checkbox 复选框组件，包括单个复选框和复选框组。

## 项目路径
- 主项目: E:\Github\Qingyu\Qingyu_fronted
- 组件路径: src/design-system/base/Checkbox

## 参考组件模式
参考 Button 组件的开发模式:
- 使用 CVA (class-variance-authority) 管理变体样式
- 使用 cn 工具函数合并类名
- 类型定义在 types.ts
- Storybook 故事在 .stories.ts
- 单元测试在 tests/unit/design-system/base/Checkbox.test.ts
- README.md 文档说明使用方法

## 组件规格

### Checkbox.vue
**Props:**
- modelValue: boolean | string[] - v-model 绑定值
- value: string | number | boolean - 值
- label: string - 标签文本
- disabled: boolean - 禁用状态
- indeterminate: boolean - 半选状态
- size: 'sm' | 'md' | 'lg' - 尺寸
- color: 'primary' | 'success' | 'warning' | 'danger' - 颜色

**Events:**
- update:modelValue - 值更新
- change - 状态改变

### CheckboxGroup.vue
**Props:**
- modelValue: string[] - v-model 绑定值数组
- disabled: boolean - 全局禁用
- size: 'sm' | 'md' | 'lg' - 统一尺寸
- vertical: boolean - 垂直排列

## 技术栈
- Vue 3 Composition API
- TypeScript
- Tailwind CSS
- CVA (class-variance-authority)
- Vitest (单元测试)
- Storybook (文档展示)
