/**
 * 阅读历史API契约测试
 * @description 验证 historyAPI 与后端 /api/v1/reader/reading-history 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { historyAPI, ReadingHistory } from '@/modules/reader/api/manual/history'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('historyAPI', () => {
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

  // 模拟阅读历史数据
  const mockReadingHistory: ReadingHistory = {
    id: 'history-001',
    bookId: 'book-123',
    chapterId: 'chapter-456',
    position: 1500,
    duration: 1800,
    timestamp: '2024-01-15T10:30:00Z'
  }

  const mockReadingHistory2: ReadingHistory = {
    id: 'history-002',
    bookId: 'book-456',
    chapterId: 'chapter-789',
    position: 2300,
    duration: 3600,
    timestamp: '2024-01-14T14:00:00Z'
  }

  describe('recordReadingHistory', () => {
    // H-001: 记录阅读历史
    it('应该发送正确的POST请求记录阅读历史', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data = {
        bookId: 'book-123',
        chapterId: 'chapter-456',
        position: 1500,
        duration: 1800
      }
      const result = await historyAPI.recordReadingHistory(data)

      expect(httpService.post).toHaveBeenCalledWith('/reader/reading-history', data)
      expect(result).toEqual(mockResponse)
    })

    // H-001: 记录阅读历史-不带duration
    it('应该正确处理不带阅读时长的记录', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data = {
        bookId: 'book-123',
        chapterId: 'chapter-456',
        position: 1500
      }
      await historyAPI.recordReadingHistory(data)

      expect(httpService.post).toHaveBeenCalledWith('/reader/reading-history', data)
    })

    // H-001: 记录阅读历史-位置为0
    it('应该正确处理位置为0的记录', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const data = {
        bookId: 'book-123',
        chapterId: 'chapter-456',
        position: 0
      }
      await historyAPI.recordReadingHistory(data)

      expect(httpService.post).toHaveBeenCalledWith('/reader/reading-history', data)
    })
  })

  describe('getReadingHistories', () => {
    // H-002: 获取历史列表
    it('应该发送正确的GET请求获取阅读历史列表', async () => {
      const mockResponse = createMockPaginatedResponse([mockReadingHistory, mockReadingHistory2])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await historyAPI.getReadingHistories()

      expect(httpService.get).toHaveBeenCalledWith('/reader/reading-history', { params: undefined })
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    // H-002: 获取历史列表-带分页参数
    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockReadingHistory])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params = { page: 2, pageSize: 20 }
      await historyAPI.getReadingHistories(params)

      expect(httpService.get).toHaveBeenCalledWith('/reader/reading-history', { params })
    })

    // H-002: 获取历史列表-带排序参数
    it('应该正确传递排序参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockReadingHistory])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params = { sortBy: 'timestamp', page: 1, pageSize: 10 }
      await historyAPI.getReadingHistories(params)

      expect(httpService.get).toHaveBeenCalledWith('/reader/reading-history', { params })
    })

    // H-002: 获取历史列表-带书籍筛选
    it('应该正确传递书籍筛选参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockReadingHistory])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params = { bookId: 'book-123' }
      await historyAPI.getReadingHistories(params)

      expect(httpService.get).toHaveBeenCalledWith('/reader/reading-history', { params })
    })

    // H-002: 获取历史列表-带时间范围
    it('应该正确传递时间范围参数', async () => {
      const mockResponse = createMockPaginatedResponse([mockReadingHistory])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      }
      await historyAPI.getReadingHistories(params)

      expect(httpService.get).toHaveBeenCalledWith('/reader/reading-history', { params })
    })

    // H-002: 获取历史列表-空列表
    it('应该正确处理空历史列表', async () => {
      const mockResponse = createMockPaginatedResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await historyAPI.getReadingHistories()

      expect(result.data).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('deleteHistory', () => {
    // H-003: 删除历史记录
    it('应该发送正确的DELETE请求删除历史记录', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const historyId = 'history-001'
      const result = await historyAPI.deleteHistory(historyId)

      expect(httpService.delete).toHaveBeenCalledWith(`/reader/reading-history/${historyId}`)
      expect(result).toEqual(mockResponse)
    })

    // H-003: 删除历史记录-确认删除
    it('应该正确处理删除成功响应', async () => {
      const mockResponse = {
        code: 204,
        message: 'success',
        data: undefined,
        timestamp: Date.now()
      }
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const result = await historyAPI.deleteHistory('history-001')

      expect(result.code).toBe(204)
    })
  })

  describe('批量操作API', () => {
    it('应该正确批量删除历史记录', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const historyIds = ['history-001', 'history-002', 'history-003']
      await historyAPI.batchDeleteHistory(historyIds)

      expect(httpService.delete).toHaveBeenCalledWith('/reader/reading-history', {
        data: { ids: historyIds }
      })
    })

    it('应该正确清空所有历史', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      await historyAPI.clearHistories()

      expect(httpService.delete).toHaveBeenCalledWith('/reader/reading-history')
    })
  })

  describe('阅读统计API', () => {
    it('应该正确获取阅读统计', async () => {
      const statsData = {
        totalBooks: 50,
        finishedBooks: 20,
        unfinishedBooks: 30,
        totalReadingTime: 36000,
        todayReadingTime: 120
      }
      const mockResponse = createMockAPIResponse(statsData)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await historyAPI.getReadingStats()

      expect(httpService.get).toHaveBeenCalledWith('/reader/reading-history/stats')
      expect(result.data?.totalBooks).toBe(50)
      expect(result.data?.totalReadingTime).toBe(36000)
    })
  })

  describe('错误处理', () => {
    // H-001: 记录阅读历史-未登录
    it('应该正确处理记录历史时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(historyAPI.recordReadingHistory({
        bookId: 'book-1',
        chapterId: 'chapter-1',
        position: 0
      })).rejects.toEqual(mockError)
    })

    // H-003: 删除历史记录-不存在
    it('应该正确处理删除不存在历史记录的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '历史记录不存在'
          }
        }
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(historyAPI.deleteHistory('nonexistent-id')).rejects.toEqual(mockError)
    })

    // H-002: 获取历史列表-未登录
    it('应该正确处理获取历史列表时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(historyAPI.getReadingHistories()).rejects.toEqual(mockError)
    })

    // H-001: 记录阅读历史-无效参数
    it('应该正确处理无效参数错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '参数错误：bookId不能为空'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(historyAPI.recordReadingHistory({
        bookId: '',
        chapterId: 'chapter-1',
        position: 0
      })).rejects.toEqual(mockError)
    })
  })
})
