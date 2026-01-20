# Qingyu 前端测试框架文档

## 概述

本测试框架提供了完整的单元测试和E2E测试解决方案，采用现代化的测试工具和最佳实践。

## 测试工具栈

### 单元测试
- **Vitest**: 快速的单元测试框架
- **@testing-library/vue**: Vue组件测试库
- **@vue/test-utils**: Vue组件测试工具
- **jsdom**: 浏览器环境模拟

### E2E测试
- **Playwright**: 跨浏览器E2E测试框架
- **自定义测试辅助工具**: Screenplay模式的测试框架

## 目录结构

```
tests/
├── e2e/                    # E2E测试
│   ├── bookstore.spec.ts   # 书城功能测试
│   ├── auth.spec.ts        # 认证功能测试
│   ├── reader.spec.ts      # 阅读器功能测试
│   ├── writer.spec.ts      # 写作功能测试
│   ├── global-setup.ts     # 全局设置
│   └── global-teardown.ts  # 全局清理
│
├── unit/                   # 单元测试
│   ├── setup.ts            # 测试环境设置
│   ├── components/         # 组件测试
│   ├── utils/              # 工具函数测试
│   └── stores/             # Store测试
│
├── helpers/                # 测试辅助工具
│   ├── browser-session.ts  # 浏览器会话管理
│   ├── actor-factory.ts    # Actor工厂（用户角色）
│   ├── step-builder.ts     # 测试步骤构建器
│   ├── test-data.ts        # 测试数据
│   └── index.ts            # 工具导出
│
└── fixtures/               # 测试fixtures
    ├── books.json          # 书籍数据
    ├── users.json          # 用户数据
    └── api-responses.json  # API响应数据
```

## 测试脚本

### 单元测试
```bash
# 运行单元测试（交互模式）
npm run test

# 运行单元测试（一次性）
npm run test:run

# 生成覆盖率报告
npm run test:coverage

# 运行UI界面
npm run test:ui
```

### E2E测试
```bash
# 运行E2E测试（无头模式）
npm run test:e2e

# 运行E2E测试（UI模式）
npm run test:e2e:ui

# 运行E2E测试（调试模式）
npm run test:e2e:debug

# 运行E2E测试（有头模式）
npm run test:e2e:headed

# 运行所有测试
npm run test:all
```

## 核心辅助工具

### 1. BrowserSession（浏览器会话管理）

管理浏览器会话、页面对象和测试上下文。

```typescript
import { createBrowserSession } from './helpers/browser-session'

// 创建会话
const session = await createBrowserSession(page, context, browser)

// 导航
await session.navigate('/bookstore/books')

// 等待
await session.waitForSelector('.book-card')

// 截图
await session.screenshot('book-list')

// 设置认证token
await session.setAuthToken('your-token-here')

// 清除存储
await session.clearStorage()
```

### 2. Actor Factory（用户角色工厂）

创建不同类型的测试用户，基于Screenplay模式。

```typescript
import { ActorFactory, ActorRole } from './helpers/actor-factory'

// 创建访客
const guest = ActorFactory.createGuest('访客用户', session)
await guest.viewBookList()

// 创建读者
const reader = ActorFactory.createReader('测试读者', session, credentials)
await reader.login()
await reader.readBook('book-id')

// 创建作者
const author = ActorFactory.createAuthor('测试作者', session, credentials)
await author.createProject({ title: '新书', description: '简介' })
await author.writeChapter('project-id', { title: '第一章', content: '...' })
```

### 3. Step Builder（测试步骤构建器）

构建可读性强的测试步骤。

```typescript
import { ScenarioBuilder } from './helpers/step-builder'

await ScenarioBuilder
  .create('用户浏览书籍列表')
  .step(builder => builder
    .addNavigationStep('/bookstore/books', page)
    .addWaitStep('.book-card', page)
    .addAssertionStep('.book-card', 'visible', page)
  )
  .build()
```

### 4. Test Data（测试数据）

提供预定义的测试数据生成器。

```typescript
import { testFixtures, TestDataGenerator } from './helpers/test-data'

// 使用预定义数据
const testBook = testFixtures.books.novel
const testUser = testFixtures.users.reader

// 生成随机数据
const newUser = TestDataGenerator.createUserCredentials()
const newBook = TestDataGenerator.createBookData()
```

