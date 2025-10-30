/**
 * 书城 - 书籍相关API
 */

import request from '@/utils/request'
import type {
  Book,
  BookDetail,
  SearchParams,
  PaginationResponse,
} from '@/types/bookstore'

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
export function getRecommendedBooks(params?: { page?: number; pageSize?: number; limit?: number }) {
  return request.get<Book[]>('/bookstore/books/recommended', { params })
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

