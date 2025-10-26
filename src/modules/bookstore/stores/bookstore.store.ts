/**
 * Bookstore Store (refactored with service layer)
 */

import { defineStore } from 'pinia'
import { bookstoreService } from '../services/bookstore.service'
import { searchService } from '../services/search.service'
import type {
  Book,
  BookBrief,
  Banner,
  RankingItem,
  Category,
  HomepageData,
  SearchFilter,
  SearchParams
} from '../types/bookstore.types'

export interface BookstoreState {
  homepageData: HomepageData | null
  loading: boolean
  error: string | null
  rankings: {
    realtime: RankingItem[]
    weekly: RankingItem[]
    monthly: RankingItem[]
    newbie: RankingItem[]
  }
  banners: Banner[]
  books: {
    recommended: BookBrief[]
    featured: BookBrief[]
    searchResults: BookBrief[]
    categoryBooks: Record<string, BookBrief[]>
  }
  categories: Category[]
  searchKeyword: string
  searchFilters: Partial<SearchFilter>
  searchLoading: boolean
  searchHistory: string[]
  currentBook: Book | null
  bookLoading: boolean
}

export const useBookstoreStore = defineStore('bookstore', {
  state: (): BookstoreState => ({
    homepageData: null,
    loading: false,
    error: null,
    rankings: {
      realtime: [],
      weekly: [],
      monthly: [],
      newbie: []
    },
    banners: [],
    books: {
      recommended: [],
      featured: [],
      searchResults: [],
      categoryBooks: {}
    },
    categories: [],
    searchKeyword: '',
    searchFilters: {},
    searchLoading: false,
    searchHistory: [],
    currentBook: null,
    bookLoading: false
  }),

  getters: {
    getCategoryBooks: (state) => (categoryId: string): BookBrief[] => {
      return state.books.categoryBooks[categoryId] || []
    },

    hasSearchResults: (state): boolean => {
      return state.books.searchResults.length > 0
    },

    searchResultsCount: (state): number => {
      return state.books.searchResults.length
    }
  },

  actions: {
    /**
     * Fetch homepage data using service
     */
    async fetchHomepageData(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const data = await bookstoreService.getHomepageData()
        this.homepageData = data

        // Update state
        if (data.rankings) {
          this.rankings = data.rankings
        }
        if (data.banners) {
          this.banners = data.banners
        }
        if (data.recommendedBooks) {
          this.books.recommended = data.recommendedBooks
        }
        if (data.featuredBooks) {
          this.books.featured = data.featuredBooks
        }
        if (data.categories) {
          this.categories = data.categories
        }
      } catch (error: any) {
        console.error('获取首页数据失败:', error)
        this.error = '获取首页数据失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch rankings
     */
    async fetchRankings(type?: 'realtime' | 'weekly' | 'monthly' | 'newbie'): Promise<void> {
      this.loading = true
      this.error = null

      try {
        if (type) {
          const data = await bookstoreService.getRanking(type)
          this.rankings[type] = data
        } else {
          const data = await bookstoreService.getAllRankings()
          this.rankings = data
        }
      } catch (error: any) {
        console.error('获取排行榜失败:', error)
        this.error = '获取排行榜失败'
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch book detail
     */
    async fetchBookDetail(bookId: string): Promise<void> {
      this.bookLoading = true
      this.error = null

      try {
        this.currentBook = await bookstoreService.getBookDetail(bookId)
      } catch (error: any) {
        console.error('获取书籍详情失败:', error)
        this.error = '获取书籍详情失败'
      } finally {
        this.bookLoading = false
      }
    },

    /**
     * Search books
     */
    async searchBooks(keyword: string, filters: Partial<SearchFilter> = {}): Promise<void> {
      const validation = searchService.validateKeyword(keyword)
      if (!validation.valid) {
        this.error = validation.message || '搜索关键词无效'
        return
      }

      this.searchLoading = true
      this.searchKeyword = keyword
      this.searchFilters = filters

      try {
        const params = searchService.buildSearchParams(keyword, filters)
        const result = await bookstoreService.searchBooks(params)
        this.books.searchResults = result.books

        // Add to history
        searchService.addToHistory(keyword)
        this.searchHistory = searchService.getSearchHistory()
      } catch (error: any) {
        console.error('搜索书籍失败:', error)
        this.books.searchResults = []
        this.error = '搜索失败'
      } finally {
        this.searchLoading = false
      }
    },

    /**
     * Load search history
     */
    loadSearchHistory(): void {
      this.searchHistory = searchService.getSearchHistory()
    },

    /**
     * Clear search history
     */
    clearSearchHistory(): void {
      searchService.clearHistory()
      this.searchHistory = []
    },

    /**
     * Clear search results
     */
    clearSearchResults(): void {
      this.books.searchResults = []
      this.searchKeyword = ''
      this.searchFilters = {}
    },

    /**
     * Fetch recommended books
     */
    async fetchRecommendedBooks(page: number = 1, size: number = 20): Promise<void> {
      try {
        this.books.recommended = await bookstoreService.getRecommendedBooks(page, size)
      } catch (error) {
        console.error('获取推荐书籍失败:', error)
      }
    },

    /**
     * Fetch featured books
     */
    async fetchFeaturedBooks(page: number = 1, size: number = 20): Promise<void> {
      try {
        this.books.featured = await bookstoreService.getFeaturedBooks(page, size)
      } catch (error) {
        console.error('获取精选书籍失败:', error)
      }
    },

    /**
     * Fetch categories
     */
    async fetchCategories(): Promise<void> {
      try {
        this.categories = await bookstoreService.getCategories()
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    },

    /**
     * Handle banner click
     */
    async handleBannerClick(bannerId: string): Promise<void> {
      await bookstoreService.handleBannerClick(bannerId)
    },

    /**
     * Increment book view count
     */
    async incrementBookView(bookId: string): Promise<void> {
      try {
        await bookstoreService.incrementBookView(bookId)
      } catch (error) {
        console.error('更新浏览量失败:', error)
      }
    },

    /**
     * Clear error
     */
    clearError(): void {
      this.error = null
    },

    /**
     * Reset state
     */
    resetState(): void {
      this.$reset()
    }
  }
})

export default useBookstoreStore

