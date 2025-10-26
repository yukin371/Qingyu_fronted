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
    const response = await httpService.get<APIResponse<HomepageData>>('/bookstore/homepage')
    return response.data
  },

  /**
   * Get ranking by type
   */
  async getRankingByType(
    type: RankingType,
    period: string = '',
    limit: number = 20
  ): Promise<RankingItem[]> {
    const response = await httpService.get<APIResponse<RankingItem[]>>(`/bookstore/rankings/${type}`, {
      params: { period, limit }
    } as any)
    return response.data
  },

  /**
   * Get banners
   */
  async getBanners(limit: number = 5): Promise<Banner[]> {
    const response = await httpService.get<APIResponse<Banner[]>>('/bookstore/banners', {
      params: { limit }
    } as any)
    return response.data
  },

  /**
   * Get book by ID
   */
  async getBookById(id: string): Promise<Book> {
    const response = await httpService.get<APIResponse<Book>>(`/bookstore/books/${id}`)
    return response.data
  },

  /**
   * Get recommended books
   */
  async getRecommendedBooks(page: number = 1, size: number = 20): Promise<BookBrief[]> {
    const response = await httpService.get<APIResponse<BookBrief[]>>('/bookstore/books/recommended', {
      params: { page, size }
    } as any)
    return response.data
  },

  /**
   * Get featured books
   */
  async getFeaturedBooks(page: number = 1, size: number = 20): Promise<BookBrief[]> {
    const response = await httpService.get<APIResponse<BookBrief[]>>('/bookstore/books/featured', {
      params: { page, size }
    } as any)
    return response.data
  },

  /**
   * Search books
   */
  async searchBooks(params: SearchParams): Promise<SearchResult> {
    const response = await httpService.get<APIResponse<SearchResult>>('/bookstore/books/search', {
      params
    } as any)
    return response.data
  },

  /**
   * Get books by category
   */
  async getBooksByCategory(
    categoryId: string,
    params: PaginationParams & Partial<SearchFilter> = {}
  ): Promise<SearchResult> {
    const response = await httpService.get<APIResponse<SearchResult>>(
      `/bookstore/categories/${categoryId}/books`,
      { params } as any
    )
    return response.data
  },

  /**
   * Get categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await httpService.get<APIResponse<Category[]>>('/bookstore/categories')
    return response.data
  },

  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const response = await httpService.get<APIResponse<CategoryTreeNode[]>>('/bookstore/categories/tree')
    return response.data
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await httpService.get<APIResponse<Category>>(`/bookstore/categories/${id}`)
    return response.data
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

