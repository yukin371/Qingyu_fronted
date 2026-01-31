# 测试文档

测试策略、方法和指南。

## 测试策略

### 测试金字塔

```
        /\
       /  \      E2E测试
      /    \     (少量，关键流程)
     /------\    
    /        \   集成测试
   /          \  (适量，模块交互)
  /------------\ 
 /              \ 单元测试
/________________\(大量，函数/组件)
```

- **单元测试**：测试独立函数和组件（最多）
- **集成测试**：测试组件间交互（中等）
- **E2E测试**：测试用户流程（最少）

## 测试文档

### [单元测试](./unit-test.md)

- Vitest基础
- 工具函数测试
- Store测试

### [组件测试](./component-test.md)

- Vue Test Utils
- 组件渲染测试
- 事件测试
- Props测试

## 快速开始

### 安装依赖

```bash
pnpm add -D vitest @vue/test-utils happy-dom
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage
```

## 测试示例

### 组件测试

```javascript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import BookCard from '@/components/BookCard.vue'

describe('BookCard', () => {
  it('renders book info', () => {
    const wrapper = mount(BookCard, {
      props: {
        book: { id: '1', title: 'Test' }
      }
    })
    expect(wrapper.text()).toContain('Test')
  })
})
```

### Store测试

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useBookstoreStore } from '@/stores/bookstore'

describe('Bookstore Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('fetches books', async () => {
    const store = useBookstoreStore()
    await store.fetchBooks()
    expect(store.books.length).toBeGreaterThan(0)
  })
})
```

## 测试覆盖率目标

- 单元测试：≥ 80%
- 集成测试：核心功能100%
- E2E测试：关键用户流程

---

**最后更新**：2025年10月17日
