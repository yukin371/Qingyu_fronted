# 组件开发指南

本文档说明如何开发Vue组件，包括组件设计、编码规范和最佳实践。

## 组件开发流程

```
需求分析 → API设计 → 编写代码 → 测试 → 文档
```

## 组件类型

### 通用组件（Common）
无业务逻辑的纯UI组件：
- **Loading**：加载指示器
- **Empty**：空状态展示
- **Button**：按钮组件

### 业务组件（Business）
包含特定业务逻辑的组件：
- **BookCard**：书籍卡片
- **BannerCarousel**：Banner轮播
- **RankingList**：榜单列表

## 组件基础模板

### script setup 写法（推荐）

```vue
<template>
  <div class="book-card" @click="handleClick">
    <div class="book-card__cover">
      <img :src="book.cover" :alt="book.title" loading="lazy" />
    </div>
    
    <div class="book-card__info">
      <h3 class="book-card__title">{{ book.title }}</h3>
      <p class="book-card__author">{{ book.author }}</p>
      
      <!-- 默认插槽 -->
      <slot />
    </div>
    
    <!-- 具名插槽 -->
    <div class="book-card__footer">
      <slot name="footer" :book="book" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 书籍卡片组件
 * @description 展示书籍基本信息
 */

// Props 定义
const props = defineProps({
  book: {
    type: Object,
    required: true,
    validator: (v) => v.id && v.title
  },
  size: {
    type: String,
    default: 'medium',
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  }
})

// Events 定义
const emit = defineEmits({
  'click': (book) => book && book.id,
  'favorite': (id) => typeof id === 'string'
})

// 计算属性
const cardClass = computed(() => {
  return `book-card book-card--${props.size}`
})

// 方法
const handleClick = () => {
  emit('click', props.book)
}

// 暴露方法（可选）
defineExpose({
  refresh() {
    // 刷新逻辑
  }
})
</script>

<style scoped>
.book-card {
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-card__title {
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
```

## Props 规范

### 1. 完整定义
```javascript
// ✅ 推荐
defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 10,
    validator: (v) => v > 0
  }
})

// ❌ 避免
defineProps(['title', 'items'])  // 缺少类型定义
```

### 2. 类型定义
```javascript
// 基础类型
String, Number, Boolean, Array, Object, Date, Function, Symbol

// 自定义验证
validator: (value) => {
  return ['small', 'medium', 'large'].includes(value)
}
```

### 3. 默认值
```javascript
// ✅ 正确 - 对象/数组用工厂函数
default: () => []
default: () => ({})

// ❌ 错误
default: []
default: {}
```

## Events 规范

### 命名
使用 kebab-case：
```javascript
// ✅ 正确
emit('item-click')
emit('view-more')
emit('data-loaded')

// ❌ 错误
emit('itemClick')
emit('viewMore')
```

### 验证
```javascript
const emit = defineEmits({
  'click': (book) => {
    return book && book.id  // 返回 true/false
  },
  'update:model-value': (value) => {
    return typeof value === 'string'
  }
})
```

## Slots 插槽

### 默认插槽
```vue
<template>
  <div class="wrapper">
    <slot />  <!-- 默认插槽 -->
  </div>
</template>
```

### 具名插槽
```vue
<template>
  <div class="card">
    <header class="card__header">
      <slot name="header" />
    </header>
    <main class="card__body">
      <slot />  <!-- 默认 -->
    </main>
    <footer class="card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

### 作用域插槽
```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot :item="item" :index="index" />
    </li>
  </ul>
</template>

<!-- 使用 -->
<MyList :items="books">
  <template #default="{ item, index }">
    <span>{{ index }}. {{ item.title }}</span>
  </template>
</MyList>
```

## 组合式API

### 使用 Composables
```javascript
// composables/useBookCard.js
import { ref, computed } from 'vue'

export function useBookCard(book) {
  const isHovered = ref(false)
  
  const displayInfo = computed(() => ({
    title: book.value.title,
    author: book.value.author
  }))
  
  const handleMouseEnter = () => {
    isHovered.value = true
  }
  
  return {
    isHovered,
    displayInfo,
    handleMouseEnter
  }
}
```

在组件中使用：
```vue
<script setup>
import { toRef } from 'vue'
import { useBookCard } from '@/composables/useBookCard'

const props = defineProps({
  book: Object
})

