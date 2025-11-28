/**
 * Core API Types
 * Common types used across API modules
 */

/**
 * Standard API Response Format (v1.3)
 */
export interface APIResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: number
  request_id?: string
}

// ==================== 分页定义 ====================

/**
 * 前端统一使用的分页对象
 * (通常由 Service 层根据后端返回的 total/page/size 计算得出)
 */
export interface Pagination {
  total: number // 总条数
  page: number // 当前页
  page_size: number // 每页大小
  total_pages: number // 总页数 (计算得出)
  has_next: boolean // 是否有下一页 (计算得出)
  has_previous: boolean // 是否有上一页 (计算得出)
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number
  size?: number
}

/**
 * Pagination Response
 */
export interface PaginationResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  total_pages: number
}

/**
 * Sort Parameters
 */
export interface SortParams {
  sort_by?: string
  order?: 'asc' | 'desc'
}

/**
 * Filter Parameters
 */
export interface FilterParams {
  [key: string]: any
}

/**
 * Search Parameters
 */
export interface SearchParams extends PaginationParams, SortParams {
  keyword?: string
  filters?: FilterParams
}

/**
 * API Error
 */
export interface APIError {
  code: number
  message: string
  details?: any
  request_id?: string
  timestamp?: number
}

/**
 * Upload Response
 */
export interface UploadResponse {
  url: string
  filename: string
  size: number
  mime_type: string
}
