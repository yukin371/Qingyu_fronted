/**
 * 书城 - 分类相关API
 */

import { httpService } from '@/core/services/http.service'
import type { Book, Category, PaginationResponse } from '../types'
import type { APIResponse } from '@/types/api'

/**
 * 获取所有分类（展平的树结构）
 * GET /api/v1/bookstore/categories/tree
 */
export function getAllCategories(): Promise<APIResponse<Category[]>> {
  return httpService.get<APIResponse<Category[]>>(
    '/bookstore/categories/tree',
    undefined,
    { returnFullResponse: true }
  )
}

/**
 * 别名：获取所有分类
 */
export function getCategories(): Promise<APIResponse<Category[]>> {
  return getAllCategories()
}

/**
 * 获取分类树
 * GET /api/v1/bookstore/categories/tree
 */
export function getCategoryTree() {
  return httpService.get<Category[]>('/bookstore/categories/tree')
}

/**
 * 获取分类详情
 * GET /api/v1/bookstore/categories/:id
 */
export function getCategoryDetail(categoryId: string) {
  return httpService.get<Category>(`/bookstore/categories/${categoryId}`)
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
  return httpService.get<PaginationResponse<Book>>(
    `/bookstore/categories/${categoryId}/books`,
    { params }
  )
}
