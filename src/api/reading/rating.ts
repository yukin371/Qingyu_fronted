import request from '@/utils/request'

/**
 * 评分相关API
 */

// 获取书籍评分统计
export function getBookRating(bookId: string) {
  return request.get(`/api/v1/books/${bookId}/rating`)
}

// 提交书籍评分
export function rateBook(bookId: string, score: number, review?: string) {
  return request.post(`/api/v1/books/${bookId}/rating`, {
    score,
    review
  })
}

// 获取用户对书籍的评分
export function getUserBookRating(bookId: string) {
  return request.get(`/api/v1/books/${bookId}/user-rating`)
}

// 更新评分
export function updateRating(bookId: string, score: number, review?: string) {
  return request.put(`/api/v1/books/${bookId}/rating`, {
    score,
    review
  })
}

// 删除评分
export function deleteRating(bookId: string) {
  return request.delete(`/api/v1/books/${bookId}/rating`)
}

