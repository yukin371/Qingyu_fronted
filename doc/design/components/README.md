# 组件设计总览

## 📋 概述

本文档提供青羽书城前端组件设计的总体规划和设计规范，涵盖通用组件、业务组件和布局组件的设计原则。

## 🧩 组件分类

### 通用组件 (Common)
基础的、可复用的UI组件，不包含业务逻辑。

- [Button组件](./common/Button组件设计.md) - 按钮组件
- [Input组件](./common/Input组件设计.md) - 输入框组件
- [Dialog组件](./common/Dialog组件设计.md) - 对话框组件
- [Loading组件](./common/Loading组件设计.md) - 加载状态组件

### 业务组件 (Business)
包含特定业务逻辑的组件。

- [BookCard组件](./business/BookCard组件设计.md) - 书籍卡片
- [BookGrid组件](./business/BookGrid组件设计.md) - 书籍网格
- [RankingList组件](./business/RankingList组件设计.md) - 榜单列表
- [BannerCarousel组件](./business/BannerCarousel组件设计.md) - 轮播横幅

### 布局组件 (Layout)
页面布局相关的组件。

- [Header组件](./layout/Header组件设计.md) - 页面头部
- [Footer组件](./layout/Footer组件设计.md) - 页面底部
- [Sidebar组件](./layout/Sidebar组件设计.md) - 侧边栏
- [MainLayout组件](./layout/MainLayout组件设计.md) - 主布局

## 🎯 设计原则

### 1. 单一职责原则
每个组件应该只有一个明确的职责和功能。

**✅ 好的例子：**
```vue
<!-- BookCard组件只负责展示书籍卡片 -->
<BookCard :book="book" @click="handleClick" />
```

**❌ 不好的例子：**
```vue
<!-- 一个组件既负责展示又负责数据获取 -->
<BookCardWithData :bookId="id" />
```

### 2. Props验证原则
所有props必须进行类型验证和默认值设置。

```javascript
props: {
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  maxItems: {
    type: Number,
    default: 10,
    validator: (value) => value > 0
  }
}
```

### 3. 事件命名原则
使用kebab-case命名事件，使用动词-名词的形式。

```javascript
// ✅ 正确
emit('book-click', book)
emit('item-select', item)
emit('data-load')

// ❌ 错误
emit('bookClick')
emit('click')
emit('select')
```

### 4. 插槽使用原则
合理使用插槽提高组件灵活性。

```vue
<template>
  <div class="card">
    <!-- 默认插槽 -->
    <slot />
    
    <!-- 具名插槽 -->
    <div class="header">
      <slot name="header" />
    </div>
    
    <!-- 作用域插槽 -->
    <slot name="item" :item="item" />
  </div>
</template>
```

### 5. 样式隔离原则
使用scoped样式，避免样式污染。

```vue
<style scoped>
.component {
  /* 组件样式 */
}

/* 深度选择器（谨慎使用） */
:deep(.child-class) {
  /* 子组件样式 */
}
</style>
```

## 📝 组件设计规范

### 组件文件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script>
/**
 * 组件名称
 * @description 组件描述
 * @author 作者
 * @date 日期
 */
import { ref, computed } from 'vue'

export default {
  name: 'ComponentName',
  props: {
    // Props定义
  },
  emits: ['event-name'],
  setup(props, { emit }) {
    // 组合式API逻辑
    return {
      // 返回的数据和方法
    }
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>
```

### Props定义规范

```javascript
props: {
  // 必填属性
  id: {
    type: String,
    required: true
  },
  
  // 可选属性（基本类型）
  title: {
    type: String,
    default: ''
  },
  
  // 可选属性（对象/数组）
  items: {
    type: Array,
    default: () => []
  },
  
  // 带验证的属性
  status: {
    type: String,
    default: 'pending',
    validator: (value) => ['pending', 'active', 'completed'].includes(value)
  }
}
```

### 事件定义规范

```javascript
emits: {
  // 简单事件
  'item-click': null,
  
  // 带验证的事件
  'value-change': (value) => {
    return typeof value === 'string'
  },
  
  // 带多个参数的事件
  'item-select': (item, index) => {
    return item && typeof index === 'number'
  }
}
```

## 🔄 组件生命周期

### Composition API生命周期

```javascript
import { onMounted, onUpdated, onUnmounted } from 'vue'

setup() {
  // 组件挂载时
  onMounted(() => {
    console.log('Component mounted')
  })
  
  // 组件更新时
  onUpdated(() => {
    console.log('Component updated')
  })
  
  // 组件卸载时
  onUnmounted(() => {
    console.log('Component unmounted')
  })
}
```

## 🎨 样式设计规范

### BEM命名方法

```css
/* 块 (Block) */
.book-card { }

/* 元素 (Element) */
.book-card__title { }
.book-card__cover { }
.book-card__author { }

/* 修饰符 (Modifier) */
.book-card--featured { }
.book-card--compact { }
```

### CSS变量使用

```css
.component {
  color: var(--primary-color);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius);
}
```

## 📊 组件性能优化

### 1. 使用v-memo优化列表

```vue
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.status]">
    <!-- 只在id或status变化时重新渲染 -->
  </div>
</template>
```

### 2. 使用异步组件

```javascript
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
```

### 3. 使用shallowRef优化大对象

```javascript
import { shallowRef } from 'vue'

const largeObject = shallowRef({
  // 大量数据
})
```

## 🔗 相关文档

- [组件开发指南](../../implementation/development/组件开发指南.md) - 组件开发实施指南
- [样式开发指南](../../implementation/development/样式开发指南.md) - 样式编写规范
- [组件测试指南](../../testing/组件测试指南.md) - 组件测试方法

---

**最后更新**：2025年10月13日

