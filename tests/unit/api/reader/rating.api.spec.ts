/**
 * 评分API契约测试
 * @description 验证 ratingAPI 与后端 /api/v1/bookstore/ratings 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ratingAPI, BookRating, UserRating } from '@/modules/reader/api/manual/rating'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('ratingAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟API响应
  const createMockAPIResponse = <T>(data: T) => ({
    code: 200,
    message: 'success',
    data,
    timestamp: Date.now(),
  })

  // 模拟书籍评分数据
  const mockBookRating: BookRating = {
    bookId: 'book-123',
    averageScore: 4.5,
    totalRatings: 100,
    scoreDistribution: [
      { score: 5, count: 60 },
      { score: 4, count: 25 },
      { score: 3, count: 10 },
      { score: 2, count: 3 },
      { score: 1, count: 2 },
    ],
  }

  // 模拟用户评分数据
  const mockUserRating: UserRating = {
    id: 'rating-123',
    bookId: 'book-123',
    userId: 'user-456',
    score: 5,
    review: '非常精彩的小说！',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }

  describe('getBookRating', () => {
    // RT-001: 获取书籍评分统计
    it('应该发送正确的GET请求获取书籍评分统计', async () => {
      const mockResponse = createMockAPIResponse(mockBookRating)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await ratingAPI.getBookRating(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/bookstore/ratings/book/${bookId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data?.averageScore).toBe(4.5)
      expect(result.data?.totalRatings).toBe(100)
    })

    // RT-001: 处理无评分的书籍
    it('应该正确处理无评分的书籍响应', async () => {
      const noRatingResponse: BookRating = {
        bookId: 'book-456',
        averageScore: 0,
        totalRatings: 0,
        scoreDistribution: [],
      }
      const mockResponse = createMockAPIResponse(noRatingResponse)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await ratingAPI.getBookRating('book-456')

      expect(httpService.get).toHaveBeenCalledWith('/bookstore/ratings/book/book-456')
      expect(result.data?.averageScore).toBe(0)
      expect(result.data?.totalRatings).toBe(0)
      expect(result.data?.scoreDistribution).toHaveLength(0)
    })

    // RT-001: 处理高分书籍
    it('应该正确处理高分书籍响应', async () => {
      const highRatingResponse: BookRating = {
        bookId: 'book-789',
        averageScore: 4.9,
        totalRatings: 1000,
        scoreDistribution: [
          { score: 5, count: 900 },
          { score: 4, count: 80 },
          { score: 3, count: 15 },
          { score: 2, count: 4 },
          { score: 1, count: 1 },
        ],
      }
      const mockResponse = createMockAPIResponse(highRatingResponse)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await ratingAPI.getBookRating('book-789')

      expect(result.data?.averageScore).toBe(4.9)
      expect(result.data?.totalRatings).toBe(1000)
    })
  })

  describe('rateBook', () => {
    // RT-002: 提交5分评分（边界值）
    it('应该发送正确的POST请求提交5分评分', async () => {
      const mockResponse = createMockAPIResponse(mockUserRating)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const score = 5
      const review = '非常精彩的小说！'
      const result = await ratingAPI.rateBook(bookId, score, review)

      expect(httpService.post).toHaveBeenCalledWith('/bookstore/ratings', {
        bookId,
        score,
        review,
      })
      expect(result).toEqual(mockResponse)
      expect(result.data?.score).toBe(5)
    })

    // RT-002: 提交1分评分（边界值）
    it('应该发送正确的POST请求提交1分评分', async () => {
      const lowRatingUser: UserRating = {
        ...mockUserRating,
        score: 1,
        review: '不太喜欢',
      }
      const mockResponse = createMockAPIResponse(lowRatingUser)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const score = 1
      const review = '不太喜欢'
      const result = await ratingAPI.rateBook(bookId, score, review)

      expect(httpService.post).toHaveBeenCalledWith('/bookstore/ratings', {
        bookId,
        score,
        review,
      })
      expect(result.data?.score).toBe(1)
    })

    // RT-002: 提交3分评分（中间值）
    it('应该发送正确的POST请求提交3分评分', async () => {
      const midRatingUser: UserRating = {
        ...mockUserRating,
        score: 3,
        review: '还行',
      }
      const mockResponse = createMockAPIResponse(midRatingUser)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const result = await ratingAPI.rateBook('book-123', 3, '还行')

      expect(httpService.post).toHaveBeenCalledWith('/bookstore/ratings', {
        bookId: 'book-123',
        score: 3,
        review: '还行',
      })
      expect(result.data?.score).toBe(3)
    })

    // RT-002: 不带评论提交评分
    it('应该正确提交不带评论的评分', async () => {
      const noReviewRating: UserRating = {
        ...mockUserRating,
        review: undefined,
      }
      const mockResponse = createMockAPIResponse(noReviewRating)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      await ratingAPI.rateBook('book-123', 4)

      expect(httpService.post).toHaveBeenCalledWith('/bookstore/ratings', {
        bookId: 'book-123',
        score: 4,
        review: undefined,
      })
    })
  })

  describe('getUserBookRating', () => {
    // RT-002: 获取用户对书籍的评分-已评分
    it('应该发送正确的GET请求获取用户对书籍的评分', async () => {
      const mockResponse = createMockAPIResponse(mockUserRating)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const bookId = 'book-123'
      const result = await ratingAPI.getUserBookRating(bookId)

      expect(httpService.get).toHaveBeenCalledWith(`/bookstore/ratings/user/me/book/${bookId}`)
      expect(result).toEqual(mockResponse)
      expect(result.data?.score).toBe(5)
    })

    // RT-002: 获取用户对书籍的评分-未评分
    it('应该正确处理用户未评分的响应', async () => {
      const mockResponse = createMockAPIResponse<UserRating | null>(null)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await ratingAPI.getUserBookRating('book-456')

      expect(httpService.get).toHaveBeenCalledWith('/bookstore/ratings/user/me/book/book-456')
      expect(result.data).toBeNull()
    })
  })

  describe('updateRating', () => {
    // RT-002: 更新评分
    it('应该发送正确的PUT请求更新评分', async () => {
      const updatedRating: UserRating = {
        ...mockUserRating,
        score: 4,
        review: '修改后的评价',
        updatedAt: '2024-01-02T00:00:00Z',
      }
      const mockResponse = createMockAPIResponse(updatedRating)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      const ratingId = 'rating-123'
      const result = await ratingAPI.updateRating(ratingId, 4, '修改后的评价')

      expect(httpService.put).toHaveBeenCalledWith(`/bookstore/ratings/${ratingId}`, {
        score: 4,
        review: '修改后的评价',
      })
      expect(result).toEqual(mockResponse)
      expect(result.data?.score).toBe(4)
    })

    // RT-002: 更新评分为最高分
    it('应该正确更新评分为5分', async () => {
      const maxRating: UserRating = {
        ...mockUserRating,
        score: 5,
      }
      const mockResponse = createMockAPIResponse(maxRating)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await ratingAPI.updateRating('rating-123', 5)

      expect(httpService.put).toHaveBeenCalledWith('/bookstore/ratings/rating-123', {
        score: 5,
        review: undefined,
      })
    })

    // RT-002: 更新评分为最低分
    it('应该正确更新评分为1分', async () => {
      const minRating: UserRating = {
        ...mockUserRating,
        score: 1,
      }
      const mockResponse = createMockAPIResponse(minRating)
      vi.mocked(httpService.put).mockResolvedValue(mockResponse)

      await ratingAPI.updateRating('rating-123', 1)

      expect(httpService.put).toHaveBeenCalledWith('/bookstore/ratings/rating-123', {
        score: 1,
        review: undefined,
      })
    })
  })

  describe('deleteRating', () => {
    // RT-002: 删除评分
    it('应该发送正确的DELETE请求删除评分', async () => {
      const mockResponse = createMockAPIResponse<void>(undefined)
      vi.mocked(httpService.delete).mockResolvedValue(mockResponse)

      const ratingId = 'rating-123'
      const result = await ratingAPI.deleteRating(ratingId)

      expect(httpService.delete).toHaveBeenCalledWith(`/bookstore/ratings/${ratingId}`)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('错误处理', () => {
    // RT-001: 获取评分-书籍不存在
    it('应该正确处理书籍不存在的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '书籍不存在',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(ratingAPI.getBookRating('nonexistent-book')).rejects.toEqual(mockError)
    })

    // RT-002: 提交评分-未登录
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

      await expect(ratingAPI.rateBook('book-123', 5, '很好')).rejects.toEqual(mockError)
    })

    // RT-002: 提交评分-重复评分
    it('应该正确处理重复评分的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 409,
            message: '您已评价过此书籍',
          },
        },
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(ratingAPI.rateBook('book-123', 5, '很好')).rejects.toEqual(mockError)
    })

    // RT-002: 获取用户评分-未登录
    it('应该正确处理获取用户评分时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录',
          },
        },
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(ratingAPI.getUserBookRating('book-123')).rejects.toEqual(mockError)
    })

    // RT-002: 更新评分-评分不存在
    it('应该正确处理更新不存在评分的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '评分不存在',
          },
        },
      }
      vi.mocked(httpService.put).mockRejectedValue(mockError)

      await expect(ratingAPI.updateRating('nonexistent-rating', 4)).rejects.toEqual(mockError)
    })

    // RT-002: 删除评分-评分不存在
    it('应该正确处理删除不存在评分的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '评分不存在',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(ratingAPI.deleteRating('nonexistent-rating')).rejects.toEqual(mockError)
    })

    // RT-002: 删除评分-无权限
    it('应该正确处理删除他人评分的错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 403,
            message: '无权删除此评分',
          },
        },
      }
      vi.mocked(httpService.delete).mockRejectedValue(mockError)

      await expect(ratingAPI.deleteRating('other-user-rating')).rejects.toEqual(mockError)
    })
  })
})
