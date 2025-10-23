import request from '@/utils/request'

/**
 * 评论相关API
 */

// 获取书籍评论列表
export function getBookComments(bookId: string, params?: {
  page?: number
  size?: number
  sortBy?: 'time' | 'likes'
}) {
  return request.get(`/api/v1/books/${bookId}/comments`, { params })
}

// 发表评论
export function createComment(bookId: string, content: string, rating?: number) {
  return request.post(`/api/v1/books/${bookId}/comments`, {
    content,
    rating
  })
}

// 回复评论
export function replyComment(commentId: string, content: string) {
  return request.post(`/api/v1/comments/${commentId}/replies`, {
    content
  })
}

// 删除评论
export function deleteComment(commentId: string) {
  return request.delete(`/api/v1/comments/${commentId}`)
}

// 点赞评论
export function likeComment(commentId: string) {
  return request.post(`/api/v1/comments/${commentId}/like`)
}

// 取消点赞评论
export function unlikeComment(commentId: string) {
  return request.delete(`/api/v1/comments/${commentId}/like`)
}

// 获取章节评论
export function getChapterComments(chapterId: string, params?: {
  page?: number
  size?: number
}) {
  return request.get(`/api/v1/chapters/${chapterId}/comments`, { params })
}

