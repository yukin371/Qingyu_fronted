# 样式开发指南

本文档说明样式开发规范，包括CSS组织、命名规范和最佳实践。

## 样式架构

```
src/assets/styles/
├── variables.css      # CSS变量
├── reset.css          # 重置样式
├── common.css         # 通用样式
└── mixins.css         # 混合样式

src/components/        # 组件样式（scoped）
src/views/            # 页面样式（scoped）
```

## CSS命名规范 - BEM

### BEM概念

```
.block__element--modifier
```

- **Block（块）**：独立的组件
- **Element（元素）**：块的组成部分
- **Modifier（修饰符）**：块或元素的状态/变体

### 示例

```css
/* 块 */
.book-card { }

/* 元素 */
.book-card__cover { }
.book-card__title { }
.book-card__author { }

/* 修饰符 */
.book-card--large { }
.book-card--featured { }
.book-card__title--highlight { }
```

### 在Vue中使用

```vue
<template>
  <div :class="['book-card', `book-card--${size}`, { 'book-card--active': isActive }]">
    <div class="book-card__cover">
      <img :src="book.cover" />
    </div>
    <div class="book-card__info">
      <h3 class="book-card__title">{{ book.title }}</h3>
      <p class="book-card__author">{{ book.author }}</p>
    </div>
  </div>
</template>

<style scoped>
.book-card {
  border-radius: 8px;
}

.book-card--large {
  width: 300px;
}

.book-card--active {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.book-card__title {
  font-size: 16px;
}
</style>
```

## Scoped样式

### 基本用法

```vue
<style scoped>
/* 只作用于当前组件 */
.book-card {
  padding: 20px;
}
</style>
```

### 深度选择器

```vue
<style scoped>
/* 影响子组件 */
:deep(.el-button) {
  border-radius: 4px;
}

/* 旧语法（仍然支持） */
::v-deep .el-button { }
/deep/ .el-button { }
>>>.el-button { }
</style>
```

### 插槽选择器

```vue
<style scoped>
/* 样式化插槽内容 */
:slotted(.user-content) {
  color: #666;
}
</style>
```

### 全局选择器

```vue
<style scoped>
/* 全局样式 */
:global(.global-class) {
  font-size: 14px;
}
</style>
```

## CSS变量

### 定义变量

```css
/* src/assets/styles/variables.css */
:root {
  /* 颜色 */
  --color-primary: #409eff;
  --color-success: #67c23a;
  --color-warning: #e6a23c;
  --color-danger: #f56c6c;
  --color-info: #909399;

  /* 文本颜色 */
  --text-primary: #303133;
  --text-regular: #606266;
  --text-secondary: #909399;
  --text-placeholder: #c0c4cc;

  /* 边框颜色 */
  --border-base: #dcdfe6;
  --border-light: #e4e7ed;
  --border-lighter: #ebeef5;

  /* 背景颜色 */
  --bg-base: #ffffff;
  --bg-page: #f2f3f5;

  /* 字体大小 */
  --font-size-extra-small: 12px;
  --font-size-small: 13px;
  --font-size-base: 14px;
  --font-size-medium: 16px;
  --font-size-large: 18px;

  /* 间距 */
  --spacing-small: 8px;
  --spacing-base: 16px;
  --spacing-large: 24px;

  /* 圆角 */
  --border-radius-small: 2px;
  --border-radius-base: 4px;
  --border-radius-large: 8px;

  /* 阴影 */
  --box-shadow-base: 0 2px 4px rgba(0,0,0,0.12), 0 0 6px rgba(0,0,0,0.04);
  --box-shadow-dark: 0 2px 8px rgba(0,0,0,0.15);

  /* 过渡 */
  --transition-base: all 0.3s ease;
}

/* 暗黑模式 */
[data-theme="dark"] {
  --color-primary: #409eff;
  --text-primary: #e5eaf3;
  --bg-base: #1a1a1a;
  --border-base: #4c4d4f;
}
```

### 使用变量

```vue
<style scoped>
.book-card {
  color: var(--text-primary);
  background: var(--bg-base);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-base);
  transition: var(--transition-base);
}

.book-card__title {
  font-size: var(--font-size-medium);
  color: var(--text-primary);
}
</style>
```