const {
  isHovered,
  displayInfo,
  handleMouseEnter
} = useBookCard(toRef(props, 'book'))
</script>
```

## 组件通信

### 父子通信
```vue
<!-- 父组件 -->
<template>
  <BookCard 
    :book="book"
    @click="handleClick"
  />
</template>

<!-- 子组件 -->
<script setup>
const emit = defineEmits(['click'])
const handleClick = () => emit('click', props.book)
</script>
```

### v-model 双向绑定
```vue
<!-- 子组件 -->
<script setup>
const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<!-- 父组件 -->
<template>
  <MyComponent v-model="isVisible" />
</template>
```

### Provide/Inject
```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'

const theme = ref('light')
provide('theme', theme)
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
</script>
```

## 样式规范

### BEM 命名
```css
/* 块 */
.book-card { }

/* 元素 */
.book-card__title { }
.book-card__author { }

/* 修饰符 */
.book-card--large { }
.book-card--featured { }
```

### Scoped 样式
```vue
<style scoped>
/* 组件内样式 */
.book-card { }

/* 深度选择器 - 影响子组件 */
:deep(.child-component) { }

/* 插槽选择器 */
:slotted(.slot-content) { }

/* 全局选择器 */
:global(.global-class) { }
</style>
```

### 动态样式
```vue
<template>
  <div 
    :class="['book-card', `book-card--${size}`, { 'is-active': isActive }]"
    :style="{ background: backgroundColor }"
  >
  </div>
</template>
```

## 性能优化

### v-memo
```vue
<template>
  <div v-for="book in books" :key="book.id" v-memo="[book.id, book.title]">
    <!-- 只在 id 或 title 变化时重新渲染 -->
    <BookCard :book="book" />
  </div>
</template>
```

### 异步组件
```javascript
import { defineAsyncComponent } from 'vue'

const AsyncBookCard = defineAsyncComponent(() =>
  import('./components/BookCard.vue')
)
```

### shallowRef
```javascript
import { shallowRef } from 'vue'

// 对于大型对象，使用 shallowRef
const largeData = shallowRef({
  id: '1',
  items: [/* 大量数据 */]
})
```

## 组件测试

### 单元测试示例
```javascript
// BookCard.test.js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import BookCard from './BookCard.vue'

describe('BookCard', () => {
  const book = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author'
  }

  it('renders book info', () => {
    const wrapper = mount(BookCard, {
      props: { book }
    })
    
    expect(wrapper.text()).toContain('Test Book')
    expect(wrapper.text()).toContain('Test Author')
  })

  it('emits click event', async () => {
    const wrapper = mount(BookCard, {
      props: { book }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0][0]).toEqual(book)
  })
})
```

## 最佳实践

### 1. 单一职责
```javascript
// ✅ 只负责展示
<BookCard :book="book" />

// ❌ 包含数据获取
<BookCardWithData :bookId="id" />
```

### 2. Props验证
```javascript
// ✅ 完整验证
props: {
  book: {
    type: Object,
    required: true,
    validator: (v) => v.id && v.title
  }
}
```

### 3. 避免直接修改Props
```javascript
// ❌ 错误
props.book.title = 'New'

// ✅ 正确
const localBook = computed(() => ({ ...props.book }))
emit('update:book', { ...props.book, title: 'New' })
```

### 4. 使用计算属性
```javascript
// ❌ 模板中的复杂逻辑
<div>{{ books.filter(b => b.rating > 4).map(b => b.title).join(', ') }}</div>

// ✅ 使用计算属性
<div>{{ highRatedBooks }}</div>

<script setup>
const highRatedBooks = computed(() =>
  books.value.filter(b => b.rating > 4).map(b => b.title).join(', ')
)
</script>
```

## 常见问题

**Q: 组件之间如何共享状态？**
```javascript
// 使用 Pinia Store
import { useBookStore } from '@/stores/book'

const bookStore = useBookStore()
const book = computed(() => bookStore.currentBook)
```

**Q: 如何处理组件错误？**
```vue
<script setup>
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('组件错误:', err)
  return false  // 阻止错误传播
})
</script>
```

## 参考资料

- [Vue 3 组件基础](https://vuejs.org/guide/essentials/component-basics.html)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [组件测试](../testing/component-test.md)

---

**最后更新**：2025年10月17日
