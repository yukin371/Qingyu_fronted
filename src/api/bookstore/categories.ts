/**
 * 书城 - 分类相关API
 */

import request from '@/utils/request'
import type { Book, Category, PaginationResponse } from '@/types/bookstore'

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
export function getBooksByCategory(
  categoryId: string,
  params?: {
    page?: number
    pageSize?: number
    sort?: string
  }
) {
  return request.get<PaginationResponse<Book>>(
    `/bookstore/categories/${categoryId}/books`,
    { params }
  )
}

