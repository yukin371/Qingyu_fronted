import { defineStore } from 'pinia'
import { bookstoreAPI } from '@/api/bookstore'

export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
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
    // 获取排行榜数据
    getRankings: (state) => {
      return state.homepageData?.rankings || {}
    },

    // 获取分类书籍
    getCategoryBooks: (state) => (categoryId) => {
      return state.books.categoryBooks[categoryId] || []
    },

    // 是否有搜索结果
    hasSearchResults: (state) => {
      return state.books.searchResults.length > 0
    },

    // 搜索结果数量
    searchResultsCount: (state) => {
      return state.books.searchResults.length
    }
  },

  actions: {
    // 获取首页数据
    async fetchHomepageData() {
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
          if (response.data.books) {
            this.books.recommended = response.data.books.recommended || []
            this.books.featured = response.data.books.featured || []
          }
          if (response.data.categories) {
            this.categories = response.data.categories
          }
        } else {
          this.error = response.message || '获取首页数据失败'
        }
      } catch (error) {
        console.error('获取首页数据失败:', error)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    // 获取排行榜数据
    async fetchRankings(type = 'realtime') {
      this.loading = true
      this.error = null
      
      try {
        const response = await bookstoreAPI.getRankings(type)
        if (response.code === 200) {
          this.rankings[type] = response.data
        } else {
          this.error = response.message || '获取排行榜失败'
        }
      } catch (error) {
        console.error('获取排行榜失败:', error)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    // 获取轮播图数据
    async fetchBanners() {
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
    async fetchRecommendedBooks() {
      try {
        const response = await bookstoreAPI.getRecommendedBooks()
        if (response.code === 200) {
          this.books.recommended = response.data
        }
      } catch (error) {
        console.error('获取推荐书籍失败:', error)
      }
    },

    // 获取精选书籍
    async fetchFeaturedBooks() {
      try {
        const response = await bookstoreAPI.getFeaturedBooks()
        if (response.code === 200) {
          this.books.featured = response.data
        }
      } catch (error) {
        console.error('获取精选书籍失败:', error)
      }
    },

    // 搜索书籍
    async searchBooks(keyword, filters = {}) {
      this.searchLoading = true
      this.searchKeyword = keyword
      this.searchFilters = filters
      
      try {
        const response = await bookstoreAPI.searchBooks(keyword, filters)
        if (response.code === 200) {
          this.books.searchResults = response.data
        } else {
          this.books.searchResults = []
          this.error = response.message || '搜索失败'
        }
      } catch (error) {
        console.error('搜索书籍失败:', error)
        this.books.searchResults = []
        this.error = '网络错误，请稍后重试'
      } finally {
        this.searchLoading = false
      }
    },

    // 获取书籍详情
    async fetchBookDetail(bookId) {
      this.bookLoading = true
      this.error = null
      
      try {
        const response = await bookstoreAPI.getBookDetail(bookId)
        if (response.code === 200) {
          this.currentBook = response.data
        } else {
          this.error = response.message || '获取书籍详情失败'
        }
      } catch (error) {
        console.error('获取书籍详情失败:', error)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.bookLoading = false
      }
    },

    // 增加书籍浏览量
    async incrementBookView(bookId) {
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
    async incrementBannerClick(bannerId) {
      try {
        await bookstoreAPI.incrementBannerClick(bannerId)
      } catch (error) {
        console.error('增加轮播图点击量失败:', error)
      }
    },

    // 更新书籍浏览量（本地更新）
    updateBookViewCount(bookId) {
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
    clearSearchResults() {
      this.books.searchResults = []
      this.searchKeyword = ''
      this.searchFilters = {}
    },

    // 清除错误
    clearError() {
      this.error = null
    },

    // 重置状态
    resetState() {
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