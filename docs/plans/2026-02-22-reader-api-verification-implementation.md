# Reader模块API验证实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 验证Reader模块书架API的前端调用与后端接口契约一致性

**Architecture:** 使用Vitest + vi.mock()模拟httpService，验证API请求格式和响应解析。测试分为API层测试（验证调用契约）和E2E测试（验证真实后端交互）。

**Tech Stack:** Vitest, vi.mock(), @testing-library/vue, Playwright

---

## Phase 1: P0 书架核心API测试

### Task 1: 创建测试目录结构

**Files:**

- Create: `tests/unit/api/reader/` 目录
- Create: `tests/unit/api/reader/books.api.spec.ts`

**Step 1: 创建目录和测试文件**

```bash
mkdir -p tests/unit/api/reader
```

**Step 2: 创建基础测试文件**

创建文件 `tests/unit/api/reader/books.api.spec.ts`:

```typescript
/**
 * 书架API契约测试
 * @description 验证 bookshelfAPI 与后端 /api/v1/reader/books 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookshelfAPI, BookshelfBook } from '@/modules/reader/api/manual/books'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('bookshelfAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBookshelf', () => {
    // B-001: 获取书架列表-成功
    it('应该发送正确的GET请求获取书架列表', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              id: 'book-1',
              title: '测试书籍',
              author: '测试作者',
              category: '玄幻',
              status: 'serializing',
              totalChapters: 100,
              updatedAt: '2024-01-01T00:00:00Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getBookshelf({ page: 1, pageSize: 10 })

      expect(httpService.get).toHaveBeenCalledWith('/reader/books', {
        params: { page: 1, pageSize: 10 },
      })
      expect(result.data.items).toHaveLength(1)
    })

    // B-002: 获取书架列表-空书架
    it('应该正确处理空书架响应', async () => {
      const mockResponse = {
        data: {
          items: [],
          total: 0,
          page: 1,
          pageSize: 10,
        },
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getBookshelf()

      expect(result.data.items).toEqual([])
      expect(result.data.total).toBe(0)
    })
  })

  describe('addToBookshelf', () => {
    // B-003: 添加到书架-成功
    it('应该发送正确的POST请求添加书籍到书架', async () => {
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
        },
      }
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await bookshelfAPI.addToBookshelf(bookId)

      expect(httpService.post).toHaveBeenCalledWith('/reader/books/book-123')
      expect(result.data.code).toBe(0)
    })
  })

  describe('removeFromBookshelf', () => {
    // B-006: 从书架移除-成功
    it('应该发送正确的DELETE请求移除书籍', async () => {
      const mockResponse = {
        data: {
          code: 0,
          message: 'success',
        },
      }
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await bookshelfAPI.removeFromBookshelf(bookId)

      expect(httpService.delete).toHaveBeenCalledWith('/reader/books/book-123')
      expect(result.data.code).toBe(0)
    })
  })

  describe('updateBookStatus', () => {
    // B-008: 更新阅读状态-在读
    it('应该发送正确的PUT请求更新状态为在读', async () => {
      const mockResponse = {
        data: { code: 0, message: 'success' },
      }
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.updateBookStatus('book-1', 'reading')

      expect(httpService.put).toHaveBeenCalledWith('/reader/books/book-1/status', {
        status: 'reading',
      })
      expect(result.data.code).toBe(0)
    })

    // B-009: 更新阅读状态-想读
    it('应该发送正确的PUT请求更新状态为想读', async () => {
      const mockResponse = {
        data: { code: 0, message: 'success' },
      }
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await bookshelfAPI.updateBookStatus('book-1', 'want_read')

      expect(httpService.put).toHaveBeenCalledWith('/reader/books/book-1/status', {
        status: 'want_read',
      })
    })

    // B-010: 更新阅读状态-读完
    it('应该发送正确的PUT请求更新状态为读完', async () => {
      const mockResponse = {
        data: { code: 0, message: 'success' },
      }
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await bookshelfAPI.updateBookStatus('book-1', 'finished')

      expect(httpService.put).toHaveBeenCalledWith('/reader/books/book-1/status', {
        status: 'finished',
      })
    })
  })

  describe('batchUpdateBookStatus', () => {
    // B-011: 批量更新状态
    it('应该发送正确的PUT请求批量更新状态', async () => {
      const mockResponse = {
        data: { code: 0, data: { count: 3 } },
      }
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const bookIds = ['book-1', 'book-2', 'book-3']
      const result = await bookshelfAPI.batchUpdateBookStatus(bookIds, 'finished')

      expect(httpService.put).toHaveBeenCalledWith('/reader/books/batch/status', {
        bookIds,
        status: 'finished',
      })
      expect(result.data.data.count).toBe(3)
    })
  })

  describe('getRecentReading', () => {
    it('应该发送正确的GET请求获取最近阅读', async () => {
      const mockResponse = {
        data: {
          code: 0,
          data: [],
        },
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await bookshelfAPI.getRecentReading(5)

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/recent', {
        params: { limit: 5 },
      })
    })
  })

  describe('getUnfinishedBooks', () => {
    it('应该发送正确的GET请求获取未读完书籍', async () => {
      const mockResponse = {
        data: { items: [], total: 0, page: 1, pageSize: 10 },
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await bookshelfAPI.getUnfinishedBooks({ page: 1, pageSize: 20 })

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/unfinished', {
        params: { page: 1, pageSize: 20 },
      })
    })
  })

  describe('getFinishedBooks', () => {
    it('应该发送正确的GET请求获取已读完书籍', async () => {
      const mockResponse = {
        data: { items: [], total: 0, page: 1, pageSize: 10 },
      }
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await bookshelfAPI.getFinishedBooks({ page: 2, pageSize: 15 })

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/finished', {
        params: { page: 2, pageSize: 15 },
      })
    })
  })
})
```

