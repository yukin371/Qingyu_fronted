import { httpService } from '@/core/services/http.service'

/**
 * 书架相关API
 */

// 获取书架列表
export function getBookshelf(params?: {
  status?: 'reading' | 'completed' | 'want_to_read'
  page?: number
  size?: number
  sortBy?: 'updated_at' | 'created_at' | 'title'
  sortOrder?: 'asc' | 'desc'
}) {
  return httpService.get('/api/v1/reader/bookshelf', { params })
}

// 添加到书架
export function addToBookshelf(bookId: string, status?: string) {
  return httpService.post('/api/v1/reader/bookshelf', {
    bookId,
    status: status || 'want_to_read'
  })
}

// 更新书架状态
export function updateBookshelfStatus(bookId: string, status: string) {
  return httpService.put(`/api/v1/reader/bookshelf/${bookId}`, {
    status
  })
}

// 从书架移除
export function removeFromBookshelf(bookId: string) {
  return httpService.delete(`/api/v1/reader/bookshelf/${bookId}`)
}

// 批量操作
export function batchBookshelfOperation(operation: 'delete' | 'move', bookIds: string[], status?: string) {
  return httpService.post('/api/v1/reader/bookshelf/batch', {
    operation,
    bookIds,
    status
  })
}

// 检查书籍是否在书架
export function checkBookInShelf(bookId: string) {
  return httpService.get(`/api/v1/reader/bookshelf/${bookId}/status`)
}