## 响应式设计

### 断点定义

```css
/* 移动设备 */
@media (max-width: 768px) { }

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) { }

/* 桌面 */
@media (min-width: 1025px) { }
```

### 使用示例

```vue
<style scoped>
.book-card {
  width: 100%;
}

/* 平板及以上 */
@media (min-width: 768px) {
  .book-card {
    width: 50%;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .book-card {
    width: 33.333%;
  }
}
</style>
```

## 动态样式

### Class绑定

```vue
<template>
  <!-- 对象语法 -->
  <div :class="{ active: isActive, 'text-danger': hasError }">

  <!-- 数组语法 -->
  <div :class="[baseClass, isActive ? 'active' : '']">

  <!-- 混合 -->
  <div :class="['book-card', `book-card--${size}`, { active: isActive }]">
</template>
```

### Style绑定

```vue
<template>
  <!-- 对象语法 -->
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }">

  <!-- 数组语法 -->
  <div :style="[baseStyles, overridingStyles]">
</template>

<script setup>
const activeColor = ref('#409eff')
const fontSize = ref(14)

const baseStyles = {
  padding: '20px',
  background: '#fff'
}
</script>
```

## 动画和过渡

### CSS过渡

```vue
<template>
  <transition name="fade">
    <div v-if="show">内容</div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 列表过渡

```vue
<template>
  <transition-group name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.text }}
    </li>
  </transition-group>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
```

### CSS动画

```vue
<style scoped>
.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
```

## 样式复用

### CSS Mixins

```css
/* src/assets/styles/mixins.css */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

使用：

```vue
<style scoped>
@import '@/assets/styles/mixins.css';

.book-title {
  @apply truncate;
}
</style>
```

### 使用Composable

```javascript
// composables/useStyles.js
export function useStyles() {
  const truncate = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
  
  const flexCenter = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
  
  return {
    truncate,
    flexCenter
  }
}
```

```vue
<template>
  <div :style="truncate">文本</div>
</template>

<script setup>
import { useStyles } from '@/composables/useStyles'
const { truncate } = useStyles()
</script>
```

## Element Plus主题定制

### 方式1：CSS变量

```css
/* src/assets/styles/element-variables.css */
:root {
  --el-color-primary: #409eff;
  --el-border-radius-base: 4px;
  --el-font-size-base: 14px;
}
```

### 方式2：Sass变量

```scss
// styles/element-variables.scss
@forward 'element-plus/theme-chalk/src/common/var.scss' with (
  $colors: (
    'primary': (
      'base': #409eff,
    ),
  ),
);
```

## 最佳实践

### 1. 避免内联样式

```vue
<!-- ❌ 避免 -->
<div style="color: red; font-size: 14px;">

<!-- ✅ 推荐 -->
<div class="error-text">
```

### 2. 使用scoped避免污染

```vue
<style scoped>
/* 只影响当前组件 */
</style>
```

### 3. 合理使用CSS变量

```vue
<style scoped>
.book-card {
  color: var(--text-primary);  /* ✅ */
  /* color: #303133;  ❌ */
}
</style>
```

### 4. 避免过深的选择器

```css
/* ❌ 避免 */
.page .content .section .item .title { }

/* ✅ 推荐 */
.item__title { }
```

### 5. 使用Flexbox和Grid

```css
/* Flexbox */
.container {
  display: flex;
  gap: 16px;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
```

## 常见问题

**Q: scoped样式无法影响子组件？**

```vue
<!-- 使用 :deep() -->
<style scoped>
:deep(.child-component) {
  color: red;
}
</style>
```

**Q: 如何覆盖Element Plus样式？**

```vue
<style>
/* 不使用scoped，或使用 :deep() */
.el-button {
  border-radius: 4px;
}
</style>
```

**Q: 如何实现暗黑模式？**

```javascript
// 切换主题
document.documentElement.setAttribute('data-theme', 'dark')
```

## 参考资料

- [CSS BEM命名](http://getbem.com/)
- [Vue scoped样式](https://vuejs.org/api/sfc-css-features.html)
- [Element Plus主题](https://element-plus.org/zh-CN/guide/theming.html)

---

**最后更新**：2025年10月17日
