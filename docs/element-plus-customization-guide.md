# Element Plus 深度定制方案

> Qingyu Fronted Element Plus 样式系统深度定制指南
>
> 基于 Tailwind CSS v4.1.18 的 Element Plus 组件样式全覆盖方案

---

## 目录

- [项目现状分析](#项目现状分析)
- [全局覆盖策略](#全局覆盖策略)
- [组件级定制](#组件级定制)
- [Tailwind v4 兼容性](#tailwind-v4-兼容性)
- [实施指南](#实施指南)
- [最佳实践](#最佳实践)

---

## 项目现状分析

### 当前技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Tailwind CSS | v4.1.18 | 使用 Vite 插件，支持 `@theme` 指令 |
| Element Plus | v2.11.5 | 按需导入组件 + 独立样式 |
| Vue | v3.5.22 | Composition API + `<script setup>` |
| SCSS | sass-embedded v1.93.2 | 用于复杂的样式预处理 |

### 设计系统现状

项目已建立完善的设计令牌系统：

- **颜色系统** (`/src/design-system/tokens/colors.ts`)
  - 主色系：qingyu（青蓝）、berry（紫粉）、forest（森林绿）
  - 功能色：success、warning、danger、info
  - 中性色：slate（50-950）

- **主题系统** (`/src/design-system/tokens/theme.ts`)
  - 支持运行时主题切换
  - CSS 变量动态注入
  - localStorage 持久化

- **间距系统** (`/src/design-system/tokens/spacing.ts`)
  - 基于 4px 栅格
  - 语义化命名

- **字体系统** (`/src/design-system/tokens/typography.ts`)
  - 字号层级：xs(12px) → xxl(32px)
  - 字重：light(300) → heavy(800)

### Element Plus 使用情况

根据阅读器模块统计：

| 组件 | 使用次数 | 优先级 |
|------|---------|--------|
| el-button | 153 | P0 |
| el-icon | 32 | P0 |
| el-radio/group | 25 | P0 |
| el-option | 20 | P1 |
| el-form-item | 18 | P1 |
| el-input | 15 | P1 |
| el-slider | 12 | P1 |
| el-drawer | 10 | P1 |
| 其他 | ~483 | P2 |

---

## 全局覆盖策略

### 1. CSS 变量映射方案

#### 1.1 创建 Element Plus CSS 变量映射表

在 `src/design-system/tokens/element-plus.ts` 中定义：

```typescript
/**
 * Element Plus CSS 变量映射
 * 将 Element Plus 的 CSS 变量映射到 Qingyu 设计令牌
 */

import { qingyuTheme, berryTheme, forestTheme, type ThemeColors } from './theme'

/**
 * 生成 Element Plus 颜色变量映射
 */
function generateElementPlusColorVars(theme: ThemeColors) {
  return {
    // 品牌色
    '--el-color-primary': theme.primary[500],
    '--el-color-primary-light-3': theme.primary[400],
    '--el-color-primary-light-5': theme.primary[300],
    '--el-color-primary-light-7': theme.primary[200],
    '--el-color-primary-light-8': theme.primary[100],
    '--el-color-primary-light-9': theme.primary[50],
    '--el-color-primary-dark-2': theme.primary[600],

    // 成功色
    '--el-color-success': theme.success[500],
    '--el-color-success-light-3': theme.success[400],
    '--el-color-success-light-5': theme.success[300],
    '--el-color-success-light-7': theme.success[200],
    '--el-color-success-light-8': theme.success[100],
    '--el-color-success-light-9': theme.success[50],
    '--el-color-success-dark-2': theme.success[600],

    // 警告色
    '--el-color-warning': theme.warning[500],
    '--el-color-warning-light-3': theme.warning[400],
    '--el-color-warning-light-5': theme.warning[300],
    '--el-color-warning-light-7': theme.warning[200],
    '--el-color-warning-light-8': theme.warning[100],
    '--el-color-warning-light-9': theme.warning[50],
    '--el-color-warning-dark-2': theme.warning[600],

    // 危险色
    '--el-color-danger': theme.danger[500],
    '--el-color-danger-light-3': theme.danger[400],
    '--el-color-danger-light-5': theme.danger[300],
    '--el-color-danger-light-7': theme.danger[200],
    '--el-color-danger-light-8': theme.danger[100],
    '--el-color-danger-light-9': theme.danger[50],
    '--el-color-danger-dark-2': theme.danger[600],

    // 信息色
    '--el-color-info': theme.info[500],
    '--el-color-info-light-3': theme.info[400],
    '--el-color-info-light-5': theme.info[300],
    '--el-color-info-light-7': theme.info[200],
    '--el-color-info-light-8': theme.info[100],
    '--el-color-info-light-9': theme.info[50],
    '--el-color-info-dark-2': theme.info[600],

    // 文本色
    '--el-text-color-primary': 'var(--text-main)',
    '--el-text-color-regular': 'var(--text-regular)',
    '--el-text-color-secondary': 'var(--text-secondary)',
    '--el-text-color-placeholder': 'var(--text-placeholder)',

    // 边框色
    '--el-border-color': 'var(--border-color)',
    '--el-border-color-light': 'rgba(0, 0, 0, 0.06)',
    '--el-border-color-lighter': 'rgba(0, 0, 0, 0.04)',
    '--el-border-color-extra-light': 'rgba(0, 0, 0, 0.02)',
    '--el-border-color-dark': 'rgba(0, 0, 0, 0.1)',
    '--el-border-color-darker': 'rgba(0, 0, 0, 0.15)',

    // 填充色
    '--el-fill-color': 'var(--bg-page)',
    '--el-fill-color-light': '#f5f7fa',
    '--el-fill-color-lighter': '#fafbfc',
    '--el-fill-color-extra-light': '#fafcff',
    '--el-fill-color-dark': '#ebedf0',
    '--el-fill-color-darker': '#e6e8eb',

    // 背景色
    '--el-bg-color': 'var(--bg-card)',
    '--el-bg-color-page': 'var(--bg-page)',

    // 圆角
    '--el-border-radius-base': 'var(--border-radius-md)',
    '--el-border-radius-small': '8px',
    '--el-border-radius-round': '100%',
    '--el-border-radius-circle': '50%',

    // 字体
    '--el-font-size-base': '14px',
    '--el-font-size-small': '13px',
    '--el-font-size-large': '16px',
    '--el-font-size-extra-large': '20px',

    // 阴影
    '--el-box-shadow': 'var(--shadow-soft)',
    '--el-box-shadow-light': '0 0 12px rgba(0, 0, 0, 0.12)',
    '--el-box-shadow-lighter': '0 0 8px rgba(0, 0, 0, 0.08)',
    '--el-box-shadow-dark': '0 0 16px rgba(0, 0, 0, 0.18)',

    // 禁用状态
    '--el-disabled-bg-color': 'var(--bg-page)',
    '--el-disabled-text-color': 'var(--text-placeholder)',
    '--el-disabled-border-color': 'var(--border-color)',

    // 覆盖层
    '--el-overlay-color': 'rgba(0, 0, 0, 0.5)',
    '--el-overlay-color-light': 'rgba(0, 0, 0, 0.3)',
    '--el-overlay-color-lighter': 'rgba(0, 0, 0, 0.1)',

    // 遮罩
    '--el-mask-color': 'rgba(255, 255, 255, 0.9)',
  } as const
}

/**
 * 应用 Element Plus 主题变量
 */
export function applyElementPlusTheme(theme: ThemeColors = qingyuTheme): void {
  const root = document.documentElement
  const vars = generateElementPlusColorVars(theme)

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}

/**
 * 导出主题预设
 */
export const elementPlusThemePresets = {
  qingyu: generateElementPlusColorVars(qingyuTheme),
  berry: generateElementPlusColorVars(berryTheme),
  forest: generateElementPlusColorVars(forestTheme),
}
```

#### 1.2 在主题切换时同步 Element Plus 变量

修改 `src/design-system/tokens/theme.ts` 中的 `updateCSSVariables` 函数：

```typescript
import { applyElementPlusTheme } from './element-plus'

function updateCSSVariables(theme: ThemeColors): void {
  // ... 现有代码 ...

  // 同步更新 Element Plus 变量
  applyElementPlusTheme(theme)
}
```

### 2. Tailwind v4 CSS 变量覆盖策略

#### 2.1 使用 `@theme` 指令定义 Element Plus 令牌

在 `src/design-system/tokens/tailwind.ts` 中扩展：

```typescript
import { qingyuTheme } from './theme'

export const elementPlusTokens = {
  // Element Plus 品牌色别名
  ep: {
    primary: qingyuTheme.primary[500],
    'primary-light': qingyuTheme.primary[400],
    'primary-dark': qingyuTheme.primary[600],
    success: qingyuTheme.success[500],
    warning: qingyuTheme.warning[500],
    danger: qingyuTheme.danger[500],
    info: qingyuTheme.info[500],
  }
}

export const tailwindThemeExtension = {
  // ... 现有扩展 ...
  colors: {
    // ... 现有颜色 ...
    ep: elementPlusTokens.ep,
  }
}
```

#### 2.2 在 CSS 中使用 @theme 指令

创建 `src/styles/element-plus.css`：

```css
@import "tailwindcss";

@theme {
  /* Element Plus 颜色令牌 - 映射到 Qingyu 设计系统 */
  --color-el-primary: var(--color-primary-500);
  --color-el-primary-light: var(--color-primary-400);
  --color-el-primary-dark: var(--color-primary-600);

  --color-el-success: var(--color-success-500);
  --color-el-warning: var(--color-warning-500);
  --color-el-danger: var(--color-danger-500);
  --color-el-info: var(--color-info-500);

  /* Element Plus 间距令牌 */
  --spacing-el-xs: 8px;
  --spacing-el-sm: 12px;
  --spacing-el-md: 16px;
  --spacing-el-lg: 20px;
  --spacing-el-xl: 24px;

  /* Element Plus 圆角令牌 */
  --radius-el-base: var(--radius-lg);
  --radius-el-small: 8px;
  --radius-el-large: 20px;

  /* Element Plus 阴影令牌 */
  --shadow-el-base: var(--shadow-glow);
  --shadow-el-light: var(--shadow-soft);
  --shadow-el-dark: var(--shadow-depth);
}

/* 全局 Element Plus 样式覆盖 */
:root {
  /* 应用 Element Plus 变量 */
  @apply ep-colors;
  @apply ep-spacing;
  @apply ep-radius;
  @apply ep-shadows;
}
```

### 3. 全局样式覆盖文件组织

```
src/styles/
├── element-plus/           # Element Plus 定制样式
│   ├── index.css          # 主入口（@import 所有子文件）
│   ├── variables.css      # CSS 变量定义
│   ├── overrides.css      # 全局覆盖样式
│   ├── components/        # 组件级覆盖
│   │   ├── button.css
│   │   ├── input.css
│   │   ├── slider.css
│   │   ├── drawer.css
│   │   └── ...
│   └── utilities.css      # Element Plus 工具类
```

在 `main.ts` 中的引入顺序：

```typescript
// 主题系统 - 必须在样式之前初始化
import { initTheme } from '@/design-system/tokens/theme'
initTheme()

// 全局样式引入顺序（严格）
import './style.css'                    // Tailwind CSS - MUST be first
import './styles/element-plus/index.css' // Element Plus 定制 - second
import '@/styles/variables.scss'
import '@/styles/reader-variables.scss'
import '@/design-system/themes/vscode-dark.scss'
import '@/styles/common.scss'
```

---

## 组件级定制

### 高频组件定制方案

### 1. Button（按钮）

#### 1.1 基础样式覆盖

`src/styles/element-plus/components/button.css`：

```css
/* ============================================
   Element Plus Button 定制
   ============================================ */

/* 基础按钮重置 */
.el-button {
  @apply font-medium transition-all duration-200 ease-out;
  @apply rounded-[var(--border-radius-md)];
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;

  /* 品牌色按钮 */
  &--primary {
    @apply bg-[var(--color-primary-500)] text-white;
    @apply hover:bg-[var(--color-primary-600)];
    @apply active:bg-[var(--color-primary-700)];
    @apply focus:ring-[var(--color-primary-500)];

    /* 发光效果 */
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.25);

    &:hover {
      box-shadow: 0 6px 16px rgba(6, 182, 212, 0.35);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* 次要按钮 */
  &--default {
    @apply bg-white text-[var(--text-main)];
    @apply border border-[var(--border-color)];
    @apply hover:bg-[var(--bg-page)] hover:border-[var(--color-primary-500)];
    @apply active:bg-[var(--color-primary-50)];
  }

  /* 成功按钮 */
  &--success {
    @apply bg-[var(--color-success-500)] text-white;
    @apply hover:bg-[var(--color-success-600)];
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  }

  /* 警告按钮 */
  &--warning {
    @apply bg-[var(--color-warning-500)] text-white;
    @apply hover:bg-[var(--color-warning-600)];
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
  }

  /* 危险按钮 */
  &--danger {
    @apply bg-[var(--color-danger-500)] text-white;
    @apply hover:bg-[var(--color-danger-600)];
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  }

  /* 文字按钮 */
  &--text {
    @apply bg-transparent text-[var(--color-primary-500)];
    @apply hover:bg-[var(--color-primary-50)];
    @apply active:bg-[var(--color-primary-100)];
    @apply border-none shadow-none;

    &:focus {
      @apply bg-[var(--color-primary-100)];
    }
  }

  /* 尺寸变体 */
  &--large {
    @apply h-11 px-6 text-base;
  }

  &--default {
    @apply h-9 px-4 text-sm;
  }

  &--small {
    @apply h-7 px-3 text-xs;
  }
}

/* 圆形按钮 */
.el-button.is-circle {
  @apply rounded-full p-0;
}

/* 按钮组 */
.el-button-group {
  @apply inline-flex;

  .el-button {
    @apply rounded-none;

    &:first-child {
      @apply rounded-l-[var(--border-radius-md)];
    }

    &:last-child {
      @apply rounded-r-[var(--border-radius-md)];
    }

    &:not(:first-child):not(:last-child) {
      @apply -ml-px;
    }
  }
}

/* 加载状态 */
.el-button.is-loading {
  @apply relative pointer-events-none opacity-75;

  &::before {
    @apply absolute inset-0 content-[''];
    background: inherit;
    border-radius: inherit;
  }
}

/* 禁用状态 */
.el-button.is-disabled {
  @apply opacity-50 cursor-not-allowed;
  @apply shadow-none transform-none;
}
```

#### 1.2 Vue 组件封装

创建 `src/design-system/base/QyButton.vue`：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { ElButton, ElButtonProps } from 'element-plus'
import { cn } from '@/design-system/utils/cn'

interface Props extends ElButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const buttonClass = computed(() => {
  return cn(
    // 基础类
    'font-medium transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'active:scale-95',

    // 变体
    {
      'bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white shadow-glow hover:shadow-glow-strong': props.variant === 'gradient',
      'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)]': props.variant === 'primary',
      'bg-white text-[var(--text-main)] border border-[var(--border-color)] hover:bg-[var(--bg-page)]': props.variant === 'secondary',
      'bg-transparent text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]': props.variant === 'ghost',
    },

    // 尺寸
    {
      'h-7 px-2 text-xs': props.size === 'xs',
      'h-8 px-3 text-sm': props.size === 'sm',
      'h-9 px-4 text-sm': props.size === 'md',
      'h-11 px-6 text-base': props.size === 'lg',
    }
  )
})
</script>

<template>
  <ElButton
    :class="buttonClass"
    v-bind="$attrs"
  >
    <slot />
  </ElButton>
</template>
```

### 2. Input（输入框）

`src/styles/element-plus/components/input.css`：

```css
/* ============================================
   Element Plus Input 定制
   ============================================ */

.el-input {
  @apply relative;

  /* 输入框容器 */
  &__wrapper {
    @apply relative flex items-center w-full;
    @apply bg-white border border-[var(--border-color)];
    @apply rounded-[var(--border-radius-md)];
    @apply transition-all duration-200 ease-out;
    @apply shadow-sm;

    &:hover {
      @apply border-[var(--color-primary-400)];
    }

    &.is-focus {
      @apply border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-100)];
    }

    &.is-disabled {
      @apply bg-[var(--bg-page)] cursor-not-allowed opacity-60;
    }
  }

  /* 输入框本体 */
  &__inner {
    @apply w-full h-full px-3 py-2;
    @apply text-sm text-[var(--text-main)];
    @apply bg-transparent border-none outline-none;
    @apply placeholder:text-[var(--text-placeholder)];

    &::placeholder {
      @apply text-[var(--text-placeholder)];
    }
  }

  /* 前缀/后缀 */
  &__prefix,
  &__suffix {
    @apply flex items-center justify-center;
    @apply text-[var(--text-secondary)] pointer-events-none;
  }

  &__prefix {
    @apply mr-2;
  }

  &__suffix {
    @apply ml-2;
  }

  /* 清空按钮 */
  &__clear {
    @apply cursor-pointer text-[var(--text-secondary)];
    @apply hover:text-[var(--text-main)];
    @apply transition-colors duration-150;
  }

  /* 字数统计 */
  &__count {
    @apply text-xs text-[var(--text-placeholder)];
    @apply absolute right-3 bottom-1;
  }

  /* 验证状态 */
  &.is-error &__wrapper {
    @apply border-[var(--color-danger-500)] ring-2 ring-[var(--color-danger-100)];
  }

  &.is-success &__wrapper {
    @apply border-[var(--color-success-500)] ring-2 ring-[var(--color-success-100)];
  }

  /* 尺寸变体 */
  &--large &__wrapper {
    @apply h-11 px-4 text-base;
  }

  &--default &__wrapper {
    @apply h-9 px-3 text-sm;
  }

  &--small &__wrapper {
    @apply h-7 px-2 text-xs;
  }
}

/* Textarea */
.el-textarea {
  @apply relative;

  &__inner {
    @apply w-full min-h-[80px] px-3 py-2;
    @apply text-sm text-[var(--text-main)];
    @apply bg-white border border-[var(--border-color)];
    @apply rounded-[var(--border-radius-md)];
    @apply transition-all duration-200 ease-out;
    @apply shadow-sm resize-y;

    &:hover {
      @apply border-[var(--color-primary-400)];
    }

    &:focus {
      @apply border-[var(--color-primary-500)] ring-2 ring-[var(--color-primary-100)];
      @apply outline-none;
    }

    &::placeholder {
      @apply text-[var(--text-placeholder)];
    }
  }
}
```

### 3. Slider（滑块）

`src/styles/element-plus/components/slider.css`：

```css
/* ============================================
   Element Plus Slider 定制
   ============================================ */

.el-slider {
  @apply relative w-full;

  /* 轨道 */
  &__runway {
    @apply relative w-full h-1;
    @apply bg-[var(--bg-page)] rounded-full;
    @apply border border-[var(--border-color)];
  }

  /* 填充条 */
  &__bar {
    @apply absolute h-full rounded-full;
    @apply bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)];
  }

  /* 滑块按钮 */
  &__button-wrapper {
    @apply absolute top-1/2 -translate-y-1/2;
    @apply w-6 h-6 flex items-center justify-center;
    @apply cursor-pointer;
    @apply z-10;
  }

  &__button {
    @apply w-full h-full;
    @apply bg-white rounded-full;
    @apply border-2 border-[var(--color-primary-500)];
    @apply shadow-[0_2px_8px_rgba(6,182,212,0.3)];
    @apply transition-all duration-200 ease-out;

    &:hover {
      @apply scale-110 shadow-[0_4px_12px_rgba(6,182,212,0.4)];
    }

    &:active {
      @apply scale-95;
    }
  }

  /* 刻度标记 */
  &__stop {
    @apply absolute top-1/2 -translate-y-1/2;
    @apply w-1 h-1 bg-[var(--border-color)] rounded-full;
  }

  /* 标签 */
  &__marks-text {
    @apply absolute text-xs text-[var(--text-secondary)];
    @apply -translate-x-1/2 top-4;
  }

  /* 工具提示 */
  &__tooltip {
    @apply px-2 py-1 text-xs text-white;
    @apply bg-[var(--color-primary-500)] rounded;
    @apply whitespace-nowrap;
  }

  /* 垂直模式 */
  &.is-vertical {
    @apply h-full w-auto;

    .el-slider__runway {
      @apply w-1 h-full;
    }

    .el-slider__button-wrapper {
      @apply left-1/2 -translate-x-1/2 top-auto;
    }
  }

  /* 禁用状态 */
  &.is-disabled {
    @apply opacity-50 cursor-not-allowed;

    .el-slider__button {
      @apply cursor-not-allowed;
    }
  }
}
```

### 4. Drawer（抽屉）

`src/styles/element-plus/components/drawer.css`：

```css
/* ============================================
   Element Plus Drawer 定制
   ============================================ */

.el-drawer {
  /* 遮罩层 */
  &__overlay {
    @apply fixed inset-0 bg-black/50;
    @apply backdrop-blur-sm;
    @apply transition-opacity duration-300 ease-out;
  }

  /* 抽屉容器 */
  &__container {
    @apply fixed inset-0 pointer-events-none;
  }

  /* 抽屉本体 */
  &__body {
    @apply absolute bg-white shadow-depth;
    @apply transition-transform duration-300 ease-out;
    @apply pointer-events-auto;

    /* 右侧抽屉 */
    &.rtl {
      @apply right-0 top-0 bottom-0;
      @apply border-l border-[var(--border-color)];
      @apply rounded-l-2xl;
    }

    /* 左侧抽屉 */
    &.ltr {
      @apply left-0 top-0 bottom-0;
      @apply border-r border-[var(--border-color)];
      @apply rounded-r-2xl;
    }

    /* 顶部抽屉 */
    &.ttb {
      @apply top-0 left-0 right-0;
      @apply border-b border-[var(--border-color)];
      @apply rounded-b-2xl;
    }

    /* 底部抽屉 */
    &.btt {
      @apply bottom-0 left-0 right-0;
      @apply border-t border-[var(--border-color)];
      @apply rounded-t-2xl;
    }
  }

  /* 头部 */
  &__header {
    @apply flex items-center justify-between;
    @apply px-6 py-4 border-b border-[var(--border-color)];
    @apply bg-white;

    &-title {
      @apply text-base font-semibold text-[var(--text-main)];
    }
  }

  /* 关闭按钮 */
  &__close-btn {
    @apply p-1 rounded-md;
    @apply text-[var(--text-secondary)];
    @apply hover:bg-[var(--bg-page)] hover:text-[var(--text-main)];
    @apply transition-all duration-200;
    @apply cursor-pointer;
  }

  /* 内容区 */
  &__body {
    @apply p-6 overflow-y-auto;
    @apply text-sm text-[var(--text-regular)];
    max-height: calc(100vh - 120px);

    /* 自定义滚动条 */
    @apply scrollbar-custom;
  }

  /* 底部 */
  &__footer {
    @apply px-6 py-4 border-t border-[var(--border-color)];
    @apply bg-white flex justify-end gap-2;
  }

  /* 尺寸变体 */
  &.is-fullscreen {
    .el-drawer__body {
      @apply w-screen h-screen;
      @apply rounded-none border-none;
    }
  }

  /* 动画进入/离开 */
  &.fade-enter-active,
  &.fade-leave-active {
    @apply transition-opacity duration-300;
  }

  &.fade-enter-from,
  &.fade-leave-to {
    @apply opacity-0;
  }

  /* RTL 动画 */
  &.rtl-enter-active,
  &.rtl-leave-active {
    @apply transition-transform duration-300;
  }

  &.rtl-enter-from,
  &.rtl-leave-to {
    @apply translate-x-full;
  }

  /* LTR 动画 */
  &.ltr-enter-active,
  &.ltr-leave-active {
    @apply transition-transform duration-300;
  }

  &.ltr-enter-from,
  &.ltr-leave-to {
    @apply -translate-x-full;
  }
}
```

### 5. Radio/Checkbox（单选/复选）

`src/styles/element-plus/components/radio.css`：

```css
/* ============================================
   Element Plus Radio 定制
   ============================================ */

.el-radio {
  @apply relative inline-flex items-center cursor-pointer;
  @apply text-sm text-[var(--text-regular)];

  /* 隐藏原生 input */
  &__input {
    @apply sr-only;
  }

  /* 自定义单选按钮 */
  &__input.is-checked + &__inner {
    @apply border-[var(--color-primary-500)];
    @apply bg-[var(--color-primary-500)];

    &::after {
      @apply scale-100;
    }
  }

  /* 单选按钮外观 */
  &__inner {
    @apply relative w-4 h-4 mr-2;
    @apply border-2 border-[var(--border-color)];
    @apply rounded-full bg-white;
    @apply transition-all duration-200 ease-out;

    &::after {
      @apply absolute top-1/2 left-1/2;
      @apply w-2 h-2 bg-white rounded-full;
      @apply -translate-x-1/2 -translate-y-1/2;
      @apply scale-0 transition-transform duration-200;
      content: '';
    }
  }

  /* 悬停状态 */
  &:hover &__inner {
    @apply border-[var(--color-primary-400)];
  }

  /* 禁用状态 */
  &.is-disabled {
    @apply cursor-not-allowed opacity-50;
  }

  /* 标签文字 */
  &__label {
    @apply select-none;
  }
}

/* Radio Group */
.el-radio-group {
  @apply inline-flex flex-wrap gap-2;

  /* 按钮式单选组 */
  &.is-button {
    @apply border border-[var(--border-color)] rounded-lg overflow-hidden;

    .el-radio-button {
      @apply border-0;

      &__inner {
        @apply px-4 py-2 text-sm;
        @apply border-r border-[var(--border-color)];
        @apply bg-white hover:bg-[var(--bg-page)];
        @apply transition-colors duration-200;
      }

      &.is-active &__inner {
        @apply bg-[var(--color-primary-500)] text-white;
      }
    }
  }
}
```

### 6. Select（选择器）

`src/styles/element-plus/components/select.css`：

```css
/* ============================================
   Element Plus Select 定制
   ============================================ */

.el-select {
  @apply relative inline-block w-full;

  /* 选择器容器（复用 Input 样式） */
  .el-input__wrapper {
    @apply cursor-pointer;
  }

  /* 下拉箭头 */
  .el-select__caret {
    @apply transition-transform duration-200;
    @apply text-[var(--text-secondary)];
  }

  .el-select__caret.is-reverse {
    @apply rotate-180;
  }

  /* 多选标签 */
  .el-tag {
    @apply bg-[var(--color-primary-100)] text-[var(--color-primary-600)];
    @apply text-xs px-2 py-0.5 rounded;
    @apply mr-1;
  }

  /* 清空按钮 */
  .el-input__clear {
    @apply text-[var(--text-secondary)];
    @apply hover:text-[var(--text-main)];
  }
}

/* 下拉面板 */
.el-select-dropdown {
  @apply bg-white rounded-lg shadow-depth border border-[var(--border-color)];
  @apply py-1 min-w-[120px];
  @apply z-[2000];
}

/* 选项 */
.el-option {
  @apply px-3 py-2 text-sm;
  @apply text-[var(--text-regular)];
  @apply cursor-pointer transition-colors duration-150;

  &:hover {
    @apply bg-[var(--bg-page)];
  }

  &.is-selected {
    @apply bg-[var(--color-primary-50)] text-[var(--color-primary-600)];
    @apply font-medium;
  }

  &.is-disabled {
    @apply text-[var(--text-placeholder)] cursor-not-allowed;
  }

  /* 分组标题 */
  &__group {
    @apply px-3 py-1 text-xs font-semibold;
    @apply text-[var(--text-secondary)];
    @apply bg-[var(--bg-page)];
  }

  /* 分组分隔线 */
  &__group + .el-option {
    @apply mt-1;
  }
}

/* 空状态 */
.el-select-dropdown__empty {
  @apply px-3 py-4 text-sm text-center;
  @apply text-[var(--text-secondary)];
}
```

---

## Tailwind v4 兼容性

### 1. 使用 `@theme` 指令定义设计令牌

Tailwind CSS v4 引入了新的 `@theme` 指令，可以在 CSS 中直接定义设计令牌：

```css
@import "tailwindcss";

@theme {
  /* 颜色令牌 */
  --color-primary-50: #ecfeff;
  --color-primary-100: #cffafe;
  --color-primary-200: #a5f3fc;
  --color-primary-300: #67e8f9;
  --color-primary-400: #22d3ee;
  --color-primary-500: #06b6d4;
  --color-primary-600: #0891b2;
  --color-primary-700: #0e7490;
  --color-primary-800: #155e75;
  --color-primary-900: #164e63;

  /* Element Plus 别名 */
  --color-el-primary: var(--color-primary-500);
  --color-el-primary-hover: var(--color-primary-400);
  --color-el-primary-active: var(--color-primary-600);

  /* 间距令牌 */
  --spacing-el-xs: 8px;
  --spacing-el-sm: 12px;
  --spacing-el-md: 16px;
  --spacing-el-lg: 24px;
  --spacing-el-xl: 32px;

  /* 圆角令牌 */
  --radius-el-base: 12px;
  --radius-el-small: 8px;
  --radius-el-large: 16px;
  --radius-el-xl: 24px;

  /* 阴影令牌 */
  --shadow-el-soft: 0 4px 20px rgba(0, 0, 0, 0.05);
  --shadow-el-hover: 0 10px 30px rgba(0, 0, 0, 0.1);
  --shadow-el-glow: 0 4px 15px rgba(6, 182, 212, 0.3);
}
```

### 2. 使用 `@utility` 指令创建工具类

```css
@utility el-button-base {
  font-weight: 500;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: var(--radius-el-base);
  outline: none;
}

@utility el-button-primary {
  background-color: var(--color-el-primary);
  color: white;
  box-shadow: var(--shadow-el-glow);

  &:hover {
    background-color: var(--color-el-primary-hover);
    box-shadow: 0 6px 16px rgba(6, 182, 212, 0.35);
    transform: translateY(-1px);
  }
}

@utility el-button-secondary {
  background-color: white;
  color: var(--text-main);
  border: 1px solid var(--border-color);

  &:hover {
    background-color: var(--bg-page);
    border-color: var(--color-el-primary);
  }
}
```

### 3. CSS 变量动态绑定

Tailwind v4 完全支持 CSS 变量动态绑定：

```css
/* 在组件中使用动态 CSS 变量 */
.el-button--primary {
  background-color: var(--color-primary-500);
  color: white;
}

/* Tailwind 类中使用 CSS 变量 */
.bg-primary-dynamic {
  background-color: var(--color-primary-500);
}

/* 支持默认值 */
.bg-primary-fallback {
  background-color: var(--color-primary-500, #06b6d4);
}
```

### 4. 响应式变体

```css
@utility el-responsive {
  @mobile {
    padding: var(--spacing-el-sm);
  }

  @tablet {
    padding: var(--spacing-el-md);
  }

  @desktop {
    padding: var(--spacing-el-lg);
  }
}
```

### 5. 深色模式支持

```css
@theme {
  --color-el-bg-light: #ffffff;
  --color-el-bg-dark: #1e293b;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-el-bg: var(--color-el-bg-dark);
  }
}

/* 或使用类名 */
.dark {
  @theme {
    --color-el-bg: var(--color-el-bg-dark);
  }
}
```

---

## 实施指南

### 阶段一：基础设施搭建（Week 1）

#### 任务清单

- [ ] 创建 Element Plus 样式定制目录结构
- [ ] 建立 CSS 变量映射系统
- [ ] 配置 Tailwind v4 `@theme` 指令
- [ ] 编写核心组件覆盖样式（button, input）
- [ ] 建立组件封装规范

#### 文件创建清单

```
src/design-system/tokens/
├── element-plus.ts          # Element Plus 变量映射
└── index.ts                 # 更新导出

src/styles/element-plus/
├── index.css                # 主入口
├── variables.css            # CSS 变量定义
├── overrides.css            # 全局覆盖
├── utilities.css            # 工具类
└── components/              # 组件级覆盖
    ├── button.css
    ├── input.css
    ├── slider.css
    ├── drawer.css
    ├── radio.css
    ├── checkbox.css
    ├── select.css
    ├── form.css
    └── dialog.css

src/design-system/base/
├── QyButton.vue             # 按钮组件封装
├── QyInput.vue              # 输入框组件封装
└── ...
```

### 阶段二：核心组件实施（Week 2-3）

#### 按优先级实施

| 优先级 | 组件 | 预计工时 | 依赖 |
|--------|------|---------|------|
| P0 | Button | 0.5d | 无 |
| P0 | Input | 0.5d | 无 |
| P0 | Icon | 0.5d | 无 |
| P1 | Slider | 1d | 无 |
| P1 | Radio/Checkbox | 1d | 无 |
| P1 | Select | 1d | Input |
| P1 | Drawer | 1.5d | 无 |
| P1 | Form | 1d | Input, Radio/Checkbox |
| P2 | Dialog | 1.5d | 无 |
| P2 | Dropdown | 1d | 无 |
| P2 | Table | 2d | 无 |

### 阶段三：测试与优化（Week 4）

#### 测试清单

- [ ] 视觉回归测试（所有主题色）
- [ ] 交互状态测试（hover, active, focus, disabled）
- [ ] 响应式测试（mobile, tablet, desktop）
- [ ] 深色模式测试（如支持）
- [ ] 性能测试（样式加载、渲染性能）
- [ ] 浏览器兼容性测试

### 阶段四：文档与推广

#### 文档清单

- [ ] Element Plus 定制指南（本文档）
- [ ] 组件使用示例文档
- [ ] 主题切换开发指南
- [ ] 样式覆盖最佳实践

---

## 最佳实践

### 1. 样式覆盖优先级

```
设计令牌 (CSS Variables)
    ↓
Tailwind 工具类 (@apply)
    ↓
Element Plus 组件样式覆盖
    ↓
组件内联样式 (style attribute)
```

### 2. 命名规范

- CSS 变量：`--{category}-{component}-{property}-{variant}`
  - 例：`--el-button-primary-bg-hover`
- 工具类：`el-{component}-{variant}-{state}`
  - 例：`el-button-primary-hover`
- Vue 组件：`Qy{ComponentName}`
  - 例：`QyButton`

### 3. 性能优化

#### 3.1 样式懒加载

```typescript
// 按需加载 Element Plus 组件样式
const loadElementPlusStyle = async (component: string) => {
  await import(`element-plus/es/components/${component}/style/css`)
}
```

#### 3.2 CSS 压缩与优化

在 `vite.config.ts` 中配置：

```typescript
export default defineConfig({
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'element-plus-styles': [
            'element-plus/es/components/button/style/css',
            'element-plus/es/components/input/style/css',
            // ... 其他高频组件
          ]
        }
      }
    }
  }
})
```

### 4. 可维护性

#### 4.1 样式注释规范

```css
/* ============================================
   Element Plus Button 定制
   ============================================ */