**Step 3: 运行测试验证**

```bash
npm run test:vitest run tests/unit/api/reader/books.api.spec.ts
```

Expected: 所有测试通过

**Step 4: Commit**

```bash
git add tests/unit/api/reader/books.api.spec.ts
git commit -m "test(reader): 添加书架API契约测试 (P0)"
```

---

### Task 2: 添加错误处理测试用例

**Files:**

- Modify: `tests/unit/api/reader/books.api.spec.ts`

**Step 1: 在测试文件末尾添加错误处理测试**

在 `describe('bookshelfAPI', () => {` 块内末尾添加：

```typescript
describe('错误处理', () => {
  // B-004: 添加到书架-重复添加
  it('应该正确处理重复添加书籍的错误', async () => {
    const mockError = {
      response: {
        data: {
          code: 409,
          message: '书籍已在书架中',
        },
      },
    }
    vi.mocked(httpService.post).mockRejectedValue(mockError)

    await expect(bookshelfAPI.addToBookshelf('book-1')).rejects.toEqual(mockError)
  })

  // B-005: 添加到书架-未登录
  it('应该正确处理未登录错误', async () => {
    const mockError = {
      response: {
        data: {
          code: 401,
          message: '请先登录',
        },
      },
    }
    vi.mocked(httpService.post).mockRejectedValue(mockError)

    await expect(bookshelfAPI.addToBookshelf('book-1')).rejects.toEqual(mockError)
  })

  // B-007: 从书架移除-不存在
  it('应该正确处理移除不存在书籍的错误', async () => {
    const mockError = {
      response: {
        data: {
          code: 404,
          message: '书籍不在书架中',
        },
      },
    }
    vi.mocked(httpService.delete).mockRejectedValue(mockError)

    await expect(bookshelfAPI.removeFromBookshelf('nonexistent')).rejects.toEqual(mockError)
  })
})
```

**Step 2: 运行测试验证**

```bash
npm run test:vitest run tests/unit/api/reader/books.api.spec.ts
```

Expected: 所有测试通过（包括错误处理测试）

**Step 3: Commit**

```bash
git add tests/unit/api/reader/books.api.spec.ts
git commit -m "test(reader): 添加书架API错误处理测试用例"
```

---

### Task 3: 添加书架状态检查测试

**Files:**

- Modify: `tests/unit/api/reader/books.api.spec.ts`

**Step 1: 检查books.ts是否有检查状态的API**

如果没有，需要先在后端添加。根据设计文档，检查书籍状态可能需要：

- 方案A: 通过getBookshelf返回的列表判断
- 方案B: 添加专门的isInShelf(bookId)接口

**Step 2: 如果需要添加新API，在 `src/modules/reader/api/manual/books.ts` 添加：**

```typescript
  /**
   * 检查书籍是否在书架中
   * @description 检查指定书籍是否在用户的书架中
   * @endpoint GET /api/v1/reader/books/:bookId/status
   */
  async checkBookStatus(bookId: string): Promise<APIResponse<{ isInShelf: boolean; status?: string }>> {
    return httpService.get<APIResponse<{ isInShelf: boolean; status?: string }>>(`/reader/books/${bookId}/status`)
  }
```

**Step 3: 添加测试用例**

