import request from '@/utils/request'

/**
 * 书签相关API
 */

// 获取用户所有书签
export function getUserBookmarks(params?: {
  page?: number
  size?: number
  bookId?: string
}) {
  return request.get('/api/v1/reader/bookmarks', { params })
}

// 创建书签
export function createBookmark(data: {
  chapterId: string
  position: number
  note?: string
  highlightText?: string
}) {
  return request.post('/api/v1/reader/bookmarks', data)
}

// 更新书签
export function updateBookmark(bookmarkId: string, data: {
  note?: string
  highlightText?: string
}) {
  return request.put(`/api/v1/reader/bookmarks/${bookmarkId}`, data)
}

// 删除书签
export function deleteBookmark(bookmarkId: string) {
  return request.delete(`/api/v1/reader/bookmarks/${bookmarkId}`)
}

// 获取章节书签
export function getChapterBookmarks(chapterId: string) {
  return request.get(`/api/v1/reader/chapters/${chapterId}/bookmarks`)
}

// 批量删除书签
export function batchDeleteBookmarks(bookmarkIds: string[]) {
  return request.post('/api/v1/reader/bookmarks/batch-delete', {
    bookmarkIds
  })
}

