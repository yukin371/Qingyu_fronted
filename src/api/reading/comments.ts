/**
 * 评论API模块
 *
 * 对接后端 /api/v1/reader/comments 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { PaginatedResponse } from '@/types/api'
import type {
  Comment,
  CommentListResponse,
  GetCommentListParams,
  CreateCommentParams,
  UpdateCommentParams,
  ReplyCommentParams
} from '@/types/reader'

/**
 * 评论API接口
 */
export const commentAPI = {
  /**
   * 发表评论
   * POST /api/v1/reader/comments
   */
  async createComment(params: CreateCommentParams): Promise<Comment> {
    return httpService.post<Comment>('/reader/comments', params)
  },

  /**
   * 获取评论列表
   * GET /api/v1/reader/comments
   */
  async getCommentList(params: GetCommentListParams): Promise<CommentListResponse> {
    return httpService.get<CommentListResponse>('/reader/comments', { params })
  },

  /**
   * 获取评论详情
   * GET /api/v1/reader/comments/:id
   */
  async getCommentById(commentId: string): Promise<Comment> {
    return httpService.get<Comment>(`/reader/comments/${commentId}`)
  },

  /**
   * 更新评论
   * PUT /api/v1/reader/comments/:id
   */
  async updateComment(commentId: string, params: UpdateCommentParams): Promise<Comment> {
    return httpService.put<Comment>(`/reader/comments/${commentId}`, params)
  },

  /**
   * 删除评论
   * DELETE /api/v1/reader/comments/:id
   */
  async deleteComment(commentId: string): Promise<void> {
    return httpService.delete<void>(`/reader/comments/${commentId}`)
  },

  /**
   * 回复评论
   * POST /api/v1/reader/comments/:id/reply
   */
  async replyComment(commentId: string, params: ReplyCommentParams): Promise<Comment> {
    return httpService.post<Comment>(`/reader/comments/${commentId}/reply`, params)
  },

  /**
   * 点赞评论
   * POST /api/v1/reader/comments/:id/like
   */
  async likeComment(commentId: string): Promise<void> {
    return httpService.post<void>(`/reader/comments/${commentId}/like`)
  },

  /**
   * 取消点赞评论
   * DELETE /api/v1/reader/comments/:id/like
   */
  async unlikeComment(commentId: string): Promise<void> {
    return httpService.delete<void>(`/reader/comments/${commentId}/like`)
  }
}

// 向后兼容：导出旧的函数名
export const getBookComments = (bookId: string, params?: {
  page?: number
  size?: number
  sortBy?: 'time' | 'likes'
}) => {
  return commentAPI.getCommentList({
    book_id: bookId,
    page: params?.page,
    page_size: params?.size,
    sortBy: params?.sortBy
  })
}

export const createComment = (bookId: string, content: string, rating?: number) => {
  return commentAPI.createComment({ book_id: bookId, content, rating })
}

export const replyComment = (commentId: string, content: string) => {
  return commentAPI.replyComment(commentId, { content })
}

export const deleteComment = (commentId: string) => {
  return commentAPI.deleteComment(commentId)
}

export const likeComment = (commentId: string) => {
  return commentAPI.likeComment(commentId)
}

export const unlikeComment = (commentId: string) => {
  return commentAPI.unlikeComment(commentId)
}

export const getChapterComments = (chapterId: string, params?: {
  page?: number
  size?: number
}) => {
  return commentAPI.getCommentList({
    book_id: '', // 需要传入bookId
    chapter_id: chapterId,
    page: params?.page,
    page_size: params?.size
  })
}

export default commentAPI
