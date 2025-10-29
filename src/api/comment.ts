/**
 * 评论相关API
 */

import request from '@/utils/request'
import type { Comment, CreateCommentRequest } from '@/types/reader'
import type { PaginationResponse } from '@/types/api'

/**
 * 发表评论
 * POST /api/v1/reader/comments
 */
export function createComment(data: CreateCommentRequest) {
  return request.post<Comment>('/reader/comments', data)
}

/**
 * 获取评论列表
 * GET /api/v1/reader/comments
 */
export function getComments(params: {
  bookId?: string
  chapterId?: string
  parentId?: string
  page?: number
  pageSize?: number
  sortBy?: 'createdAt' | 'likeCount'
}) {
  return request.get<PaginationResponse<Comment>>('/reader/comments', { params })
}

/**
 * 获取评论详情
 * GET /api/v1/reader/comments/:id
 */
export function getCommentDetail(commentId: string) {
  return request.get<Comment>(`/reader/comments/${commentId}`)
}

/**
 * 更新评论
 * PUT /api/v1/reader/comments/:id
 */
export function updateComment(commentId: string, content: string) {
  return request.put<Comment>(`/reader/comments/${commentId}`, { content })
}

/**
 * 删除评论
 * DELETE /api/v1/reader/comments/:id
 */
export function deleteComment(commentId: string) {
  return request.delete<void>(`/reader/comments/${commentId}`)
}

/**
 * 回复评论
 * POST /api/v1/reader/comments/:id/reply
 */
export function replyComment(commentId: string, content: string) {
  return request.post<Comment>(`/reader/comments/${commentId}/reply`, { content })
}

/**
 * 点赞评论
 * POST /api/v1/reader/comments/:id/like
 */
export function likeComment(commentId: string) {
  return request.post<void>(`/reader/comments/${commentId}/like`)
}

/**
 * 取消点赞评论
 * DELETE /api/v1/reader/comments/:id/like
 */
export function unlikeComment(commentId: string) {
  return request.delete<void>(`/reader/comments/${commentId}/like`)
}

