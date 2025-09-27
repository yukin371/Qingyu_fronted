import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 书城API接口
export const bookstoreAPI = {
  // 获取首页数据
  getHomepage() {
    return api.get('/bookstore/homepage')
  },

  // 获取实时榜
  getRealtimeRanking(limit = 20) {
    return api.get('/bookstore/rankings/realtime', {
      params: { limit }
    })
  },

  // 获取周榜
  getWeeklyRanking(period = '', limit = 20) {
    return api.get('/bookstore/rankings/weekly', {
      params: { period, limit }
    })
  },

  // 获取月榜
  getMonthlyRanking(period = '', limit = 20) {
    return api.get('/bookstore/rankings/monthly', {
      params: { period, limit }
    })
  },

  // 获取新人榜
  getNewbieRanking(period = '', limit = 20) {
    return api.get('/bookstore/rankings/newbie', {
      params: { period, limit }
    })
  },

  // 获取Banner列表
  getBanners(limit = 5) {
    return api.get('/bookstore/banners', {
      params: { limit }
    })
  },

  // 获取书籍详情
  getBookById(id) {
    return api.get(`/bookstore/books/${id}`)
  },

  // 获取推荐书籍
  getRecommendedBooks(page = 1, size = 20) {
    return api.get('/bookstore/books/recommended', {
      params: { page, size }
    })
  },

  // 获取精选书籍
  getFeaturedBooks(page = 1, size = 20) {
    return api.get('/bookstore/books/featured', {
      params: { page, size }
    })
  },

  // 搜索书籍
  searchBooks(keyword, filters = {}) {
    return api.get('/bookstore/books/search', {
      params: { keyword, ...filters }
    })
  },

  // 增加书籍浏览量
  incrementBookView(id) {
    return api.post(`/bookstore/books/${id}/view`)
  },

  // 增加Banner点击次数
  incrementBannerClick(id) {
    return api.post(`/bookstore/banners/${id}/click`)
  }
}

export default api