/**
 * 书架API契约测试
 * @description 验证 bookshelfAPI 与后端 /api/v1/reader/books 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bookshelfAPI, BookshelfBook, BookshelfParams } from '@/modules/reader/api/manual/books'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('bookshelfAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟书架书籍数据
  const mockBookshelfBook: BookshelfBook = {
    id: 'book-123',
    title: '测试书籍',
    author: '测试作者',
    category: '玄幻',
    status: 'serializing',
    totalChapters: 100,
    updatedAt: '2024-01-01T00:00:00Z'
  }

  // 模拟分页响应
  const createMockPaginatedResponse = <T>(data: T[], total: number = data.length) => ({
    code: 200,
    message: 'success',
    data,
    pagination: {
      total,
      page: 1,
      pageSize: 10,
      totalPages: Math.ceil(total / 10),
      hasNext: total > 10,
      hasPrev: false
    },
    timestamp: Date.now()
  })

  // 模拟API响应
  const createMockAPIResponse = <T>(data: T) => ({
    code: 200,
    message: 'success',
    data,
    timestamp: Date.now()
  })

  describe('getBookshelf', () => {
    it('应该发送正确的GET请求获取书架列表', async () => {
      const mockResponse = createMockPaginatedResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getBookshelf()

      expect(httpService.get).toHaveBeenCalledWith('/reader/books', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递查询参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: BookshelfParams = {
        page: 2,
        pageSize: 20,
        status: 'reading',
        sortBy: 'lastReadTime'
      }
      await bookshelfAPI.getBookshelf(params)

      expect(httpService.get).toHaveBeenCalledWith('/reader/books', { params })
    })

    it('应该正确处理空书架响应', async () => {
      const mockResponse = createMockPaginatedResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getBookshelf()

      expect(httpService.get).toHaveBeenCalledWith('/reader/books', { params: undefined })
      expect(result.data).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('getRecentReading', () => {
    it('应该发送正确的GET请求获取最近阅读', async () => {
      const mockResponse = createMockAPIResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getRecentReading()

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/recent', {
        params: { limit: 10 }
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递limit参数', async () => {
      const mockResponse = createMockAPIResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await bookshelfAPI.getRecentReading(5)

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/recent', {
        params: { limit: 5 }
      })
    })

    it('应该正确处理空最近阅读响应', async () => {
      const mockResponse = createMockAPIResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getRecentReading()

      expect(result.data).toHaveLength(0)
    })
  })

  describe('getUnfinishedBooks', () => {
    it('应该发送正确的GET请求获取未读书籍', async () => {
      const mockResponse = createMockPaginatedResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getUnfinishedBooks()

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/unfinished', {
        params: undefined
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await bookshelfAPI.getUnfinishedBooks({ page: 2, pageSize: 15 })

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/unfinished', {
        params: { page: 2, pageSize: 15 }
      })
    })
  })

  describe('getFinishedBooks', () => {
    it('应该发送正确的GET请求获取已读书籍', async () => {
      const mockResponse = createMockPaginatedResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.getFinishedBooks()

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/finished', {
        params: undefined
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockBookshelfBook])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await bookshelfAPI.getFinishedBooks({ page: 1, pageSize: 25 })

      expect(httpService.get).toHaveBeenCalledWith('/reader/books/finished', {
        params: { page: 1, pageSize: 25 }
      })
    })
  })

  describe('addToBookshelf', () => {
    it('应该发送正确的POST请求添加书籍到书架', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await bookshelfAPI.addToBookshelf(bookId)

      expect(httpService.post).toHaveBeenCalledWith(`/reader/books/${bookId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('removeFromBookshelf', () => {
    it('应该发送正确的DELETE请求从书架移除书籍', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await bookshelfAPI.removeFromBookshelf(bookId)

      expect(httpService.delete).toHaveBeenCalledWith(`/reader/books/${bookId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('updateBookStatus', () => {
    it('应该发送正确的PUT请求更新书籍状态为reading', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await bookshelfAPI.updateBookStatus(bookId, 'reading')

      expect(httpService.put).toHaveBeenCalledWith(`/reader/books/${bookId}/status`, {
        status: 'reading'
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该发送正确的PUT请求更新书籍状态为want_read', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const bookId = 'book-456'
      await bookshelfAPI.updateBookStatus(bookId, 'want_read')

      expect(httpService.put).toHaveBeenCalledWith(`/reader/books/${bookId}/status`, {
        status: 'want_read'
      })
    })

    it('应该发送正确的PUT请求更新书籍状态为finished', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const bookId = 'book-789'
      await bookshelfAPI.updateBookStatus(bookId, 'finished')

      expect(httpService.put).toHaveBeenCalledWith(`/reader/books/${bookId}/status`, {
        status: 'finished'
      })
    })
  })

  describe('batchUpdateBookStatus', () => {
    it('应该发送正确的PUT请求批量更新书籍状态', async () => {
      const mockResponse = createMockAPIResponse({ count: 3 })
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const bookIds = ['book-1', 'book-2', 'book-3']
      const result = await bookshelfAPI.batchUpdateBookStatus(bookIds, 'reading')

      expect(httpService.put).toHaveBeenCalledWith('/reader/books/batch/status', {
        bookIds,
        status: 'reading'
      })
      expect(result).toEqual(mockResponse)
      expect(result.data?.count).toBe(3)
    })

    it('应该正确处理空书籍ID数组', async () => {
      const mockResponse = createMockAPIResponse({ count: 0 })
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const result = await bookshelfAPI.batchUpdateBookStatus([], 'finished')

      expect(httpService.put).toHaveBeenCalledWith('/reader/books/batch/status', {
        bookIds: [],
        status: 'finished'
      })
      expect(result.data?.count).toBe(0)
    })
  })
})
