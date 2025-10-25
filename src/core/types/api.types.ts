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

