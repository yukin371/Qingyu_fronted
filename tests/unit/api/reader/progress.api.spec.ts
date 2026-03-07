/**
 * 阅读进度API契约测试
 * @description 验证 progressAPI 与后端 /api/v1/reader/progress 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { progressAPI, ReadingProgress, ReadingStats } from '@/modules/reader/api/manual/progress'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('progressAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟API响应
  const createMockAPIResponse = <T>(data: T) => ({
    code: 200,
    message: 'success',
    data,
    timestamp: Date.now()
  })

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

  // 模拟阅读进度数据
  const mockReadingProgress: ReadingProgress = {
    bookId: 'book-123',
    chapterId: 'chapter-456',
    chapterNumber: 10,
    progress: 45,
    lastReadTime: '2024-01-15T10:30:00Z'
  }

  // 模拟阅读统计数据
  const mockReadingStats: ReadingStats = {
    totalBooks: 50,
    finishedBooks: 20,
    unfinishedBooks: 30,
    totalReadingTime: 3600,
    todayReadingTime: 120
  }

  describe('saveReadingProgress', () => {
    // P-001: 保存阅读进度
    it('应该发送正确的POST请求保存阅读进度', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data = {
        bookId: 'book-123',
        chapterId: 'chapter-456',
        chapterNumber: 10,
        progress: 45
      }
      const result = await progressAPI.saveReadingProgress(data)

      expect(httpService.post).toHaveBeenCalledWith('/reader/progress', data)
      expect(result).toEqual(mockResponse)
    })

    // P-001: 保存阅读进度-100%
    it('应该正确处理100%阅读进度', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data = {
        bookId: 'book-123',
        chapterId: 'chapter-789',
        chapterNumber: 100,
        progress: 100
      }
      await progressAPI.saveReadingProgress(data)

      expect(httpService.post).toHaveBeenCalledWith('/reader/progress', data)
    })

    // P-001: 保存阅读进度-0%
    it('应该正确处理0%阅读进度', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data = {
        bookId: 'book-456',
        chapterId: 'chapter-1',
        chapterNumber: 1,
        progress: 0
      }
      await progressAPI.saveReadingProgress(data)

      expect(httpService.post).toHaveBeenCalledWith('/reader/progress', data)
    })
  })

  describe('getReadingProgress', () => {
    // P-002: 获取单本书进度
    it('应该发送正确的GET请求获取阅读进度', async () => {
      const mockResponse = createMockAPIResponse(mockReadingProgress)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await progressAPI.getReadingProgress(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/progress/${bookId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data?.bookId).toBe(bookId)
    })

    // P-002: 获取单本书进度-新书无进度
    it('应该正确处理无阅读进度的情况', async () => {
      const mockResponse = createMockAPIResponse(null)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'new-book-999'
      const result = await progressAPI.getReadingProgress(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/reader/progress/${bookId}`)
      expect(result.data).toBeNull()
    })
  })

  describe('getReadingStats', () => {
    // P-003: 获取阅读统计
    it('应该发送正确的GET请求获取阅读统计', async () => {
      const mockResponse = createMockAPIResponse(mockReadingStats)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await progressAPI.getReadingStats()

      expect(httpService.get).toHaveBeenCalledWith('/reader/progress/stats')
      expect(result).toEqual(mockResponse)
      expect(result.data?.totalBooks).toBe(50)
      expect(result.data?.finishedBooks).toBe(20)
      expect(result.data?.unfinishedBooks).toBe(30)
    })

    // P-003: 获取阅读统计-新用户
    it('应该正确处理新用户的阅读统计', async () => {
      const newUserData = {
        totalBooks: 0,
        finishedBooks: 0,
        unfinishedBooks: 0,
        totalReadingTime: 0,
        todayReadingTime: 0
      }
      const mockResponse = createMockAPIResponse(newUserData)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await progressAPI.getReadingStats()

      expect(result.data?.totalBooks).toBe(0)
      expect(result.data?.totalReadingTime).toBe(0)
    })
  })

  describe('其他进度相关API', () => {
    it('应该正确更新阅读时长', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data = {
        bookId: 'book-123',
        chapterId: 'chapter-456',
        duration: 1800 // 30分钟
      }
      await progressAPI.updateReadingTime(data)

      expect(httpService.post).toHaveBeenCalledWith('/reader/progress/time', data)
    })

    it('应该正确获取最近阅读列表', async () => {
      const mockResponse = createMockAPIResponse([mockReadingProgress])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await progressAPI.getRecentReading()

      expect(httpService.get).toHaveBeenCalledWith('/reader/progress/recent')
      expect(result.data).toHaveLength(1)
    })

    it('应该正确获取阅读历史（分页）', async () => {
      const mockResponse = createMockPaginatedResponse([mockReadingProgress])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await progressAPI.getReadingHistory({ page: 1, pageSize: 10 })

      expect(httpService.get).toHaveBeenCalledWith('/reader/progress/history', {
        params: { page: 1, pageSize: 10 }
      })
      expect(result.pagination.total).toBe(1)
    })

    it('应该正确获取未读完的书籍', async () => {
      const mockResponse = createMockAPIResponse([mockReadingProgress])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await progressAPI.getUnfinishedBooks()

      expect(httpService.get).toHaveBeenCalledWith('/reader/progress/unfinished')
      expect(result.data).toHaveLength(1)
    })

    it('应该正确获取已读完的书籍', async () => {
      const finishedProgress = { ...mockReadingProgress, progress: 100 }
      const mockResponse = createMockAPIResponse([finishedProgress])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await progressAPI.getFinishedBooks()

      expect(httpService.get).toHaveBeenCalledWith('/reader/progress/finished')
      expect(result.data).toHaveLength(1)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理保存进度时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(progressAPI.saveReadingProgress({
        bookId: 'book-1',
        chapterId: 'chapter-1',
        chapterNumber: 1,
        progress: 50
      })).rejects.toEqual(mockError)
    })

    it('应该正确处理获取进度时的书籍不存在错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '书籍不存在'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(progressAPI.getReadingProgress('nonexistent-book')).rejects.toEqual(mockError)
    })
  })
})
