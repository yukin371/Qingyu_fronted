# 测试文档导航

## 📋 概述

本目录包含青羽书城前端的测试相关文档，涵盖测试策略、测试指南、测试用例等内容。

## 📁 文档列表

### 📊 测试策略
- [测试策略](./测试策略.md) - 整体测试策略和方法论
- [测试金字塔](./测试金字塔.md) - 测试层级和覆盖范围

### 🧪 测试指南
- [单元测试指南](./单元测试指南.md) - 使用Vitest进行单元测试
- [组件测试指南](./组件测试指南.md) - Vue组件测试方法
- [集成测试指南](./集成测试指南.md) - 集成测试实施指南
- [E2E测试指南](./E2E测试指南.md) - 端到端测试（Cypress/Playwright）
- [性能测试指南](./性能测试指南.md) - 前端性能测试方法
- [可访问性测试](./可访问性测试.md) - 无障碍访问测试

### 📝 测试用例
- [组件测试用例](./test-cases/组件测试用例.md) - 组件测试用例库
- [页面测试用例](./test-cases/页面测试用例.md) - 页面测试用例库
- [功能测试用例](./test-cases/功能测试用例.md) - 功能测试用例库

## 🎯 测试原则

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

### 测试策略

1. **单元测试** - 70%
   - 测试独立的函数和组件
   - 快速执行，易于维护
   - 高覆盖率

2. **集成测试** - 20%
   - 测试模块间的交互
   - 验证数据流和状态管理
   - 适度覆盖

3. **E2E测试** - 10%
   - 测试关键业务流程
   - 从用户角度验证
   - 重点覆盖

## 🚀 快速开始

### 1. 安装测试工具

```bash
# Vitest（单元测试）
npm install -D vitest @vue/test-utils

# Cypress（E2E测试）
npm install -D cypress

# 或使用Playwright
npm install -D @playwright/test
```

### 2. 配置测试环境

**vitest.config.js**
```javascript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
})
```

### 3. 运行测试

```bash
# 运行单元测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行E2E测试
npm run test:e2e
```

## 🧪 测试示例

### 单元测试示例

```javascript
// BookCard.test.js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import BookCard from '@/components/BookCard.vue'

describe('BookCard', () => {
  it('renders book title correctly', () => {
    const book = {
      id: '1',
      title: 'Test Book',
      author: 'Test Author'
    }
    
    const wrapper = mount(BookCard, {
      props: { book }
    })
    
    expect(wrapper.text()).toContain('Test Book')
  })
  
  it('emits click event when clicked', async () => {
    const wrapper = mount(BookCard, {
      props: { book: { id: '1', title: 'Test' } }
    })
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('book-click')).toBeTruthy()
  })
})
```

### 组件测试示例

```javascript
// BookGrid.test.js
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import BookGrid from '@/components/BookGrid.vue'

describe('BookGrid', () => {
  const books = [
    { id: '1', title: 'Book 1' },
    { id: '2', title: 'Book 2' }
  ]
  
  it('renders all books', () => {
    const wrapper = mount(BookGrid, {
      props: { books }
    })
    
    const bookCards = wrapper.findAllComponents({ name: 'BookCard' })
    expect(bookCards).toHaveLength(2)
  })
  
  it('shows loading state', () => {
    const wrapper = mount(BookGrid, {
      props: { books: [], loading: true }
    })
    
    expect(wrapper.find('.loading').exists()).toBe(true)
  })
})
```

### E2E测试示例

```javascript
// homepage.cy.js (Cypress)
describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  
  it('displays homepage content', () => {
    cy.contains('青羽书城')
    cy.get('[data-testid="banner-carousel"]').should('be.visible')
  })
  
  it('navigates to book detail', () => {
    cy.get('.book-card').first().click()
    cy.url().should('include', '/books/')
    cy.get('.book-detail').should('be.visible')
  })
})
```

## 📊 测试覆盖率

### 覆盖率目标

| 指标 | 目标 | 说明 |
|------|------|------|
| 语句覆盖率 | ≥ 80% | 代码语句执行覆盖 |
| 分支覆盖率 | ≥ 75% | 条件分支覆盖 |
| 函数覆盖率 | ≥ 85% | 函数调用覆盖 |
| 行覆盖率 | ≥ 80% | 代码行覆盖 |

### 查看覆盖率报告

```bash
# 生成覆盖率报告
npm run test:coverage

# 打开HTML报告
open coverage/index.html
```

## 🔧 测试最佳实践

### 1. AAA模式

```javascript
// Arrange（准备）
const wrapper = mount(Component, { props })

// Act（执行）
await wrapper.trigger('click')

// Assert（断言）
expect(wrapper.emitted()).toBeTruthy()
```

### 2. 使用测试ID

```vue
<!-- 使用data-testid -->
<div data-testid="book-card">{{ title }}</div>
```

```javascript
// 测试中使用
wrapper.find('[data-testid="book-card"]')
```

### 3. Mock外部依赖

```javascript
import { vi } from 'vitest'

// Mock API调用
vi.mock('@/api/bookstore', () => ({
  getBooks: vi.fn(() => Promise.resolve([]))
}))
```

### 4. 测试异步操作

```javascript
it('loads data asynchronously', async () => {
  const wrapper = mount(Component)
  
  // 等待异步操作完成
  await wrapper.vm.$nextTick()
  
  expect(wrapper.text()).toContain('Data loaded')
})
```

## 🔗 相关文档

- [代码规范](../engineering/代码规范.md) - 代码编写规范
- [组件开发指南](../implementation/development/组件开发指南.md) - 组件开发规范
- [性能优化](../implementation/best-practices/性能优化实践.md) - 性能优化方法

---

**最后更新**：2025年10月13日