```typescript
describe('checkBookStatus', () => {
  // B-012: 检查书籍状态-已加入
  it('应该返回书籍已在书架的状态', async () => {
    const mockResponse = {
      data: {
        code: 0,
        data: { isInShelf: true, status: 'reading' },
      },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const result = await bookshelfAPI.checkBookStatus('book-1')

    expect(httpService.get).toHaveBeenCalledWith('/reader/books/book-1/status')
    expect(result.data.data.isInShelf).toBe(true)
  })

  // B-013: 检查书籍状态-未加入
  it('应该返回书籍不在书架的状态', async () => {
    const mockResponse = {
      data: {
        code: 0,
        data: { isInShelf: false },
      },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const result = await bookshelfAPI.checkBookStatus('book-999')

    expect(result.data.data.isInShelf).toBe(false)
  })
})
```

**Step 4: 运行测试并提交**

```bash
npm run test:vitest run tests/unit/api/reader/books.api.spec.ts
git add .
git commit -m "feat(reader): 添加书架状态检查API及测试"
```

---

## Phase 2: P0 E2E测试

### Task 4: 创建书架E2E测试文件

**Files:**

- Create: `tests/e2e/reader/bookshelf.spec.ts`

**Step 1: 创建测试文件**

```typescript
/**
 * 书架功能E2E测试
 * @description 验证书架核心用户流程
 */

import { test, expect } from '@playwright/test'

test.describe('书架功能', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到首页
    await page.goto('/')
  })

  // E-B01: 添加书籍到书架
  test('应该能够添加书籍到书架', async ({ page }) => {
    // 登录（使用测试账号）
    await page.goto('/login')
    await page.fill('[data-testid="username"]', 'test_reader')
    await page.fill('[data-testid="password"]', 'test123456')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/')

    // 进入书籍详情页
    await page.goto('/bookstore/books/book-1')

    // 点击"加入书架"按钮
    const addButton = page.locator('[data-testid="add-to-bookshelf"]')
    await expect(addButton).toBeVisible()
    await addButton.click()

    // 验证Toast提示
    await expect(page.locator('.el-message--success')).toBeVisible()

    // 验证按钮状态变为"已在书架"
    await expect(page.locator('[data-testid="in-bookshelf"]')).toBeVisible()
  })

  // E-B02: 验证书架列表
  test('书架列表应该显示已添加的书籍', async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.fill('[data-testid="username"]', 'test_reader')
    await page.fill('[data-testid="password"]', 'test123456')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/')

    // 进入书架页面
    await page.goto('/reading/bookshelf')

    // 验证书架列表加载
    await expect(page.locator('[data-testid="bookshelf-list"]')).toBeVisible()

    // 验证至少有一本书籍
    const books = page.locator('[data-testid="bookshelf-item"]')
    await expect(books.first()).toBeVisible()
  })

  // E-B03: 修改阅读状态
  test('应该能够修改书籍阅读状态', async ({ page }) => {
    // 登录并进入书架
    await page.goto('/login')
    await page.fill('[data-testid="username"]', 'test_reader')
    await page.fill('[data-testid="password"]', 'test123456')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/')
    await page.goto('/reading/bookshelf')

    // 选择第一本书
    const firstBook = page.locator('[data-testid="bookshelf-item"]').first()
    await firstBook.hover()

    // 点击状态菜单
    await firstBook.locator('[data-testid="status-menu"]').click()

    // 选择"读完"
    await page.click('[data-testid="status-finished"]')

    // 验证状态更新
    await expect(page.locator('.el-message--success')).toBeVisible()
  })

  // E-B04: 从书架移除
  test('应该能够从书架移除书籍', async ({ page }) => {
    // 登录并进入书架
    await page.goto('/login')
    await page.fill('[data-testid="username"]', 'test_reader')
    await page.fill('[data-testid="password"]', 'test123456')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/')
    await page.goto('/reading/bookshelf')

    // 选择书籍并移除
    const firstBook = page.locator('[data-testid="bookshelf-item"]').first()
    await firstBook.hover()
    await firstBook.locator('[data-testid="remove-button"]').click()

    // 确认移除
    await page.click('[data-testid="confirm-remove"]')

    // 验证移除成功
    await expect(page.locator('.el-message--success')).toBeVisible()
  })
})
```

**Step 2: 运行E2E测试（需要后端服务）**

```bash
npm run test:e2e -- tests/e2e/reader/bookshelf.spec.ts
```

**Step 3: Commit**

