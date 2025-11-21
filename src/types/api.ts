/**
 * API v1.3 基础类型定义
 * 统一响应格式，支持 timestamp 和 request_id
 */

// ==================== 基础响应类型 ====================

/**
 * 标准API响应格式 (v1.3)
 */
export interface APIResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp: number // Unix时间戳
  request_id?: string // 请求追踪ID
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  code: number
  message: string
  error?: string // 详细错误信息
  timestamp: number
  request_id?: string
}

/**
 * 分页信息 (v1.3)
 */
export interface Pagination {
  total: number
  page: number
  page_size: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

/**
 * 分页响应格式 (v1.3)
 */
export interface PaginatedResponse<T = any> {
  code: number
  message: string
  data: T[]
  pagination: Pagination
  timestamp: number
  request_id?: string
}

// ==================== 向后兼容类型 ====================

/**
 * @deprecated 使用 APIResponse 代替
 */
export interface ApiResponse<T = any> extends APIResponse<T> {}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  page_size?: number
  size?: number // 兼容旧参数名
}

// ==================== 推荐系统基础类型 ====================
// 注意：详细类型定义在 recommendation.ts

export interface RecommendationItem {
  bookId: string
  title: string
  author: string
  cover?: string
  rating?: number
  reason?: string
  score?: number
}

export interface RecommendationBehavior {
  itemId: string
  behaviorType: 'view' | 'click' | 'favorite' | 'purchase'
  context?: Record<string, unknown>
}
