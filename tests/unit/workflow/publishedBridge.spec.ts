import { beforeEach, describe, expect, it, vi } from 'vitest'
import { shouldUsePublishedBridge } from '@/modules/workflow/publishedBridge'

const STORAGE_KEY = 'qingyu:workflow:published-books:v1'
const storage = new Map<string, string>()

const localStorageMock = {
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storage.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
    storage.delete(key)
  }),
  clear: vi.fn(() => {
    storage.clear()
  }),
}

describe('publishedBridge', () => {
  beforeEach(() => {
    storage.clear()
    vi.stubGlobal('localStorage', localStorageMock)
  })

  it('在本地 bridge 缺数据时不进入 published 模式', () => {
    expect(shouldUsePublishedBridge('published', 'backend-book-id')).toBe(false)
  })

  it('只有 source=published 且本地存在 bridge 数据时才进入 published 模式', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        'bridge-book-id': {
          book: {
            id: 'bridge-book-id',
            title: '桥接书籍',
            author: '测试作者',
            cover: '',
            description: '',
            tags: [],
            category: '测试',
            categoryName: '测试',
            status: 'serializing',
            wordCount: 1234,
            chapterCount: 1,
            rating: 0,
            viewCount: 0,
            favoriteCount: 0,
            lastUpdateTime: '2026-04-15T00:00:00.000Z',
          },
          chapters: [],
        },
      }),
    )

    expect(shouldUsePublishedBridge('published', 'bridge-book-id')).toBe(true)
    expect(shouldUsePublishedBridge('preview', 'bridge-book-id')).toBe(false)
  })
})
