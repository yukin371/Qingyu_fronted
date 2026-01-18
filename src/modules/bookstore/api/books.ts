/**
 * 书城 - 书籍相关API
 */

import { httpService } from '@/core/services/http.service'
import type {
  Book,
  BookDetail,
  BookStatus,
  SearchParams,
  PaginationResponse,
  PaginatedAPIResponse,
} from '@/types/bookstore'
import type { BackendPaginatedResponse, APIResponse } from '@/types/bookstore'

/**
 * 辅助函数：转换分页响应
 */
function transformPagination<T>(res: any): PaginationResponse<T> {
  const raw = res as BackendPaginatedResponse<T>
  return {
    code: raw.code,
    message: raw.message,
    data: raw.data,
    timestamp: Date.now(),
    pagination: {
      total: raw.total,
      page: raw.page,
      page_size: raw.size,
      total_pages: Math.ceil(raw.total / raw.size),
      has_next: raw.page * raw.size < raw.total,
      has_previous: raw.page > 1,
    },
  }
}

// ==================== 书籍列表 ====================

/**
 * 获取书籍列表
 * GET /api/v1/bookstore/books/recommended
 */
export function getBookList(params?: {
  page?: number
  size?: number
  category?: string
  status?: string
  sort?: string
  order?: string
}): Promise<PaginatedAPIResponse> {
  // 使用推荐接口作为书籍列表的默认实现
  // 后端返回: { code, message, data: Book[], total, page, size }
  return httpService.get<PaginatedAPIResponse>(
    '/bookstore/books/recommended',
    { params, returnFullResponse: true }
  ) as Promise<PaginatedAPIResponse>
}

// ==================== 书籍详情 ====================

/**
 * 获取书籍详情
 * GET /api/v1/bookstore/books/:id
 */
export function getBookDetail(bookId: string) {
  return httpService.get<BookDetail>(`/bookstore/books/${bookId}`)
}

/**
 * 创建书籍
 * POST /api/v1/bookstore/books
 */
export function createBook(data: Partial<BookDetail>) {
  return httpService.post<BookDetail>('/bookstore/books', data)
}

/**
 * 更新书籍详情
 * PUT /api/v1/bookstore/books/:id
 */
export function updateBook(bookId: string, data: Partial<BookDetail>) {
  return httpService.put<BookDetail>(`/bookstore/books/${bookId}`, data)
}

/**
 * 删除书籍
 * DELETE /api/v1/bookstore/books/:id
 */
export function deleteBook(bookId: string) {
  return httpService.delete(`/bookstore/books/${bookId}`)
}

// ==================== 搜索 ====================

/**
 * 搜索书籍（全局搜索）
 * GET /api/v1/bookstore/books/search
 */
export function searchBooks(params: SearchParams) {
  return httpService.get<PaginationResponse<Book>>('/bookstore/books/search', { params })
}

/**
 * 按标题搜索
 */
export async function searchByTitle(title: string, page = 1, size = 20) {
  const res = await httpService.get<BackendPaginatedResponse<Book>>(
    '/bookstore/books/search/title',
    { title, page, size },
    { returnFullResponse: true }
  )
  return transformPagination<Book>(res)
}

/**
 * 按作者搜索
 */
export async function searchByAuthor(author: string, page = 1, size = 20) {
  const res = await httpService.get<BackendPaginatedResponse<Book>>(
    '/bookstore/books/search/author',
    { author, page, size },
    { returnFullResponse: true }
  )
  return transformPagination<Book>(res)
}

/**
 * 按状态获取书籍
 */
export async function getBooksByStatus(status: BookStatus, page = 1, size = 20) {
  const res = await httpService.get<BackendPaginatedResponse<Book>>(
    '/bookstore/books/status',
    { status, page, size },
    { returnFullResponse: true }
  )
  return transformPagination<Book>(res)
}

/**
 * 按标签获取书籍
 */
export async function getBooksByTags(tags: string[], page = 1, size = 20) {
  const res = await httpService.get<BackendPaginatedResponse<Book>>(
    '/bookstore/books/tags',
    { tags: tags.join(','), page, size },
    { returnFullResponse: true }
  )
  return transformPagination<Book>(res)
}

// ==================== 推荐与排行 ====================

/**
 * 获取推荐书籍
 * GET /api/v1/bookstore/books/recommended
 */
export function getRecommendedBooks(params?: { page?: number; pageSize?: number; limit?: number }) {
  return httpService.get<Book[]>('/bookstore/books/recommended', { params })
}

/**
 * 获取精选书籍
 * GET /api/v1/bookstore/books/featured
 */
export function getFeaturedBooks(limit = 10) {
  return httpService.get<Book[]>('/bookstore/books/featured', {
    params: { limit },
  })
}

/**
 * 获取热门书籍
 */
export function getPopularBooks(limit = 10) {
  return httpService.get<Book[]>('/bookstore/books/popular', { limit })
}

/**
 * 获取最新书籍
 */
export function getLatestBooks(limit = 10) {
  return httpService.get<Book[]>('/bookstore/books/latest', { limit })
}

/**
 * 获取相似书籍推荐
 */
export function getSimilarBooks(bookId: string, limit = 10) {
  return httpService.get<Book[]>(`/bookstore/books/${bookId}/similar`, { limit })
}

// ==================== 交互操作 ====================

/**
 * 增加书籍浏览量
 * POST /api/v1/bookstore/books/:id/view
 */
export function incrementBookView(bookId: string) {
  return httpService.post<void>(`/bookstore/books/${bookId}/view`)
}

/**
 * 获取书籍统计数据
 */
export function getBookStatistics(bookId: string) {
  return httpService.get<Record<string, any>>(`/bookstore/books/${bookId}/statistics`)
}

/**
 * 点赞书籍
 */
export function likeBook(bookId: string) {
  return httpService.post(`/bookstore/books/${bookId}/like`)
}

/**
 * 取消点赞
 */
export function unlikeBook(bookId: string) {
  return httpService.post(`/bookstore/books/${bookId}/unlike`)
}
