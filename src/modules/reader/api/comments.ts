/**
 * 评论 API 模块
 * 对接后端 /api/v1/social/comments 路由
 * 后端路由文档: Qingyu_backend/router/social/social_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 评论信息
 */
export interface Comment {
  id: string
  bookId: string
  chapterId?: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  rating?: number
  likesCount: number
  repliesCount: number
  isLiked: boolean
  parentId?: string
  createdAt: string
  updatedAt: string
}

/**
 * 评论列表响应
 */
export interface CommentListResponse {
  comments: Comment[]
  total: number
  page: number
  pageSize: number
}

/**
 * 获取评论列表参数
 */
export interface GetCommentListParams {
  book_id?: string
  chapter_id?: string
  page?: number
  page_size?: number
  sortBy?: 'time' | 'likes'
}

/**
 * 创建评论参数
 */
export interface CreateCommentParams {
  book_id: string
  chapter_id?: string
  content: string
  rating?: number
}

/**
 * 更新评论参数
 */
export interface UpdateCommentParams {
  content?: string
  rating?: number
}

/**
 * 回复评论参数
 */
export interface ReplyCommentParams {
  content: string
}

/**
 * 评论 API 接口 (v2.0)
 * 对接后端: /api/v1/social/comments
 */
export const commentsAPI = {
  /**
   * 发表评论
   * POST /api/v1/social/comments
   */
  async createComment(params: CreateCommentParams): Promise<APIResponse<Comment>> {
    return httpService.post<APIResponse<Comment>>('/social/comments', params)
  },

  /**
   * 获取评论列表
   * GET /api/v1/social/comments
   */
  async getCommentList(params: GetCommentListParams): Promise<CommentListResponse> {
    return httpService.get<CommentListResponse>('/social/comments', { params })
  },

  /**
   * 获取评论详情
   * GET /api/v1/social/comments/:id
   */
  async getCommentById(commentId: string): Promise<APIResponse<Comment>> {
    return httpService.get<APIResponse<Comment>>(`/social/comments/${commentId}`)
  },

  /**
   * 更新评论
   * PUT /api/v1/social/comments/:id
   */
  async updateComment(
    commentId: string,
    params: UpdateCommentParams
  ): Promise<APIResponse<Comment>> {
    return httpService.put<APIResponse<Comment>>(`/social/comments/${commentId}`, params)
  },

  /**
   * 删除评论
   * DELETE /api/v1/social/comments/:id
   */
  async deleteComment(commentId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/comments/${commentId}`)
  },

  /**
   * 回复评论
   * POST /api/v1/social/comments/:id/reply
   */
  async replyComment(
    commentId: string,
    params: ReplyCommentParams
  ): Promise<APIResponse<Comment>> {
    return httpService.post<APIResponse<Comment>>(
      `/social/comments/${commentId}/reply`,
      params
    )
  },

  /**
   * 点赞评论
   * POST /api/v1/social/comments/:id/like
   */
  async likeComment(commentId: string): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>(`/social/comments/${commentId}/like`)
  },

  /**
   * 取消点赞评论
   * DELETE /api/v1/social/comments/:id/like
   */
  async unlikeComment(commentId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/comments/${commentId}/like`)
  }
}

// 向后兼容：导出旧的函数名
export const getBookComments = (bookId: string, params?: {
  page?: number
  size?: number
  sortBy?: 'time' | 'likes'
}) => {
  return commentsAPI.getCommentList({
    book_id: bookId,
    page: params?.page,
    page_size: params?.size,
    sortBy: params?.sortBy
  })
}

export const createComment = (bookId: string, content: string, rating?: number) => {
  return commentsAPI.createComment({ book_id: bookId, content, rating })
}

export const replyComment = (commentId: string, content: string) => {
  return commentsAPI.replyComment(commentId, { content })
}

export const deleteComment = (commentId: string) => {
  return commentsAPI.deleteComment(commentId)
}

export const likeComment = (commentId: string) => {
  return commentsAPI.likeComment(commentId)
}

export const unlikeComment = (commentId: string) => {
  return commentsAPI.unlikeComment(commentId)
}

export const getChapterComments = (chapterId: string, params?: {
  page?: number
  size?: number
}) => {
  return commentsAPI.getCommentList({
    book_id: '', // 需要传入bookId
    chapter_id: chapterId,
    page: params?.page,
    page_size: params?.size
  })
}

export default commentsAPI
