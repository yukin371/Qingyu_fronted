/**
 * 评论API模块 (v1.3) ⭐️包含点赞功能
 * 基于 doc/api/frontend/阅读器API参考.md
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import type {
  Comment,
  CommentListResponse,
  GetCommentListParams,
  CreateCommentParams,
  UpdateCommentParams,
  ReplyCommentParams
} from '@/types/reader'

/**
 * 评论API接口 (v1.3)
 */
export const commentAPI = {
  /**
   * 发表评论
   */
  async createComment(params: CreateCommentParams): Promise<APIResponse<Comment>> {
    return httpService.post<APIResponse<Comment>>('/reader/comments', params)
  },

  /**
   * 获取评论列表
   */
  async getCommentList(params: GetCommentListParams): Promise<APIResponse<CommentListResponse>> {
    return httpService.get<APIResponse<CommentListResponse>>('/reader/comments', { params })
  },

  /**
   * 获取评论详情
   */
  async getCommentById(commentId: string): Promise<APIResponse<Comment>> {
    return httpService.get<APIResponse<Comment>>(`/reader/comments/${commentId}`)
  },

  /**
   * 更新评论
   */
  async updateComment(commentId: string, params: UpdateCommentParams): Promise<APIResponse<Comment>> {
    return httpService.put<APIResponse<Comment>>(`/reader/comments/${commentId}`, params)
  },

  /**
   * 删除评论
   */
  async deleteComment(commentId: string): Promise<APIResponse<null>> {
    return httpService.delete<APIResponse<null>>(`/reader/comments/${commentId}`)
  },

  /**
   * 回复评论
   */
  async replyComment(commentId: string, params: ReplyCommentParams): Promise<APIResponse<Comment>> {
    return httpService.post<APIResponse<Comment>>(`/reader/comments/${commentId}/reply`, params)
  },

  /**
   * 点赞评论 ⭐️v1.3新增
   */
  async likeComment(commentId: string): Promise<APIResponse<null>> {
    return httpService.post<APIResponse<null>>(`/reader/comments/${commentId}/like`)
  },

  /**
   * 取消点赞评论 ⭐️v1.3新增
   */
  async unlikeComment(commentId: string): Promise<APIResponse<null>> {
    return httpService.delete<APIResponse<null>>(`/reader/comments/${commentId}/like`)
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

