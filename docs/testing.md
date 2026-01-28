# 测试最佳实践

> Qingyu前端项目测试指南
>
> **版本**: v1.0
> **最后更新**: 2026-01-28
> **维护者**: 前端团队

## 目录

1. [测试原则](#1-测试原则)
2. [测试结构](#2-测试结构)
3. [测试命名规范](#3-测试命名规范)
4. [Mock策略](#4-mock策略)
5. [测试编写指南](#5-测试编写指南)
6. [覆盖率要求](#6-覆盖率要求)
7. [常见问题](#7-常见问题)

---

## 1. 测试原则

### 1.1 测试金字塔

```
        /\
       /  \              5%  E2E测试（Playwright）
      / E2E \            15% 集成测试
     /──────\
    /        \
   / Integration       80% 单元测试（Vitest）
  /────────────\
 /   Unit Tests  \
```

### 1.2 核心原则

#### 快速（Fast）
- 每个单元测试应在100ms内完成
- 避免使用真实网络请求
- 避免使用真实的文件系统操作
- 避免使用真实的定时器

```typescript
// ✅ 正确：使用vi.useFakeTimers
vi.useFakeTimers()
await vi.runAllTimersAsync()

// ❌ 错误：使用真实定时器
await new Promise(resolve => setTimeout(resolve, 1000))
```

#### 隔离（Isolated）
- 测试之间互不影响
- 每个测试独立运行
- 不依赖执行顺序
- 在beforeEach中清理状态

```typescript
// ✅ 正确：在beforeEach中清理
beforeEach(() => {
  vi.clearAllMocks()
})

// ❌ 错误：依赖其他测试
let sharedState
test('test1', () => {
  sharedState = 'data'
})
test('test2', () => {
  expect(sharedState).toBe('data') // 依赖test1
})
```

#### 可读（Readable）
- 测试名称应清晰描述测试内容
- 测试应包含AAA模式（Arrange-Act-Assert）
- 使用辅助函数简化测试代码
- 测试即文档

```typescript
// ✅ 正确：清晰的测试结构
describe('UserService.login', () => {
  it('should return user data when credentials are valid', async () => {
    // Arrange: 准备测试数据
    const credentials = { username: 'test', password: '123456' }
    const expectedUser = { id: '1', name: 'Test User' }
    vi.mocked(api.login).mockResolvedValue(expectedUser)

    // Act: 执行被测试的功能
    const result = await userService.login(credentials)

    // Assert: 验证结果
    expect(result).toEqual(expectedUser)
    expect(api.login).toHaveBeenCalledWith(credentials)
  })
})
```

#### 独立（Independent）
- 测试不依赖外部服务
- 使用mock代替真实依赖
- 测试失败原因明确

```typescript
// ✅ 正确：使用mock
vi.mock('@/api/user', () => ({
  getUserById: vi.fn(),
}))

// ❌ 错误：依赖真实API
const result = await fetch('/api/users/1')
```

---

## 2. 测试结构

### 2.1 文件组织

```
src/modules/{module}/
├── __tests__/
│   ├── api/
│   │   └── *.api.spec.ts
│   ├── stores/
│   │   └── *.store.spec.ts
│   ├── components/
│   │   └── *.component.spec.ts
│   └── views/
│       └── *.view.spec.ts
```

### 2.2 测试文件结构

```typescript
/**
 * API测试文件结构示例
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { booklistApi } from '../api/index'

describe('booklistApi', () => {
  // 在所有测试前执行（执行一次）
  beforeAll(() => {
    // 初始化测试环境
  })

  // 在每个测试前执行
  beforeEach(() => {
    // 清理mock状态
    vi.clearAllMocks()
  })

  // 在每个测试后执行
  afterEach(() => {
    // 清理副作用
  })

  // 在所有测试后执行（执行一次）
  afterAll(() => {
    // 清理测试环境
  })

  describe('getBooklists', () => {
    it('should return booklist list when API call succeeds', async () => {
      // Arrange
      const mockData = createMockBooklists(3)
      vi.mocked(http.get).mockResolvedValue(mockData)

      // Act
      const result = await booklistApi.getBooklists({ page: 1, pageSize: 10 })

      // Assert
      expect(result).toEqual(mockData)
      expect(http.get).toHaveBeenCalledWith('/booklist', {
        params: { page: 1, pageSize: 10 }
      })
    })

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error')
      vi.mocked(http.get).mockRejectedValue(mockError)

      // Act & Assert
      await expect(
        booklistApi.getBooklists({ page: 1, pageSize: 10 })
      ).rejects.toThrow('Network error')
    })
  })
})
```

---

## 3. 测试命名规范

### 3.1 文件命名

| 文件类型 | 命名规范 | 示例 |
|---------|---------|------|
| 测试文件 | `*.spec.ts` 或 `*.test.ts` | `BooklistCard.spec.ts` |
| API测试 | `*.api.spec.ts` | `booklist.api.spec.ts` |
| Store测试 | `*.store.spec.ts` | `booklist.store.spec.ts` |
| 组件测试 | `*.component.spec.ts` | `BooklistCard.component.spec.ts` |
| 视图测试 | `*.view.spec.ts` | `BookListsView.spec.ts` |

### 3.2 测试描述命名

#### 描述性命名（推荐）

```typescript
// ✅ 正确：清晰的描述
it('should return user data when credentials are valid', () => {})
it('should throw error when user not found', () => {})
it('should update booklist when data is valid', () => {})
```

#### 命名模式

使用`should [期望结果] when [条件]`模式：

```typescript
it('should redirect to login when user is not authenticated', () => {})
it('should show error message when API call fails', () => {})
it('should save data to localStorage when form is submitted', () => {})
```

### 3.3 Describe块命名

```typescript
// ✅ 正确：按功能分组
describe('BooklistService', () => {
  describe('getBooklists', () => {
    it('should return booklist list', () => {})
    it('should handle errors', () => {})
  })

  describe('createBooklist', () => {
    it('should create new booklist', () => {})
  })
})
```

---

## 4. Mock策略

### 4.1 Mock原则

1. **Mock外部依赖**：API、数据库、文件系统等
2. **不要Mock简单函数**：纯函数不需要mock
3. **使用vi.mocked**：确保类型安全

### 4.2 API Mock

```typescript
// ✅ 正确：使用vi.mocked
import { httpService } from '@/services/http.service'

vi.mock('@/services/http.service', () => ({
  httpService: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// 使用mock
vi.mocked(httpService.get).mockResolvedValue(mockData)

// ✅ 正确：使用辅助工具
import { mockSuccessApiCall, mockErrorApiCall } from '@/tests/utils/api-mock'

vi.mocked(booklistApi.getBooklists).mockImplementation(
  mockSuccessApiCall(mockData)
)
```

### 4.3 组件Mock

```typescript
// ✅ 正确：Mock子组件
import { mount } from '@vue/test-utils'

const wrapper = mount(Component, {
  global: {
    stubs: {
      // 完全stub
      'router-link': true,
      // stub并保留内容
      'el-button': { template: '<button><slot /></button>' },
    },
  },
})
```

### 4.4 Router Mock

```typescript
import { mockRouter, mockRoute } from '@/tests/utils/api-mock'

const router = mockRouter()
const route = mockRoute({ path: '/booklist/1' })

wrapper = mount(Component, {
  global: {
    mocks: {
      $router: router,
      $route: route,
    },
  },
})
```

### 4.5 定时器Mock

```typescript
// 使用fake timers
vi.useFakeTimers()

// 执行所有定时器
await vi.runAllTimersAsync()

// 执行指定时间的定时器
await vi.advanceTimersByTimeAsync(1000)

// 恢复真实定时器
vi.useRealTimers()
```

---

## 5. 测试编写指南

### 5.1 API测试

```typescript
describe('booklistApi.getBooklists', () => {
  it('should return booklist list', async () => {
    // Arrange
    const params = { page: 1, pageSize: 10 }
    const expectedData = createMockBooklists(10)
    vi.mocked(httpService.get).mockResolvedValue(expectedData)

    // Act
    const result = await booklistApi.getBooklists(params)

    // Assert
    expect(result).toEqual(expectedData)
    expect(httpService.get).toHaveBeenCalledTimes(1)
  })

  it('should handle errors', async () => {
    // Arrange
    const error = new Error('Network error')
    vi.mocked(httpService.get).mockRejectedValue(error)

    // Act & Assert
    await expect(booklistApi.getBooklists({})).rejects.toThrow('Network error')
  })
})
```

### 5.2 Store测试

```typescript
describe('useBooklistStore', () => {
  beforeEach(() => {
    // 创建新的store实例
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with correct state', () => {
    // Act
    const store = useBooklistStore()

    // Assert
    expect(store.booklists).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('should fetch booklists', async () => {
    // Arrange
    const mockData = createMockBooklists(3)
    vi.mocked(booklistApi.getBooklists).mockResolvedValue(mockData)
    const store = useBooklistStore()

    // Act
    await store.fetchBooklists({ page: 1, pageSize: 10 })

    // Assert
    expect(store.booklists).toEqual(mockData)
    expect(store.loading).toBe(false)
    expect(booklistApi.getBooklists).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
  })
})
```

### 5.3 组件测试

```typescript
describe('BooklistCard', () => {
  it('should render booklist info', () => {
    // Arrange
    const booklist = createMockBooklist()

    // Act
    const wrapper = mount(BooklistCard, {
      props: { booklist },
    })

    // Assert
    expect(wrapper.text()).toContain(booklist.title)
    expect(wrapper.text()).toContain(booklist.creatorName)
  })

  it('should emit click event when clicked', async () => {
    // Arrange
    const booklist = createMockBooklist()
    const wrapper = mount(BooklistCard, {
      props: { booklist },
    })

    // Act
    await wrapper.trigger('click')

    // Assert
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([booklist])
  })
})
```

### 5.4 异步测试

```typescript
it('should handle async operations', async () => {
  // Arrange
  const mockData = createMockBooklists(3)
  vi.mocked(api.getBooklists).mockImplementation(
    () => new Promise(resolve => {
      setTimeout(() => resolve(mockData), 100)
    })
  )

  // Act
  const promise = store.fetchBooklists()

  // Assert: loading状态
  expect(store.loading).toBe(true)

  // 等待完成
  await promise

  // Assert: 完成状态
  expect(store.loading).toBe(false)
  expect(store.booklists).toEqual(mockData)
})
```

---

## 6. 覆盖率要求

### 6.1 覆盖率目标

| 层级 | 目标覆盖率 |
|------|-----------|
| 组件 | ≥80% |
| Composables | ≥85% |
| Utils | ≥90% |
| API/Services | ≥75% |
| 总体 | ≥50% |

### 6.2 查看覆盖率

```bash
# 运行测试并生成覆盖率报告
npm run test:coverage

# 查看HTML报告
open coverage/index.html
```

### 6.3 覆盖率配置

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  thresholds: {
    statements: 50,
    branches: 50,
    functions: 50,
    lines: 50
  }
}
```

---

## 7. 常见问题

### 7.1 测试运行缓慢

**问题**：测试运行时间过长

**解决方案**：
- 使用`vi.useFakeTimers()`代替真实定时器
- 使用`vi.mock()`代替真实API调用
- 减少不必要的等待时间

```typescript
// ❌ 错误：使用真实定时器
await new Promise(resolve => setTimeout(resolve, 1000))

// ✅ 正确：使用fake timers
vi.useFakeTimers()
await vi.runAllTimersAsync()
```

### 7.2 测试不稳定

**问题**：测试有时通过，有时失败

**解决方案**：
- 确保测试之间独立
- 在`beforeEach`中清理状态
- 避免依赖执行顺序

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  setActivePinia(createPinia())
})
```

### 7.3 Mock不生效

**问题**：Mock的函数没有被调用

**解决方案**：
- 确保mock在import之前
- 使用`vi.mocked()`确保类型正确
- 检查mock路径是否正确

```typescript
// ✅ 正确：在文件顶部mock
vi.mock('@/api/booklist', () => ({
  booklistApi: {
    getBooklists: vi.fn(),
  },
}))

import { booklistApi } from '@/api/booklist'
```

### 7.4 组件交互测试失败

**问题**：无法触发组件事件

**解决方案**：
- 使用`await`等待DOM更新
- 使用`wrapper.vm.$nextTick()`
- 检查事件名称是否正确

```typescript
// ✅ 正确：等待DOM更新
await wrapper.trigger('click')
await wrapper.vm.$nextTick()
expect(wrapper.emitted('click')).toBeTruthy()
```

---

## 快速参考

### 常用命令

```bash
# 运行所有测试
npm run test

# 运行测试并监听变化
npm run test:watch

# 运行测试并生成覆盖率
npm run test:coverage

# 运行特定测试文件
npm run test BooklistCard.spec.ts
```

### 导入路径

```typescript
// 测试工具
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// 项目文件
import { booklistApi } from '@/api/booklist'
import { useBooklistStore } from '@/modules/booklist/stores/booklist.store'
import BooklistCard from '@/modules/booklist/components/BooklistCard.vue'

// 测试辅助工具
import { createMockBooklist } from '@/tests/fixtures/booklist.fixtures'
import { mockSuccessApiCall } from '@/tests/utils/api-mock'
```

---

**维护者**: 前端团队
**最后更新**: 2026-01-28
**版本**: v1.0
