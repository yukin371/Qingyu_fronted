/**
 * 点赞API契约测试
 * @description 验证 likesAPI 与后端 /api/v1/social/books/:bookId/like 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { likesAPI, LikeInfo, UserLikeStats } from '@/modules/reader/api/manual/likes'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('likesAPI', () => {
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

  // 模拟点赞信息数据
  const mockLikeInfo: LikeInfo = {
    isLiked: false,
    likeCount: 42
  }

  // 模拟用户点赞统计数据
  const mockUserLikeStats: UserLikeStats = {
    totalLikes: 100,
    bookLikes: 80,
    commentLikes: 20
  }

  describe('likeBook', () => {
    // LK-001: 点赞书籍-成功
    it('应该发送正确的POST请求点赞书籍', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await likesAPI.likeBook(bookId)

      expect(httpService.post).toHaveBeenCalledWith(`/social/books/${bookId}/like`)
      expect(result).toEqual(mockResponse)
    })

    // LK-001: 点赞书籍-使用不同bookId
    it('应该正确处理不同的bookId参数', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-test-456'
      await likesAPI.likeBook(bookId)

      expect(httpService.post).toHaveBeenCalledWith(`/social/books/${bookId}/like`)
    })
  })

  describe('unlikeBook', () => {
    // LK-002: 取消点赞-成功
    it('应该发送正确的DELETE请求取消点赞', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await likesAPI.unlikeBook(bookId)

      expect(httpService.delete).toHaveBeenCalledWith(`/social/books/${bookId}/like`)
      expect(result).toEqual(mockResponse)
    })

    // LK-002: 取消点赞-使用不同bookId
    it('应该正确处理不同的bookId参数', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const bookId = 'book-test-789'
      await likesAPI.unlikeBook(bookId)

      expect(httpService.delete).toHaveBeenCalledWith(`/social/books/${bookId}/like`)
    })
  })

  describe('getBookLikeInfo', () => {
    // LK-001: 获取点赞信息-未点赞状态
    it('应该发送正确的GET请求获取点赞信息', async () => {
      const mockResponse = createMockAPIResponse(mockLikeInfo)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await likesAPI.getBookLikeInfo(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/social/books/${bookId}/like`)
      expect(result).toEqual(mockResponse)
    })

    // LK-001: 获取点赞信息-已点赞状态
    it('应该正确返回已点赞状态的信息', async () => {
      const likedInfo: LikeInfo = {
        isLiked: true,
        likeCount: 43
      }
      const mockResponse = createMockAPIResponse(likedInfo)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await likesAPI.getBookLikeInfo('book-liked')

      expect(httpService.get).toHaveBeenCalledWith('/social/books/book-liked/like')
      expect(result.data.isLiked).toBe(true)
      expect(result.data.likeCount).toBe(43)
    })

    // LK-001: 获取点赞信息-零点赞
    it('应该正确处理零点赞的情况', async () => {
      const zeroLikeInfo: LikeInfo = {
        isLiked: false,
        likeCount: 0
      }
      const mockResponse = createMockAPIResponse(zeroLikeInfo)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await likesAPI.getBookLikeInfo('book-no-likes')

      expect(result.data.likeCount).toBe(0)
      expect(result.data.isLiked).toBe(false)
    })
  })

  describe('getUserLikedBooks', () => {
    it('应该发送正确的GET请求获取用户点赞的书籍列表', async () => {
      const mockLikedBooks = [
        { id: 'book-1', title: '书籍1', likeTime: '2024-01-01T00:00:00Z' },
        { id: 'book-2', title: '书籍2', likeTime: '2024-01-02T00:00:00Z' }
      ]
      const mockResponse = createMockPaginatedResponse(mockLikedBooks)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await likesAPI.getUserLikedBooks()

      expect(httpService.get).toHaveBeenCalledWith('/social/likes/books', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockPaginatedResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      await likesAPI.getUserLikedBooks({ page: 2, pageSize: 20 })

      expect(httpService.get).toHaveBeenCalledWith('/social/likes/books', {
        params: { page: 2, pageSize: 20 }
      })
    })

    it('应该正确处理空列表响应', async () => {
      const mockResponse = createMockPaginatedResponse([])
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await likesAPI.getUserLikedBooks()

      expect(result.data).toHaveLength(0)
      expect(result.pagination.total).toBe(0)
    })
  })

  describe('getUserLikeStats', () => {
    it('应该发送正确的GET请求获取用户点赞统计', async () => {
      const mockResponse = createMockAPIResponse(mockUserLikeStats)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await likesAPI.getUserLikeStats()

      expect(httpService.get).toHaveBeenCalledWith('/social/likes/stats')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确返回点赞统计数据', async () => {
      const mockResponse = createMockAPIResponse(mockUserLikeStats)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await likesAPI.getUserLikeStats()

      expect(result.data.totalLikes).toBe(100)
      expect(result.data.bookLikes).toBe(80)
      expect(result.data.commentLikes).toBe(20)
    })

    it('应该正确处理零统计数据', async () => {
      const zeroStats: UserLikeStats = {
        totalLikes: 0,
        bookLikes: 0,
        commentLikes: 0
      }
      const mockResponse = createMockAPIResponse(zeroStats)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await likesAPI.getUserLikeStats()

      expect(result.data.totalLikes).toBe(0)
      expect(result.data.bookLikes).toBe(0)
      expect(result.data.commentLikes).toBe(0)
    })
  })

  describe('错误处理', () => {
    // LK-001: 点赞-未登录
    it('应该正确处理点赞时未登录的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(likesAPI.likeBook('book-1')).rejects.toEqual(mockError)
    })

    // LK-001: 点赞-重复点赞
    it('应该正确处理重复点赞的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 409,
            message: '已经点赞过了'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(likesAPI.likeBook('book-1')).rejects.toEqual(mockError)
    })

    // LK-001: 点赞-书籍不存在
    it('应该正确处理点赞不存在书籍的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '书籍不存在'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(likesAPI.likeBook('nonexistent-book')).rejects.toEqual(mockError)
    })

    // LK-002: 取消点赞-未点赞
    it('应该正确处理取消未点赞书籍的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '未点赞该书籍'
          }
        }
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(likesAPI.unlikeBook('book-1')).rejects.toEqual(mockError)
    })

    // LK-002: 取消点赞-未登录
    it('应该正确处理取消点赞时未登录的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(likesAPI.unlikeBook('book-1')).rejects.toEqual(mockError)
    })

    // LK-001: 获取点赞信息-书籍不存在
    it('应该正确处理获取不存在书籍点赞信息的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '书籍不存在'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(likesAPI.getBookLikeInfo('nonexistent-book')).rejects.toEqual(mockError)
    })

    // 获取用户点赞列表-未登录
    it('应该正确处理获取用户点赞列表时未登录的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(likesAPI.getUserLikedBooks()).rejects.toEqual(mockError)
    })

    // 获取用户点赞统计-未登录
    it('应该正确处理获取用户点赞统计时未登录的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(likesAPI.getUserLikeStats()).rejects.toEqual(mockError)
    })
  })
})
