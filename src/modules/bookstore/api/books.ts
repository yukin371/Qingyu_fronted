/**
 * 书城 - 书籍相关API
 */

import { httpService } from '@/core/services/http.service'
import type {
  Book,
  BookDetail,
  SearchParams,
  PaginationResponse,
} from '@/types/bookstore'
import type { APIResponse } from '@/types/api'

// 后端实际返回的分页响应格式
// { code, message, data: Book[], total, page, size }
interface PaginatedAPIResponse {
  code: number
  message: string
  data: Book[]
  total: number
  page: number
  size: number
}

/**
 * 获取书籍列表（通过推荐或搜索）
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

/**
 * 获取书籍详情
 * GET /api/v1/bookstore/books/:id
 */
export function getBookDetail(bookId: string) {
  return httpService.get<BookDetail>(`/bookstore/books/${bookId}`)
}

/**
 * 搜索书籍
 * GET /api/v1/bookstore/books/search
 */
export function searchBooks(params: SearchParams) {
  return httpService.get<PaginationResponse<Book>>('/bookstore/books/search', { params })
}

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
 * 增加书籍浏览量
 * POST /api/v1/bookstore/books/:id/view
 */
export function incrementBookView(bookId: string) {
  return httpService.post<void>(`/bookstore/books/${bookId}/view`)
}

