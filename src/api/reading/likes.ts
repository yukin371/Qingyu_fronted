/**
 * 点赞相关API
 *
 * 对接后端 /api/v1/reader/likes 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'

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
 * 点赞书籍
 * POST /api/v1/reader/books/:bookId/like
 */
export function likeBook(bookId: string) {
  return httpService.post<void>(`/reader/books/${bookId}/like`)
}

/**
 * 取消点赞书籍
 * DELETE /api/v1/reader/books/:bookId/like
 */
export function unlikeBook(bookId: string) {
  return httpService.delete<void>(`/reader/books/${bookId}/like`)
}

/**
 * 获取书籍点赞信息
 * GET /api/v1/reader/books/:bookId/like/info
 */
export function getBookLikeInfo(bookId: string) {
  return httpService.get<LikeInfo>(`/reader/books/${bookId}/like/info`)
}

/**
 * 获取用户点赞的书籍列表
 * GET /api/v1/reader/likes/books
 */
export function getUserLikedBooks(params?: { page?: number; pageSize?: number }) {
  return httpService.get('/reader/likes/books', { params })
}

/**
 * 获取用户点赞统计
 * GET /api/v1/reader/likes/stats
 */
export function getUserLikeStats() {
  return httpService.get<UserLikeStats>('/reader/likes/stats')
}

/**
 * 点赞评论
 * POST /api/v1/reader/comments/:id/like
 */
export function likeComment(commentId: string) {
  return httpService.post<void>(`/reader/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 * DELETE /api/v1/reader/comments/:id/like
 */
export function unlikeComment(commentId: string) {
  return httpService.delete<void>(`/reader/comments/${commentId}/like`)
}
