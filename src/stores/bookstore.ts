import { defineStore } from 'pinia'
import { bookstoreAPI } from '@/api/bookstore'
import type {
  Book,
  BookBrief,
  Banner,
  RankingItem,
  Category,
  HomepageData,
  SearchFilter
} from '@/types/models'

/**
 * 书城状态接口
 */
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
  currentBook: Book | null
  bookLoading: boolean
}

export const useBookstoreStore = defineStore('bookstore', {
  state: (): BookstoreState => ({
    // 首页数据
    homepageData: null,

    // 加载状态
    loading: false,
    error: null,

    // 排行榜数据
    rankings: {
      realtime: [],
      weekly: [],
      monthly: [],
      newbie: []
    },

    // 轮播图数据
    banners: [],

    // 书籍数据
    books: {
      recommended: [],
      featured: [],
      searchResults: [],
      categoryBooks: {}
    },

    // 分类数据
    categories: [],

    // 搜索相关
    searchKeyword: '',
    searchFilters: {},
    searchLoading: false,

    // 当前书籍详情
    currentBook: null,
    bookLoading: false
  }),

  getters: {
    // 获取分类书籍
    getCategoryBooks: (state) => (categoryId: string): BookBrief[] => {
      return state.books.categoryBooks[categoryId] || []
    },

    // 是否有搜索结果
    hasSearchResults: (state): boolean => {
      return state.books.searchResults.length > 0
    },

    // 搜索结果数量
    searchResultsCount: (state): number => {
      return state.books.searchResults.length
    }
  },

  actions: {
    // 获取首页数据
    async fetchHomepageData(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const response = await bookstoreAPI.getHomepage()
        if (response.code === 200) {
          this.homepageData = response.data

          // 更新各个数据
          if (response.data.rankings) {
            this.rankings = response.data.rankings
          }
          if (response.data.banners) {
            this.banners = response.data.banners
          }
          if (response.data.recommendedBooks) {
            this.books.recommended = response.data.recommendedBooks
          }
          if (response.data.featuredBooks) {
            this.books.featured = response.data.featuredBooks
          }
          if (response.data.categories) {
            this.categories = response.data.categories
          }
        } else {
          this.error = response.message || '获取首页数据失败'
        }
      } catch (error: any) {
        console.error('获取首页数据失败:', error)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    // 获取排行榜数据
    async fetchRankings(type: 'realtime' | 'weekly' | 'monthly' | 'newbie' = 'realtime'): Promise<void> {
      this.loading = true
      this.error = null

      try {
        let response
        switch (type) {
          case 'realtime':
            response = await bookstoreAPI.getRealtimeRanking()
            break
          case 'weekly':
            response = await bookstoreAPI.getWeeklyRanking()
            break
          case 'monthly':
            response = await bookstoreAPI.getMonthlyRanking()
            break
          case 'newbie':
            response = await bookstoreAPI.getNewbieRanking()
            break
        }

        if (response.code === 200) {
          this.rankings[type] = response.data
        } else {
          this.error = response.message || '获取排行榜失败'
        }
      } catch (error: any) {
        console.error('获取排行榜失败:', error)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    // 获取轮播图数据
    async fetchBanners(): Promise<void> {
      try {
        const response = await bookstoreAPI.getBanners()
        if (response.code === 200) {
          this.banners = response.data
        }
      } catch (error) {
        console.error('获取轮播图失败:', error)
      }
    },

    // 获取推荐书籍
    async fetchRecommendedBooks(page: number = 1, size: number = 20): Promise<void> {
      try {
        const response = await bookstoreAPI.getRecommendedBooks(page, size)
        if (response.code === 200) {
          this.books.recommended = response.data
        }
      } catch (error) {
        console.error('获取推荐书籍失败:', error)
      }
    },

    // 获取精选书籍
    async fetchFeaturedBooks(page: number = 1, size: number = 20): Promise<void> {
      try {
        const response = await bookstoreAPI.getFeaturedBooks(page, size)
        if (response.code === 200) {
          this.books.featured = response.data
        }
      } catch (error) {
        console.error('获取精选书籍失败:', error)
      }
    },

    // 搜索书籍
    async searchBooks(keyword: string, filters: Partial<SearchFilter> = {}): Promise<void> {
      this.searchLoading = true
      this.searchKeyword = keyword
      this.searchFilters = filters

      try {
        const response = await bookstoreAPI.searchBooks(keyword, filters)
        if (response.code === 200) {
          this.books.searchResults = response.data.books
        } else {
          this.books.searchResults = []
          this.error = response.message || '搜索失败'
        }
      } catch (error: any) {
        console.error('搜索书籍失败:', error)
        this.books.searchResults = []
        this.error = '网络错误，请稍后重试'
      } finally {
        this.searchLoading = false
      }
    },

    // 获取书籍详情
    async fetchBookDetail(bookId: string): Promise<void> {
      this.bookLoading = true
      this.error = null

      try {
        const response = await bookstoreAPI.getBookById(bookId)
        if (response.code === 200) {
          this.currentBook = response.data
        } else {
          this.error = response.message || '获取书籍详情失败'
        }
      } catch (error: any) {
        console.error('获取书籍详情失败:', error)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.bookLoading = false
      }
    },

    // 增加书籍浏览量
    async incrementBookView(bookId: string): Promise<void> {
      try {
        await bookstoreAPI.incrementBookView(bookId)

        // 更新本地数据
        if (this.currentBook && this.currentBook.id === bookId) {
          this.currentBook.viewCount = (this.currentBook.viewCount || 0) + 1
        }

        // 更新书籍列表中的浏览量
        this.updateBookViewCount(bookId)
      } catch (error) {
        console.error('增加书籍浏览量失败:', error)
      }
    },

    // 增加轮播图点击量
    async incrementBannerClick(bannerId: string): Promise<void> {
      try {
        await bookstoreAPI.incrementBannerClick(bannerId)
      } catch (error) {
        console.error('增加轮播图点击量失败:', error)
      }
    },

    // 更新书籍浏览量（本地更新）
    updateBookViewCount(bookId: string): void {
      // 更新推荐书籍
      const recommendedIndex = this.books.recommended.findIndex(book => book.id === bookId)
      if (recommendedIndex !== -1) {
        this.books.recommended[recommendedIndex].viewCount = (this.books.recommended[recommendedIndex].viewCount || 0) + 1
      }

      // 更新精选书籍
      const featuredIndex = this.books.featured.findIndex(book => book.id === bookId)
      if (featuredIndex !== -1) {
        this.books.featured[featuredIndex].viewCount = (this.books.featured[featuredIndex].viewCount || 0) + 1
      }

      // 更新搜索结果
      const searchIndex = this.books.searchResults.findIndex(book => book.id === bookId)
      if (searchIndex !== -1) {
        this.books.searchResults[searchIndex].viewCount = (this.books.searchResults[searchIndex].viewCount || 0) + 1
      }
    },

    // 清除搜索结果
    clearSearchResults(): void {
      this.books.searchResults = []
      this.searchKeyword = ''
      this.searchFilters = {}
    },

    // 清除错误
    clearError(): void {
      this.error = null
    },

    // 重置状态
    resetState(): void {
      this.homepageData = null
      this.loading = false
      this.error = null
      this.rankings = {
        realtime: [],
        weekly: [],
        monthly: [],
        newbie: []
      }
      this.banners = []
      this.books = {
        recommended: [],
        featured: [],
        searchResults: [],
        categoryBooks: {}
      }
      this.categories = []
      this.searchKeyword = ''
      this.searchFilters = {}
      this.searchLoading = false
      this.currentBook = null
      this.bookLoading = false
    }
  }
})