```bash
git add tests/e2e/reader/bookshelf.spec.ts
git commit -m "test(e2e): 添加书架功能E2E测试 (P0)"
```

---

## Phase 3: P1 阅读流程API测试

### Task 5: 创建阅读进度API测试

**Files:**

- Create: `tests/unit/api/reader/progress.api.spec.ts`
- Create: `tests/unit/api/reader/chapters.api.spec.ts`
- Create: `tests/unit/api/reader/history.api.spec.ts`

**Step 1: 创建进度API测试**

文件: `tests/unit/api/reader/progress.api.spec.ts`

```typescript
/**
 * 阅读进度API契约测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { progressAPI } from '@/modules/reader/api/manual/progress'
import { httpService } from '@/core/services/http.service'

vi.mock('@/core/services/http.service')

describe('progressAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // P-001: 保存阅读进度
  it('应该发送正确的POST请求保存阅读进度', async () => {
    const mockResponse = {
      data: { code: 0, message: 'success' },
    }
    vi.mocked(httpService.post).mockResolvedValue(mockResponse)

    await progressAPI.saveProgress({
      book_id: 'book-1',
      chapter_id: 'chapter-5',
      progress_percent: 65.5,
      read_duration: 300,
    })

    expect(httpService.post).toHaveBeenCalledWith('/reader/progress', {
      book_id: 'book-1',
      chapter_id: 'chapter-5',
      progress_percent: 65.5,
      read_duration: 300,
    })
  })

  // P-002: 获取单本书进度
  it('应该发送正确的GET请求获取阅读进度', async () => {
    const mockResponse = {
      data: {
        code: 0,
        data: {
          bookId: 'book-1',
          chapterId: 'chapter-5',
          progressPercent: 65.5,
          lastReadTime: Date.now(),
          readDuration: 3600,
        },
      },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const result = await progressAPI.getProgress('book-1')

    expect(httpService.get).toHaveBeenCalledWith('/reader/progress/book-1')
    expect(result.data.data.progressPercent).toBe(65.5)
  })

  // P-003: 获取阅读统计
  it('应该发送正确的GET请求获取阅读统计', async () => {
    const mockResponse = {
      data: {
        code: 0,
        data: {
          totalDuration: 72000,
          totalWords: 500000,
          continuousDays: 7,
        },
      },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const result = await progressAPI.getStatistics()

    expect(httpService.get).toHaveBeenCalledWith('/reader/progress/statistics')
    expect(result.data.data.continuousDays).toBe(7)
  })
})
```

**Step 2: 创建章节API测试**

文件: `tests/unit/api/reader/chapters.api.spec.ts`

```typescript
/**
 * 章节API契约测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chaptersAPI } from '@/modules/reader/api/manual/chapters'
import { httpService } from '@/core/services/http.service'

vi.mock('@/core/services/http.service')

describe('chaptersAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // C-001: 获取章节列表
  it('应该发送正确的GET请求获取章节列表', async () => {
    const mockResponse = {
      data: {
        code: 0,
        data: [
          { id: 'ch-1', title: '第一章', chapterNumber: 1 },
          { id: 'ch-2', title: '第二章', chapterNumber: 2 },
        ],
      },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const result = await chaptersAPI.getChapters('book-1')

    expect(httpService.get).toHaveBeenCalledWith('/reader/books/book-1/chapters')
    expect(result.data.data).toHaveLength(2)
  })

  // C-002: 获取章节内容
  it('应该发送正确的GET请求获取章节内容', async () => {
    const mockResponse = {
      data: {
        code: 0,
        data: {
          id: 'ch-1',
          title: '第一章',
          content: '<p>章节内容...</p>',
          wordCount: 2000,
        },
      },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const result = await chaptersAPI.getChapterContent('ch-1')

    expect(httpService.get).toHaveBeenCalledWith('/bookstore/chapters/ch-1/content')
    expect(result.data.data.wordCount).toBe(2000)
  })

  // C-003: 上一章导航
  it('应该发送正确的GET请求获取上一章', async () => {
    const mockResponse = {
      data: { code: 0, data: { chapterId: 'ch-1' } },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    await chaptersAPI.getPrevChapter('book-1', 'ch-2')

    expect(httpService.get).toHaveBeenCalledWith('/reader/books/book-1/chapters/ch-2/prev')
  })

  // C-004: 下一章导航
  it('应该发送正确的GET请求获取下一章', async () => {
    const mockResponse = {
      data: { code: 0, data: { chapterId: 'ch-3' } },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    await chaptersAPI.getNextChapter('book-1', 'ch-2')

    expect(httpService.get).toHaveBeenCalledWith('/reader/books/book-1/chapters/ch-2/next')
  })
})
```

