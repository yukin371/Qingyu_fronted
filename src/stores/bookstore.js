import { defineStore } from 'pinia'
import { bookstoreAPI } from '@/api/bookstore'

export const useBookstoreStore = defineStore('bookstore', {
  state: () => ({
    // 首页数据
    homepageData: null,
    loading: false,
    error: null,

    // 榜单数据
    rankings: {
      realtime: [],
      weekly: [],
      monthly: [],
      newbie: []
    },

    // Banner数据
    banners: [],

    // 书籍数据
    books: {
      recommended: [],
      featured: [],
      searchResults: []
    },

    // 分类数据
    categories: []
  }),

  getters: {
    // 获取首页Banner
    getHomepageBanners: (state) => {
      return state.homepageData?.banners || state.banners
    },

    // 获取首页推荐书籍
    getHomepageRecommended: (state) => {
      return state.homepageData?.recommendedBooks || []
    },

    // 获取首页精选书籍
    getHomepageFeatured: (state) => {
      return state.homepageData?.featuredBooks || []
    },

    // 获取首页榜单数据
    getHomepageRankings: (state) => {
      return state.homepageData?.rankings || {}
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
        } else {
          throw new Error(response.message || '获取首页数据失败')
        }
      } catch (error) {
        this.error = error.message
        console.error('获取首页数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 获取榜单数据
    async fetchRanking(type, period = '', limit = 20) {
      try {
        let response
        switch (type) {
          case 'realtime':
            response = await bookstoreAPI.getRealtimeRanking(limit)
            break
          case 'weekly':
            response = await bookstoreAPI.getWeeklyRanking(period, limit)
            break
          case 'monthly':
            response = await bookstoreAPI.getMonthlyRanking(period, limit)
            break
          case 'newbie':
            response = await bookstoreAPI.getNewbieRanking(period, limit)
            break
          default:
            throw new Error('无效的榜单类型')
        }

        if (response.code === 200) {
          this.rankings[type] = response.data
        } else {
          throw new Error(response.message || `获取${type}榜单失败`)
        }
      } catch (error) {
        console.error(`获取${type}榜单失败:`, error)
        throw error
      }
    },

    // 获取Banner列表
    async fetchBanners(limit = 5) {
      try {
        const response = await bookstoreAPI.getBanners(limit)
        if (response.code === 200) {
          this.banners = response.data
        } else {
          throw new Error(response.message || '获取Banner失败')
        }
      } catch (error) {
        console.error('获取Banner失败:', error)
        throw error
      }
    },

    // 获取推荐书籍
    async fetchRecommendedBooks(page = 1, size = 20) {
      try {
        const response = await bookstoreAPI.getRecommendedBooks(page, size)
        if (response.code === 200) {
          this.books.recommended = response.data
        } else {
          throw new Error(response.message || '获取推荐书籍失败')
        }
      } catch (error) {
        console.error('获取推荐书籍失败:', error)
        throw error
      }
    },

    // 获取精选书籍
    async fetchFeaturedBooks(page = 1, size = 20) {
      try {
        const response = await bookstoreAPI.getFeaturedBooks(page, size)
        if (response.code === 200) {
          this.books.featured = response.data
        } else {
          throw new Error(response.message || '获取精选书籍失败')
        }
      } catch (error) {
        console.error('获取精选书籍失败:', error)
        throw error
      }
    },

    // 搜索书籍
    async searchBooks(keyword, filters = {}) {
      try {
        const response = await bookstoreAPI.searchBooks(keyword, filters)
        if (response.code === 200) {
          this.books.searchResults = response.data
        } else {
          throw new Error(response.message || '搜索书籍失败')
        }
      } catch (error) {
        console.error('搜索书籍失败:', error)
        throw error
      }
    },

    // 增加书籍浏览量
    async incrementBookView(bookId) {
      try {
        await bookstoreAPI.incrementBookView(bookId)
      } catch (error) {
        console.error('增加浏览量失败:', error)
      }
    },

    // 增加Banner点击次数
    async incrementBannerClick(bannerId) {
      try {
        await bookstoreAPI.incrementBannerClick(bannerId)
      } catch (error) {
        console.error('增加Banner点击次数失败:', error)
      }
    }
  }
})