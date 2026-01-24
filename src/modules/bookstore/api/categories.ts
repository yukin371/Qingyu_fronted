/**
 * 书城 - 分类相关API
 */

import { httpService } from '@/core/services/http.service'
import type { Book, Category, PaginationResponse } from '../types'
import type { APIResponse } from '@/types/api'

/**
 * 获取所有分类（展平的树结构）
 * @description 获取所有书籍分类，返回完整的树结构数据
 * @endpoint GET /api/v1/bookstore/categories/tree
 * @category categories
 * @tags 分类相关
 * @response {APIResponse<Category[]>} 200 - 成功返回分类树
 */
export function getAllCategories(): Promise<APIResponse<Category[]>> {
  return httpService.get<APIResponse<Category[]>>(
    '/bookstore/categories/tree',
    undefined,
    { returnFullResponse: true }
  )
}

/**
 * 获取所有分类
 * @description getAllCategories 的别名函数，获取所有书籍分类
 * @endpoint GET /api/v1/bookstore/categories/tree
 * @category categories
 * @tags 分类相关
 * @response {APIResponse<Category[]>} 200 - 成功返回分类树
 */
export function getCategories(): Promise<APIResponse<Category[]>> {
  return getAllCategories()
}

/**
 * 获取分类树
 * @description 获取分类的树形结构数据
 * @endpoint GET /api/v1/bookstore/categories/tree
 * @category categories
 * @tags 分类相关
 * @response {Category[]} 200 - 成功返回分类树
 */
export function getCategoryTree() {
  return httpService.get<Category[]>('/bookstore/categories/tree')
}

/**
 * 获取分类详情
 * @description 根据分类ID获取分类的详细信息
 * @endpoint GET /api/v1/bookstore/categories/:id
 * @category categories
 * @tags 分类相关
 * @param {string} categoryId - 分类ID
 * @response {Category} 200 - 成功返回分类详情
 */
export function getCategoryDetail(categoryId: string) {
  return httpService.get<Category>(`/bookstore/categories/${categoryId}`)
}

/**
 * 根据分类获取书籍列表
 * @description 获取指定分类下的书籍列表，支持分页和排序
 * @endpoint GET /api/v1/bookstore/categories/:id/books
 * @category categories
 * @tags 分类相关
 * @param {string} categoryId - 分类ID
 * @param {Object} params - 查询参数（可选）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.pageSize - 每页数量（默认20）
 * @param {string} params.sort - 排序字段
 * @response {PaginationResponse<Book>} 200 - 成功返回书籍列表
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