/**
 * 基础按钮样式
 * @version 1.0.0
 * @author Qingyu Design System
 * @last-modified 2026-02-09
 */

.el-button {
  /* ... */
}
```

#### 4.2 变更日志

维护 `CHANGELOG.md`：

```markdown
## Element Plus 定制变更日志

### [1.2.0] - 2026-02-09
### Added
- 新增 Slider 组件样式定制
- 新增 Drawer 组件样式定制

### Changed
- 优化 Button 悬停效果
- 统一 Input 焦点样式

### Fixed
- 修复 Radio 组件选中状态样式
```

### 5. 主题切换最佳实践

```typescript
// 确保主题切换时 Element Plus 样式同步更新
import { setTheme, applyElementPlusTheme } from '@/design-system/tokens/theme'

export function switchTheme(themeName: ThemeName) {
  // 1. 切换设计系统主题
  setTheme(themeName)

  // 2. 同步更新 Element Plus CSS 变量
  applyElementPlusTheme(currentTheme)

  // 3. 触发全局事件通知组件更新
  window.dispatchEvent(new CustomEvent('theme-changed', {
    detail: { theme: themeName }
  }))
}
```

### 6. 调试技巧

#### 6.1 显示所有 Element Plus 变量

在浏览器控制台执行：

```javascript
// 获取所有 Element Plus CSS 变量
const root = document.documentElement
const elVars = Array.from(root.style)
  .filter(name => name.startsWith('--el-'))
  .map(name => `${name}: ${getComputedStyle(root).getPropertyValue(name)}`)
