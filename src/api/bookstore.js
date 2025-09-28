import request from '@/utils/request'

// 书城API接口
export const bookstoreAPI = {
  // 获取首页数据
  getHomepage() {
    return request.get('/bookstore/homepage')
  },

  // 获取实时榜
  getRealtimeRanking(limit = 20) {
    return request.get('/bookstore/rankings/realtime', {
      params: { limit }
    })
  },

  // 获取周榜
  getWeeklyRanking(period = '', limit = 20) {
    return request.get('/bookstore/rankings/weekly', {
      params: { period, limit }
    })
  },

  // 获取月榜
  getMonthlyRanking(period = '', limit = 20) {
    return request.get('/bookstore/rankings/monthly', {
      params: { period, limit }
    })
  },

  // 获取新人榜
  getNewbieRanking(period = '', limit = 20) {
    return request.get('/bookstore/rankings/newbie', {
      params: { period, limit }
    })
  },

  // 获取Banner列表
  getBanners(limit = 5) {
    return request.get('/bookstore/banners', {
      params: { limit }
    })
  },

  // 获取书籍详情
  getBookById(id) {
    return request.get(`/bookstore/books/${id}`)
  },

  // 获取推荐书籍
  getRecommendedBooks(page = 1, size = 20) {
    return request.get('/bookstore/books/recommended', {
      params: { page, size }
    })
  },

  // 获取精选书籍
  getFeaturedBooks(page = 1, size = 20) {
    return request.get('/bookstore/books/featured', {
      params: { page, size }
    })
  },

  // 搜索书籍
  searchBooks(keyword, filters = {}) {
    return request.get('/bookstore/books/search', {
      params: { keyword, ...filters }
    })
  },

  // 增加书籍浏览量
  incrementBookView(id) {
    return request.post(`/bookstore/books/${id}/view`)
  },

  // 增加Banner点击次数
  incrementBannerClick(id) {
    return request.post(`/bookstore/banners/${id}/click`)
  }
}