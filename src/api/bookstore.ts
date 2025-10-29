/**
 * 书城系统API
 * 首页、书籍、分类、Banner、排行榜
 */

import request from '@/utils/request'
import type {
  Book,
  BookDetail,
  HomepageData,
  Category,
  Banner,
  RankingItem,
  SearchParams,
  PaginationResponse,
} from '@/types/bookstore'

// ============ 首页和书籍 ============

/**
 * 获取书城首页数据
 * GET /api/v1/bookstore/homepage
 */
export function getHomepage() {
  return request.get<HomepageData>('/bookstore/homepage')
}

/**
 * 获取书籍详情
 * GET /api/v1/bookstore/books/:id
 */
export function getBookDetail(bookId: string) {
  return request.get<BookDetail>(`/bookstore/books/${bookId}`)
}

/**
 * 搜索书籍
 * GET /api/v1/bookstore/books/search
 */
export function searchBooks(params: SearchParams) {
  return request.get<PaginationResponse<Book>>('/bookstore/books/search', { params })
}

/**
 * 获取推荐书籍
 * GET /api/v1/bookstore/books/recommended
 */
export function getRecommendedBooks(limit = 10) {
  return request.get<Book[]>('/bookstore/books/recommended', {
    params: { limit },
  })
}

/**
 * 获取精选书籍
 * GET /api/v1/bookstore/books/featured
 */
export function getFeaturedBooks(limit = 10) {
  return request.get<Book[]>('/bookstore/books/featured', {
    params: { limit },
  })
}

/**
 * 增加书籍浏览量
 * POST /api/v1/bookstore/books/:id/view
 */
export function incrementBookView(bookId: string) {
  return request.post<void>(`/bookstore/books/${bookId}/view`)
}

// ============ 分类 ============

/**
 * 获取分类树
 * GET /api/v1/bookstore/categories/tree
 */
export function getCategoryTree() {
  return request.get<Category[]>('/bookstore/categories/tree')
}

/**
 * 获取分类详情
 * GET /api/v1/bookstore/categories/:id
 */
export function getCategoryDetail(categoryId: string) {
  return request.get<Category>(`/bookstore/categories/${categoryId}`)
}

/**
 * 根据分类获取书籍
 * GET /api/v1/bookstore/categories/:id/books
 */
export function getBooksByCategory(categoryId: string, params?: any) {
  return request.get<PaginationResponse<Book>>(`/bookstore/categories/${categoryId}/books`, {
    params,
  })
}

// ============ Banner ============

/**
 * 获取Banner列表
 * GET /api/v1/bookstore/banners
 */
export function getBanners() {
  return request.get<Banner[]>('/bookstore/banners')
}

/**
 * 增加Banner点击量
 * POST /api/v1/bookstore/banners/:id/click
 */
export function incrementBannerClick(bannerId: string) {
  return request.post<void>(`/bookstore/banners/${bannerId}/click`)
}

// ============ 排行榜 ============

/**
 * 获取实时榜
 * GET /api/v1/bookstore/rankings/realtime
 */
export function getRealtimeRanking(limit = 20) {
  return request.get<RankingItem[]>('/bookstore/rankings/realtime', {
    params: { limit },
  })
}

/**
 * 获取周榜
 * GET /api/v1/bookstore/rankings/weekly
 */
export function getWeeklyRanking(limit = 20) {
  return request.get<RankingItem[]>('/bookstore/rankings/weekly', {
    params: { limit },
  })
}

/**
 * 获取月榜
 * GET /api/v1/bookstore/rankings/monthly
 */
export function getMonthlyRanking(limit = 20) {
  return request.get<RankingItem[]>('/bookstore/rankings/monthly', {
    params: { limit },
  })
}

/**
 * 获取新人榜
 * GET /api/v1/bookstore/rankings/newbie
 */
export function getNewbieRanking(limit = 20) {
  return request.get<RankingItem[]>('/bookstore/rankings/newbie', {
    params: { limit },
  })
}

/**
 * 按类型获取榜单
 * GET /api/v1/bookstore/rankings/:type
 */
export function getRankingByType(type: string, limit = 20) {
  return request.get<RankingItem[]>(`/bookstore/rankings/${type}`, {
    params: { limit },
  })
}
