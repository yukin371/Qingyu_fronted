import request from '@/utils/request'

/**
 * 阅读历史相关API
 */

// 获取阅读历史
export function getReadingHistory(params?: {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
}) {
  return request.get('/api/v1/reader/history', { params })
}

// 记录阅读历史
export function recordReadingHistory(data: {
  bookId: string
  chapterId: string
  position: number
  duration?: number
}) {
  return request.post('/api/v1/reader/history', data)
}

// 删除阅读历史
export function deleteHistory(historyId: string) {
  return request.delete(`/api/v1/reader/history/${historyId}`)
}

// 批量删除历史记录
export function batchDeleteHistory(historyIds: string[]) {
  return request.post('/api/v1/reader/history/batch-delete', {
    historyIds
  })
}

// 清空阅读历史
export function clearHistory() {
  return request.delete('/api/v1/reader/history/clear')
}

// 获取书籍阅读进度
export function getBookProgress(bookId: string) {
  return request.get(`/api/v1/reader/books/${bookId}/progress`)
}

// 更新阅读进度
export function updateReadingProgress(data: {
  bookId: string
  chapterId: string
  position: number
  percentage?: number
}) {
  return request.put('/api/v1/reader/progress', data)
}

