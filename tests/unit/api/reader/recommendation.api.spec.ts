/**
 * 推荐API契约测试
 * @description 验证 recommendationAPI 与后端 /api/v1/recommendation 接口的契约一致性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  recommendationAPI,
  RecommendedBook,
  UserBehavior,
  PersonalizedRecommendationParams,
  HotRecommendationParams,
  SimilarRecommendationParams,
  CategoryRecommendationParams,
  HomepageRecommendationParams,
  RecommendationResponse,
  HomepageRecommendationResponse
} from '@/modules/reader/api/manual/recommendation'
import { httpService } from '@/core/services/http.service'

// Mock httpService
vi.mock('@/core/services/http.service')

describe('recommendationAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 模拟推荐书籍数据
  const mockRecommendedBook: RecommendedBook = {
    id: 'book-123',
    title: '测试推荐书籍',
    author: '测试作者',
    cover: 'https://example.com/cover.jpg',
    description: '这是一本测试书籍',
    category: '玄幻',
    categoryId: 'cat-001',
    status: 'serializing',
    totalChapters: 100,
    wordCount: 500000,
    rating: 4.5,
    ratingCount: 1000,
    viewCount: 10000,
    recommendationReason: '基于您的阅读偏好推荐',
    score: 0.95,
    tags: ['热血', '爽文'],
    updatedAt: '2024-01-01T00:00:00Z'
  }

  // 模拟推荐响应
  const createMockRecommendationResponse = (
    books: RecommendedBook[] = [mockRecommendedBook],
    total: number = books.length
  ): RecommendationResponse => ({
    books,
    total,
    refreshedAt: '2024-01-01T00:00:00Z',
    algorithm: 'collaborative_filtering'
  })

  // 模拟API响应包装
  const createMockAPIResponse = <T>(data: T) => ({
    code: 200,
    message: 'success',
    data
  })

  describe('getPersonalized', () => {
    // R-001: 获取个性化推荐-成功
    it('应该发送正确的GET请求获取个性化推荐', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await recommendationAPI.getPersonalized()

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/personalized', {
        params: undefined
      })
      expect(result).toEqual(mockResponse)
    })

    // R-001: 获取个性化推荐-带参数
    it('应该正确传递个性化推荐参数', async () => {
      const books = [mockRecommendedBook, { ...mockRecommendedBook, id: 'book-456' }]
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse(books, 2))
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: PersonalizedRecommendationParams = {
        limit: 10,
        offset: 0,
        refresh: true
      }
      const result = await recommendationAPI.getPersonalized(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/personalized', { params })
      expect(result.data.books).toHaveLength(2)
    })

    // R-001: 获取个性化推荐-包含推荐理由
    it('应该返回包含推荐理由的书籍', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await recommendationAPI.getPersonalized()

      expect(result.data.books[0]).toHaveProperty('recommendationReason')
      expect(result.data.books[0].recommendationReason).toBe('基于您的阅读偏好推荐')
    })

    // R-001: 获取个性化推荐-空列表
    it('应该正确处理空推荐列表响应', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse([], 0))
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await recommendationAPI.getPersonalized()

      expect(result.data.books).toHaveLength(0)
      expect(result.data.total).toBe(0)
    })
  })

  describe('getHot', () => {
    // R-002: 获取热门推荐-成功
    it('应该发送正确的GET请求获取热门推荐', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await recommendationAPI.getHot()

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/hot', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    // R-002: 获取热门推荐-按时间周期
    it('应该正确传递时间周期参数', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: HotRecommendationParams = {
        limit: 20,
        offset: 0,
        period: 'weekly'
      }
      await recommendationAPI.getHot(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/hot', { params })
    })

    // R-002: 获取热门推荐-验证热度排序
    it('应该返回按热度排序的书籍', async () => {
      const books = [
        { ...mockRecommendedBook, id: 'book-1', viewCount: 10000, score: 0.95 },
        { ...mockRecommendedBook, id: 'book-2', viewCount: 8000, score: 0.88 }
      ]
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse(books, 2))
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await recommendationAPI.getHot()

      expect(result.data.books).toHaveLength(2)
      expect(result.data.books[0].score).toBeGreaterThanOrEqual(
        result.data.books[1].score ?? 0
      )
    })
  })

  describe('getSimilar', () => {
    // R-003: 获取相似书籍-成功
    it('应该发送正确的GET请求获取相似书籍', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: SimilarRecommendationParams = {
        bookId: 'book-123',
        limit: 10
      }
      const result = await recommendationAPI.getSimilar(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/similar', { params })
      expect(result).toEqual(mockResponse)
    })

    // R-003: 获取相似书籍-验证bookId参数
    it('请求必须包含bookId参数', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: SimilarRecommendationParams = {
        bookId: 'book-456'
      }
      await recommendationAPI.getSimilar(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/similar', {
        params: expect.objectContaining({ bookId: 'book-456' })
      })
    })

    // R-003: 获取相似书籍-带分页
    it('应该正确传递分页参数', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: SimilarRecommendationParams = {
        bookId: 'book-123',
        limit: 5,
        offset: 10
      }
      await recommendationAPI.getSimilar(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/similar', { params })
    })
  })

  describe('getByCategory', () => {
    // R-004: 获取分类推荐-成功
    it('应该发送正确的GET请求获取分类推荐', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: CategoryRecommendationParams = {
        categoryId: 'cat-001',
        limit: 10
      }
      const result = await recommendationAPI.getByCategory(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/category', { params })
      expect(result).toEqual(mockResponse)
    })

    // R-004: 获取分类推荐-验证categoryId参数
    it('请求必须包含categoryId参数', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: CategoryRecommendationParams = {
        categoryId: 'cat-002'
      }
      await recommendationAPI.getByCategory(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/category', {
        params: expect.objectContaining({ categoryId: 'cat-002' })
      })
    })

    // R-004: 获取分类推荐-排序方式
    it('应该正确传递排序参数', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: CategoryRecommendationParams = {
        categoryId: 'cat-001',
        sortBy: 'rating'
      }
      await recommendationAPI.getByCategory(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/category', {
        params: expect.objectContaining({ sortBy: 'rating' })
      })
    })
  })

  describe('recordBehavior', () => {
    // R-005: 记录用户行为-成功
    it('应该发送正确的POST请求记录用户行为', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const behavior: UserBehavior = {
        bookId: 'book-123',
        behaviorType: 'read',
        duration: 300
      }
      const result = await recommendationAPI.recordBehavior(behavior)

      expect(httpService.post).toHaveBeenCalledWith('/recommendation/behavior', behavior)
      expect(result).toEqual(mockResponse)
    })

    // R-005: 记录用户行为-验证behavior类型
    it('请求体应包含behavior类型', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const behaviorTypes: UserBehavior['behaviorType'][] = [
        'view',
        'read',
        'like',
        'collect',
        'share',
        'purchase',
        'rating',
        'comment',
        'search'
      ]

      for (const type of behaviorTypes) {
        const behavior: UserBehavior = {
          bookId: 'book-123',
          behaviorType: type
        }
        await recommendationAPI.recordBehavior(behavior)

        expect(httpService.post).toHaveBeenCalledWith('/recommendation/behavior', {
          bookId: 'book-123',
          behaviorType: type
        })
      }
    })

    // R-005: 记录用户行为-带评分
    it('应该正确记录带评分的行为', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const behavior: UserBehavior = {
        bookId: 'book-123',
        behaviorType: 'rating',
        rating: 5
      }
      await recommendationAPI.recordBehavior(behavior)

      expect(httpService.post).toHaveBeenCalledWith('/recommendation/behavior', {
        bookId: 'book-123',
        behaviorType: 'rating',
        rating: 5
      })
    })

    // R-005: 记录用户行为-带元数据
    it('应该正确记录带元数据的行为', async () => {
      const mockResponse = createMockAPIResponse(undefined)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const behavior: UserBehavior = {
        bookId: 'book-123',
        behaviorType: 'search',
        searchQuery: '玄幻小说',
        metadata: { source: 'homepage' }
      }
      await recommendationAPI.recordBehavior(behavior)

      expect(httpService.post).toHaveBeenCalledWith('/recommendation/behavior', behavior)
    })
  })

  describe('getHomepage', () => {
    // 获取首页推荐-成功
    it('应该发送正确的GET请求获取首页推荐', async () => {
      const homepageResponse: HomepageRecommendationResponse = {
        personalized: createMockRecommendationResponse(),
        hot: createMockRecommendationResponse(),
        categories: [
          {
            categoryId: 'cat-001',
            categoryName: '玄幻',
            books: [mockRecommendedBook]
          }
        ]
      }
      const mockResponse = createMockAPIResponse(homepageResponse)
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const result = await recommendationAPI.getHomepage()

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/homepage', {
        params: undefined
      })
      expect(result).toEqual(mockResponse)
    })

    // 获取首页推荐-带参数
    it('应该正确传递首页推荐参数', async () => {
      const mockResponse = createMockAPIResponse({
        personalized: createMockRecommendationResponse()
      })
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)

      const params: HomepageRecommendationParams = {
        limit: 10,
        includePersonalized: true,
        includeHot: true,
        includeCategory: false
      }
      await recommendationAPI.getHomepage(params)

      expect(httpService.get).toHaveBeenCalledWith('/recommendation/homepage', { params })
    })
  })

  describe('错误处理', () => {
    // R-001: 个性化推荐-未登录
    it('应该正确处理获取个性化推荐时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(recommendationAPI.getPersonalized()).rejects.toEqual(mockError)
    })

    // R-003: 相似书籍-书籍不存在
    it('应该正确处理获取相似书籍时的资源不存在错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '书籍不存在'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(
        recommendationAPI.getSimilar({ bookId: 'nonexistent' })
      ).rejects.toEqual(mockError)
    })

    // R-004: 分类推荐-分类不存在
    it('应该正确处理获取分类推荐时的分类不存在错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 404,
            message: '分类不存在'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(
        recommendationAPI.getByCategory({ categoryId: 'nonexistent' })
      ).rejects.toEqual(mockError)
    })

    // R-005: 记录行为-未登录
    it('应该正确处理记录用户行为时的未登录错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 401,
            message: '请先登录'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        recommendationAPI.recordBehavior({ bookId: 'book-1', behaviorType: 'read' })
      ).rejects.toEqual(mockError)
    })

    // R-005: 记录行为-参数错误
    it('应该正确处理记录用户行为时的参数错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 400,
            message: '无效的行为类型'
          }
        }
      }
      vi.mocked(httpService.post).mockRejectedValue(mockError)

      await expect(
        recommendationAPI.recordBehavior({ bookId: '', behaviorType: 'read' })
      ).rejects.toEqual(mockError)
    })

    // 热门推荐-服务器错误
    it('应该正确处理获取热门推荐时的服务器错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 500,
            message: '服务器内部错误'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(recommendationAPI.getHot()).rejects.toEqual(mockError)
    })

    // 首页推荐-服务不可用
    it('应该正确处理获取首页推荐时的服务不可用错误', async () => {
      const mockError = {
        response: {
          data: {
            code: 503,
            message: '推荐服务暂时不可用'
          }
        }
      }
      vi.mocked(httpService.get).mockRejectedValue(mockError)

      await expect(recommendationAPI.getHomepage()).rejects.toEqual(mockError)
    })
  })

  describe('向后兼容导出', () => {
    it('应该导出函数式API', async () => {
      const mockResponse = createMockAPIResponse(createMockRecommendationResponse())
      vi.mocked(httpService.get).mockResolvedValue(mockResponse)
      vi.mocked(httpService.post).mockResolvedValue(mockResponse)

      const { getPersonalizedRecommendation, getHotRecommendation, getSimilarRecommendation,
        getCategoryRecommendation, recordUserBehavior, getHomepageRecommendation } = await import(
        '@/modules/reader/api/manual/recommendation'
      )

      await getPersonalizedRecommendation()
      expect(httpService.get).toHaveBeenCalledWith('/recommendation/personalized', { params: undefined })

      await getHotRecommendation()
      expect(httpService.get).toHaveBeenCalledWith('/recommendation/hot', { params: undefined })

      await getSimilarRecommendation({ bookId: 'book-1' })
      expect(httpService.get).toHaveBeenCalledWith('/recommendation/similar', {
        params: { bookId: 'book-1' }
      })

      await getCategoryRecommendation({ categoryId: 'cat-1' })
      expect(httpService.get).toHaveBeenCalledWith('/recommendation/category', {
        params: { categoryId: 'cat-1' }
      })

      await recordUserBehavior({ bookId: 'book-1', behaviorType: 'read' })
      expect(httpService.post).toHaveBeenCalledWith('/recommendation/behavior', {
        bookId: 'book-1',
        behaviorType: 'read'
      })

      await getHomepageRecommendation()
      expect(httpService.get).toHaveBeenCalledWith('/recommendation/homepage', { params: undefined })
    })
  })
})