console.log(elVars.join('\n'))
```

#### 6.2 样式覆盖检查

使用 Chrome DevTools 的 Styles 面板：

1. 检查样式的优先级
2. 查看哪些样式被覆盖
3. 确认 CSS 变量是否正确应用

---

## 附录

### A. 完整的 Element Plus CSS 变量列表

参考 [Element Plus 官方文档 - Theming](https://element-plus.org/en-US/guide/theming.html)

### B. 组件使用示例

```vue
<script setup lang="ts">
import { QyButton, QyInput, QySlider } from '@/design-system/base'
import { ref } from 'vue'

const text = ref('')
const value = ref(50)
</script>

<template>
  <div class="space-y-4 p-6">
    <!-- 按钮 -->
    <QyButton variant="gradient" size="lg">
      渐变按钮
    </QyButton>

    <!-- 输入框 -->
    <QyInput v-model="text" placeholder="请输入内容" />

    <!-- 滑块 -->
    <QySlider v-model="value" :max="100" />
  </div>
</template>
```

### C. 相关资源

- [Tailwind CSS v4 文档](https://tailwindcss.com/docs/functions-and-directives)
- [Element Plus 官方文档](https://element-plus.org/)
- [Qingyu 设计系统文档](./design-system.md)

---

**文档版本**: 1.0.0
**最后更新**: 2026-02-09
**维护者**: Qingyu Frontend Team
