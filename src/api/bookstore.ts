/**
 * 书城API模块 (v1.3)
 * 基于 doc/api/frontend/书城API参考.md
 */

import request from '@/utils/request'
import type { APIResponse, PaginationParams } from '@/types/api'
import type {
  Book,
  BookBrief,
  Banner,
  RankingItem,
  HomepageData,
  SearchFilter,
  SearchResult,
  SearchParams,
  Category,
  CategoryTreeNode,
  RankingType
} from '@/types/bookstore'

/**
 * 书城API接口 (v1.3)
 */
export const bookstoreAPI = {
  /**
   * 获取首页数据
   */
  async getHomepage(): Promise<APIResponse<HomepageData>> {
    return request.get<APIResponse<HomepageData>>('/bookstore/homepage')
  },

  /**
   * 获取实时榜
   */
  async getRealtimeRanking(limit: number = 20): Promise<APIResponse<RankingItem[]>> {
    return request.get<APIResponse<RankingItem[]>>('/bookstore/rankings/realtime', {
      params: { limit }
    })
  },

  /**
   * 获取周榜
   */
  async getWeeklyRanking(period: string = '', limit: number = 20): Promise<APIResponse<RankingItem[]>> {
    return request.get<APIResponse<RankingItem[]>>('/bookstore/rankings/weekly', {
      params: { period, limit }
    })
  },

  /**
   * 获取月榜
   */
  async getMonthlyRanking(period: string = '', limit: number = 20): Promise<APIResponse<RankingItem[]>> {
    return request.get<APIResponse<RankingItem[]>>('/bookstore/rankings/monthly', {
      params: { period, limit }
    })
  },

  /**
   * 获取新人榜
   */
  async getNewbieRanking(period: string = '', limit: number = 20): Promise<APIResponse<RankingItem[]>> {
    return request.get<APIResponse<RankingItem[]>>('/bookstore/rankings/newbie', {
      params: { period, limit }
    })
  },

  /**
   * 按类型获取榜单 (v1.3)
   */
  async getRankingByType(type: RankingType, period: string = '', limit: number = 20): Promise<APIResponse<RankingItem[]>> {
    return request.get<APIResponse<RankingItem[]>>(`/bookstore/rankings/${type}`, {
      params: { period, limit }
    })
  },

  /**
   * 获取Banner列表
   */
  async getBanners(limit: number = 5): Promise<APIResponse<Banner[]>> {
    return request.get<APIResponse<Banner[]>>('/bookstore/banners', {
      params: { limit }
    })
  },

  /**
   * 获取书籍详情
   */
  async getBookById(id: string): Promise<APIResponse<Book>> {
    return request.get<APIResponse<Book>>(`/bookstore/books/${id}`)
  },

  /**
   * 获取推荐书籍
   */
  async getRecommendedBooks(page: number = 1, size: number = 20): Promise<APIResponse<BookBrief[]>> {
    return request.get<APIResponse<BookBrief[]>>('/bookstore/books/recommended', {
      params: { page, size }
    })
  },

  /**
   * 获取精选书籍
   */
  async getFeaturedBooks(page: number = 1, size: number = 20): Promise<APIResponse<BookBrief[]>> {
    return request.get<APIResponse<BookBrief[]>>('/bookstore/books/featured', {
      params: { page, size }
    })
  },

  /**
   * 搜索书籍
   */
  async searchBooks(params: SearchParams): Promise<APIResponse<SearchResult>> {
    return request.get<APIResponse<SearchResult>>('/bookstore/books/search', {
      params
    })
  },

  /**
   * 根据分类获取书籍 (v1.3)
   */
  async getBooksByCategory(
    categoryId: string,
    params: PaginationParams & Partial<SearchFilter> = {}
  ): Promise<APIResponse<SearchResult>> {
    return request.get<APIResponse<SearchResult>>(`/bookstore/categories/${categoryId}/books`, {
      params
    })
  },

  /**
   * 获取分类列表
   */
  async getCategories(): Promise<APIResponse<Category[]>> {
    return request.get<APIResponse<Category[]>>('/bookstore/categories')
  },

  /**
   * 获取分类树 (v1.3新增)
   */
  async getCategoryTree(): Promise<APIResponse<CategoryTreeNode[]>> {
    return request.get<APIResponse<CategoryTreeNode[]>>('/bookstore/categories/tree')
  },

  /**
   * 获取分类详情 (v1.3新增)
   */
  async getCategoryById(id: string): Promise<APIResponse<Category>> {
    return request.get<APIResponse<Category>>(`/bookstore/categories/${id}`)
  },

  /**
   * 增加书籍浏览量
   */
  async incrementBookView(id: string): Promise<APIResponse<null>> {
    return request.post<APIResponse<null>>(`/bookstore/books/${id}/view`)
  },

  /**
   * 增加Banner点击次数
   */
  async incrementBannerClick(id: string): Promise<APIResponse<null>> {
    return request.post<APIResponse<null>>(`/bookstore/banners/${id}/click`)
  }
}

export default bookstoreAPI