## 编写测试

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookCard from '@/components/BookCard.vue'

describe('BookCard组件', () => {
  it('应该正确渲染书籍信息', () => {
    const wrapper = mount(BookCard, {
      props: {
        book: {
          id: '1',
          title: '测试书籍',
          author: '测试作者',
          cover: 'cover.jpg'
        }
      }
    })

    expect(wrapper.find('.book-title').text()).toBe('测试书籍')
    expect(wrapper.find('.book-author').text()).toBe('测试作者')
  })

  it('点击应该触发事件', async () => {
    const wrapper = mount(BookCard, {
      props: {
        book: { id: '1', title: '测试' }
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### E2E测试示例

```typescript
import { test, expect } from '@playwright/test'
import { ActorFactory } from '../helpers/actor-factory'
import { testFixtures } from '../helpers/test-data'

test.describe('书城功能', () => {
  test('访客可以浏览书籍列表', async ({ page }) => {
    const guest = ActorFactory.createGuest('访客', session)

    await guest.viewBookList()

    // 断言
    await expect(page.locator('.book-card')).toBeVisible()
  })

  test('用户可以查看书籍详情', async ({ page }) => {
    const book = testFixtures.books.novel
    const guest = ActorFactory.createGuest('访客', session)

    await guest.viewBookDetail(book.id)

    // 断言
    await expect(page.locator('[data-testid="book-title"]')).toContainText(book.title)
  })
})
```

## 最佳实践

### 1. 测试组织

- 按功能模块组织测试文件
- 使用`test.describe`分组相关测试
- 每个测试应该独立运行

### 2. 测试命名

- 使用描述性的测试名称
- 格式：`应该[期望的行为]当[条件]`
- 示例：`应该显示书籍列表当用户访问书库页面`

### 3. 测试数据

- 使用测试数据生成器创建数据
- 避免硬编码重复的数据
- 使用fixtures管理共享数据

### 4. 选择器策略

- 优先使用`data-testid`属性
- 避免使用CSS类名（可能变化）
- 避免使用文本内容（可能改变语言）

```html
<!-- 推荐 -->
<button data-testid="submit-button">提交</button>

<!-- 不推荐 -->
<button class="btn-primary">提交</button>
```

### 5. 异步处理

- 始终使用`await`处理异步操作
- 使用适当的等待策略
- 避免使用固定的`timeout`

```typescript
// 推荐
await page.waitForSelector('.book-card')
await expect(page.locator('.book-card')).toBeVisible()

// 不推荐
await page.waitForTimeout(5000)
```

### 6. 断言策略

- 使用具体的断言
- 避免过度的实现细节
- 关注用户可见的行为

```typescript
// 推荐
await expect(page.locator('.book-title')).toContainText('测试书籍')

// 不推荐
expect(await page.locator('.book-title').textContent()).toBe('测试书籍')
```

## 调试测试

### 单元测试调试

```bash
# 运行特定测试文件
npm run test -- caseConverter.spec.ts

# 运行特定测试用例
npm run test -- -t "should convert snake_case to camelCase"

# 查看覆盖率
npm run test:coverage
```

### E2E测试调试

```bash
# 使用UI模式
npm run test:e2e:ui

# 使用调试模式
npm run test:e2e:debug

# 运行特定测试
npx playwright test bookstore.spec.ts

# 运行特定测试用例
npx playwright test -g "访客可以浏览书籍列表"

# 显示浏览器
npm run test:e2e:headed
```

## CI/CD集成

### GitHub Actions示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 常见问题

### Q: 单元测试报错"Cannot find module"

**A**: 确保配置了正确的模块别名，检查`vite.config.ts`和`vitest.config.ts`。

### Q: E2E测试超时

**A**: 增加`playwright.config.ts`中的超时配置，或使用更智能的等待策略。

### Q: 测试在CI中失败但在本地通过

**A**: 检查时区、环境变量、数据库状态等差异。

## 资源链接

- [Vitest文档](https://vitest.dev/)
- [Playwright文档](https://playwright.dev/)
- [Testing Library文档](https://testing-library.com/)
- [Vue Test Utils文档](https://test-utils.vuejs.org/)
