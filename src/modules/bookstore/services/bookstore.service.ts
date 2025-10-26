/**
 * Bookstore Service
 * Business logic for bookstore operations
 */

import { bookstoreAPI } from '../api/bookstore.api'
import type {
  Book,
  BookBrief,
  Banner,
  RankingItem,
  HomepageData,
  SearchParams,
  SearchResult,
  Category,
  CategoryTreeNode,
  RankingType
} from '../types/bookstore.types'
// import { apiCache } from '@core'
// import { CACHE_KEYS, CACHE_TTL } from '@core/config/constants'

class BookstoreService {
  /**
   * Get homepage data with caching
   */
  async getHomepageData(): Promise<HomepageData> {
    // TODO: Add caching later
    return await bookstoreAPI.getHomepage()
  }

  /**
   * Get ranking by type
   */
  async getRanking(type: RankingType, period?: string, limit?: number): Promise<RankingItem[]> {
    return await bookstoreAPI.getRankingByType(type, period, limit)
  }

  /**
   * Get all rankings
   */
  async getAllRankings(): Promise<{
    realtime: RankingItem[]
    weekly: RankingItem[]
    monthly: RankingItem[]
    newbie: RankingItem[]
  }> {
    const [realtime, weekly, monthly, newbie] = await Promise.all([
      this.getRanking('realtime'),
      this.getRanking('weekly'),
      this.getRanking('monthly'),
      this.getRanking('newbie')
    ])

    return { realtime, weekly, monthly, newbie }
  }

  /**
   * Get book detail
   */
  async getBookDetail(bookId: string): Promise<Book> {
    const book = await bookstoreAPI.getBookById(bookId)

    // Increment view count in background
    this.incrementBookView(bookId).catch(err =>
      console.error('Failed to increment view count:', err)
    )

    return book
  }

  /**
   * Search books with filters
   */
  async searchBooks(params: SearchParams): Promise<SearchResult> {
    return await bookstoreAPI.searchBooks(params)
  }

  /**
   * Get recommended books
   */
  async getRecommendedBooks(page: number = 1, size: number = 20): Promise<BookBrief[]> {
    return await bookstoreAPI.getRecommendedBooks(page, size)
  }

  /**
   * Get featured books
   */
  async getFeaturedBooks(page: number = 1, size: number = 20): Promise<BookBrief[]> {
    return await bookstoreAPI.getFeaturedBooks(page, size)
  }

  /**
   * Get books by category
   */
  async getBooksByCategory(
    categoryId: string,
    page: number = 1,
    size: number = 20
  ): Promise<SearchResult> {
    return await bookstoreAPI.getBooksByCategory(categoryId, { page, size })
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<Category[]> {
    // Fetch from API
    const response = await bookstoreAPI.getCategories()
    return (response as any).data || response || []
  }

  /**
   * Get category tree
   */
  async getCategoryTree(): Promise<CategoryTreeNode[]> {
    return await bookstoreAPI.getCategoryTree()
  }

  /**
   * Get banners
   */
  async getBanners(limit: number = 5): Promise<Banner[]> {
    return await bookstoreAPI.getBanners(limit)
  }

  /**
   * Increment book view count
   */
  async incrementBookView(bookId: string): Promise<void> {
    try {
      await bookstoreAPI.incrementBookView(bookId)
    } catch (error) {
      console.error('Failed to increment book view:', error)
    }
  }

  /**
   * Handle banner click
   */
  async handleBannerClick(bannerId: string): Promise<void> {
    try {
      await bookstoreAPI.incrementBannerClick(bannerId)
    } catch (error) {
      console.error('Failed to increment banner click:', error)
    }
  }

  /**
   * Validate search params
   */
  validateSearchParams(params: SearchParams): boolean {
    if (!params.keyword || params.keyword.trim().length < 2) {
      return false
    }
    return true
  }

  /**
   * Format book data for display
   */
  formatBookBrief(book: BookBrief): BookBrief {
    return {
      ...book,
      cover: book.cover || '/default-book-cover.jpg',
      viewCount: book.viewCount || 0,
      rating: book.rating ? Math.round(book.rating * 10) / 10 : 0
    }
  }

  /**
   * Clear cached data
   */
  clearCache(): void {
    // Cache functionality removed for now
    // Can be implemented later if needed
  }
}

export const bookstoreService = new BookstoreService()
export default bookstoreService

