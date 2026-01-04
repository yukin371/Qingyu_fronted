/**
 * 点赞相关 API
 * 对接后端 /api/v1/social/ 路由
 * 后端路由文档: Qingyu_backend/router/social/social_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 点赞信息
 */
export interface LikeInfo {
  isLiked: boolean
  likeCount: number
}

/**
 * 用户点赞统计
 */
export interface UserLikeStats {
  totalLikes: number
  bookLikes: number
  commentLikes: number
}

/**
 * 点赞 API 接口 (v2.0)
 * 对接后端: /api/v1/social/
 */
export const likesAPI = {
  /**
   * 点赞书籍
   * POST /api/v1/social/books/:bookId/like
   */
  async likeBook(bookId: string): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>(`/social/books/${bookId}/like`)
  },

  /**
   * 取消点赞书籍
   * DELETE /api/v1/social/books/:bookId/like
   */
  async unlikeBook(bookId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/books/${bookId}/like`)
  },

  /**
   * 获取书籍点赞信息
   * GET /api/v1/social/books/:bookId/like
   */
  async getBookLikeInfo(bookId: string): Promise<APIResponse<LikeInfo>> {
    return httpService.get<APIResponse<LikeInfo>>(`/social/books/${bookId}/like`)
  },

  /**
   * 获取用户点赞的书籍列表
   * GET /api/v1/social/likes/books
   */
  async getUserLikedBooks(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<any>> {
    return httpService.get<PaginatedResponse<any>>('/social/likes/books', { params })
  },

  /**
   * 获取用户点赞统计
   * GET /api/v1/social/likes/stats
   */
  async getUserLikeStats(): Promise<APIResponse<UserLikeStats>> {
    return httpService.get<APIResponse<UserLikeStats>>('/social/likes/stats')
  }
}

// 向后兼容：导出旧的函数名
export const likeBook = (bookId: string) => likesAPI.likeBook(bookId)
export const unlikeBook = (bookId: string) => likesAPI.unlikeBook(bookId)
export const getBookLikeInfo = (bookId: string) => likesAPI.getBookLikeInfo(bookId)
export const getUserLikedBooks = (params?: any) => likesAPI.getUserLikedBooks(params)
export const getUserLikeStats = () => likesAPI.getUserLikeStats()

export default likesAPI