**Step 3: 创建历史API测试**

文件: `tests/unit/api/reader/history.api.spec.ts`

```typescript
/**
 * 阅读历史API契约测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { historyAPI } from '@/modules/reader/api/manual/history'
import { httpService } from '@/core/services/http.service'

vi.mock('@/core/services/http.service')

describe('historyAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // H-001: 记录阅读历史
  it('应该发送正确的POST请求记录阅读历史', async () => {
    const mockResponse = {
      data: { code: 0, message: 'success' },
    }
    vi.mocked(httpService.post).mockResolvedValue(mockResponse)

    await historyAPI.recordHistory({
      bookId: 'book-1',
      chapterId: 'ch-5',
    })

    expect(httpService.post).toHaveBeenCalledWith('/reader/reading-history', {
      bookId: 'book-1',
      chapterId: 'ch-5',
    })
  })

  // H-002: 获取历史列表
  it('应该发送正确的GET请求获取历史列表', async () => {
    const mockResponse = {
      data: {
        code: 0,
        data: [{ id: 'h-1', bookId: 'book-1', readTime: Date.now() }],
      },
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const result = await historyAPI.getHistory({ page: 1, pageSize: 10 })

    expect(httpService.get).toHaveBeenCalledWith('/reader/reading-history', {
      params: { page: 1, pageSize: 10 },
    })
    expect(result.data.data).toHaveLength(1)
  })

  // H-003: 删除历史记录
  it('应该发送正确的DELETE请求删除历史记录', async () => {
    const mockResponse = {
      data: { code: 0, message: 'success' },
    }
    vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

    await historyAPI.deleteHistory('h-1')

    expect(httpService.delete).toHaveBeenCalledWith('/reader/reading-history/h-1')
  })
})
```

**Step 4: 运行所有P1测试**

```bash
npm run test:vitest run tests/unit/api/reader/
```

**Step 5: Commit**

```bash
git add tests/unit/api/reader/
git commit -m "test(reader): 添加P1阅读流程API契约测试"
```

---

## Phase 4: 生成验证报告

### Task 6: 执行测试并生成报告

**Step 1: 运行所有单元测试并生成覆盖率报告**

```bash
npm run test:coverage -- tests/unit/api/reader/
```

**Step 2: 创建验证报告**

文件: `docs/reports/2026-02-22-reader-api-verification-report.md`

```markdown
# Reader模块API验证报告 - P0/P1阶段

## 1. 测试执行摘要

| 阶段        | 单元测试 | 通过 | 失败 | 覆盖率 |
| ----------- | -------- | ---- | ---- | ------ |
| P0 书架核心 | 13       | -    | -    | -%     |
| P1 阅读流程 | 10       | -    | -    | -%     |
| **总计**    | **23**   | -    | -    | -%     |

## 2. API契约验证结果

| API                            | 请求格式 | 响应格式 | 状态 |
| ------------------------------ | -------- | -------- | ---- |
| GET /reader/books              | -        | -        | -    |
| POST /reader/books/:id         | -        | -        | -    |
| DELETE /reader/books/:id       | -        | -        | -    |
| PUT /reader/books/:id/status   | -        | -        | -    |
| GET /reader/progress           | -        | -        | -    |
| GET /reader/books/:id/chapters | -        | -        | -    |
| GET /reader/reading-history    | -        | -        | -    |

## 3. 发现的问题

（执行测试后填写）

## 4. 下一步行动

- [ ] 修复发现的问题
- [ ] 继续P2社交功能测试
- [ ] 继续P3推荐系统测试
```

**Step 3: Commit报告**

```bash
git add docs/reports/
git commit -m "docs: 添加Reader模块API验证报告"
```

---

## 检查点

### P0阶段完成标准

- [ ] 书架API所有13个单元测试通过
- [ ] 覆盖率 ≥ 80%
- [ ] E2E测试场景可执行（需后端）
- [ ] 无阻塞性问题

### P1阶段完成标准

- [ ] 进度/章节/历史API测试通过
- [ ] 覆盖率 ≥ 75%
- [ ] 验证报告已生成

---

## 注意事项

1. **测试数据隔离**: 使用独立的测试账号，避免影响真实数据
2. **后端依赖**: E2E测试需要后端服务运行，单元测试可独立执行
3. **类型一致性**: 确保测试中的响应结构与 `reader.types.ts` 定义一致
4. **提交规范**: 每个Task完成后单独提交，便于回滚和审查
