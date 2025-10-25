/**
 * Bookstore API (moved from src/api/bookstore.ts)
 */

import { httpService } from '@/core/services/http.service'
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
} from '../types/bookstore.types'
import type { APIResponse, PaginationParams } from '@/core/types/api.types'

export const bookstoreAPI = {
  /**
   * Get homepage data
   */
  async getHomepage(): Promise<HomepageData> {
    return httpService.get<APIResponse<HomepageData>>('/bookstore/homepage')
  },

  /**
   * Get ranking by type
   */
  async getRankingByType(
    type: RankingType,
    period: string = '',
    limit: number = 20
  ): Promise<RankingItem[]> {
    return httpService.get<APIResponse<RankingItem[]>>(`/bookstore/rankings/${type}`, {
      params: { period, limit }
    } as any)
  },

  /**
   * Get banners
   */
  async getBanners(limit: number = 5): Promise<Banner[]> {
    return httpService.get<APIResponse<Banner[]>>('/bookstore/banners', {
      params: { limit }
    } as any)
  },

  /**
   * Get book by ID
   */
  async getBookById(id: string): Promise<Book> {
    return httpService.get<APIResponse<Book>>(`/bookstore/books/${id}`)
  },

  /**
   * Get recommended books
   */
  async getRecommendedBooks(page: number = 1, size: number = 20): Promise<BookBrief[]> {
    return httpService.get<APIResponse<BookBrief[]>>('/bookstore/books/recommended', {
      params: { page, size }
    } as any)
  },

  /**
   * Get featured books
   */
  async getFeaturedBooks(page: number = 1, size: number = 20): Promise<BookBrief[]> {
    return httpService.get<APIResponse<BookBrief[]>>('/bookstore/books/featured', {
      params: { page, size }
    } as any)
  },

  /**
   * Search books
   */
  async searchBooks(params: SearchParams): Promise<SearchResult> {
    return httpService.get<APIResponse<SearchResult>>('/bookstore/books/search', {
      params
    } as any)
  },

  /**
   * Get books by category
   */
  async getBooksByCategory(
    categoryId: string,
    params: PaginationParams & Partial<SearchFilter> = {}
  ): Promise<SearchResult> {
    return httpService.get<APIResponse<SearchResult>>(
      `/bookstore/categories/${categoryId}/books`,
      { params } as any
    )
  },

  /**
   * Get categories
   */
  async getCategories(): Promise<Category[]> {
    return httpService.get<APIResponse<Category[]>>('/bookstore/categories')
  },

  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    return httpService.get<APIResponse<CategoryTreeNode[]>>('/bookstore/categories/tree')
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    return httpService.get<APIResponse<Category>>(`/bookstore/categories/${id}`)
  },

  /**
   * Increment book view count
   */
  async incrementBookView(id: string): Promise<void> {
    return httpService.post(`/bookstore/books/${id}/view`)
  },

  /**
   * Increment banner click count
   */
  async incrementBannerClick(id: string): Promise<void> {
    return httpService.post(`/bookstore/banners/${id}/click`)
  }
}

export default bookstoreAPI

