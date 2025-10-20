import request from '@/utils/request'
import type { ApiResponse, PaginationParams } from '@/types/api'
import type {
  Book,
  BookBrief,
  Banner,
  RankingItem,
  HomepageData,
  SearchFilter,
  SearchResult
} from '@/types/models'

/**
 * 书城API接口
 */
export const bookstoreAPI = {
  /**
   * 获取首页数据
   */
  async getHomepage(): Promise<ApiResponse<HomepageData>> {
    return request.get('/bookstore/homepage')
  },

  /**
   * 获取实时榜
   */
  async getRealtimeRanking(limit: number = 20): Promise<ApiResponse<RankingItem[]>> {
    return request.get('/bookstore/rankings/realtime', {
      params: { limit }
    })
  },

  /**
   * 获取周榜
   */
  async getWeeklyRanking(period: string = '', limit: number = 20): Promise<ApiResponse<RankingItem[]>> {
    return request.get('/bookstore/rankings/weekly', {
      params: { period, limit }
    })
  },

  /**
   * 获取月榜
   */
  async getMonthlyRanking(period: string = '', limit: number = 20): Promise<ApiResponse<RankingItem[]>> {
    return request.get('/bookstore/rankings/monthly', {
      params: { period, limit }
    })
  },

  /**
   * 获取新人榜
   */
  async getNewbieRanking(period: string = '', limit: number = 20): Promise<ApiResponse<RankingItem[]>> {
    return request.get('/bookstore/rankings/newbie', {
      params: { period, limit }
    })
  },

  /**
   * 获取Banner列表
   */
  async getBanners(limit: number = 5): Promise<ApiResponse<Banner[]>> {
    return request.get('/bookstore/banners', {
      params: { limit }
    })
  },

  /**
   * 获取书籍详情
   */
  async getBookById(id: string): Promise<ApiResponse<Book>> {
    return request.get(`/bookstore/books/${id}`)
  },

  /**
   * 获取推荐书籍
   */
  async getRecommendedBooks(page: number = 1, size: number = 20): Promise<ApiResponse<BookBrief[]>> {
    return request.get('/bookstore/books/recommended', {
      params: { page, size }
    })
  },

  /**
   * 获取精选书籍
   */
  async getFeaturedBooks(page: number = 1, size: number = 20): Promise<ApiResponse<BookBrief[]>> {
    return request.get('/bookstore/books/featured', {
      params: { page, size }
    })
  },

  /**
   * 搜索书籍
   */
  async searchBooks(keyword: string, filters: Partial<SearchFilter> = {}): Promise<ApiResponse<SearchResult>> {
    return request.get('/bookstore/books/search', {
      params: { keyword, ...filters }
    })
  },

  /**
   * 获取分类书籍
   */
  async getBooksByCategory(
    categoryId: string,
    params: PaginationParams & Partial<SearchFilter> = {}
  ): Promise<ApiResponse<SearchResult>> {
    return request.get('/bookstore/books', {
      params: { categoryId, ...params }
    })
  },

  /**
   * 获取分类列表
   */
  async getCategories(): Promise<ApiResponse<any[]>> {
    return request.get('/bookstore/categories')
  },

  /**
   * 增加书籍浏览量
   */
  async incrementBookView(id: string): Promise<ApiResponse<any>> {
    return request.post(`/bookstore/books/${id}/view`)
  },

  /**
   * 增加Banner点击次数
   */
  async incrementBannerClick(id: string): Promise<ApiResponse<any>> {
    return request.post(`/bookstore/banners/${id}/click`)
  }
}

export default bookstoreAPI


