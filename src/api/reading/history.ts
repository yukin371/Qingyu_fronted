import request from '@/utils/request'

/**
 * 阅读历史相关API
 */

// 获取阅读历史
export function getReadingHistory(params?: {
  page?: number
  size?: number
  sortBy?: string
  period?: string
  keyword?: string
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

// 清空所有阅读历史
export function clearAllHistory() {
  return request.delete('/api/v1/reader/history/all')
}

// 清空阅读历史（别名）
export function clearHistory() {
  return clearAllHistory()
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

// 导出为对象方便统一调用
export const historyAPI = {
  getReadingHistory,
  recordReadingHistory,
  deleteHistory,
  batchDeleteHistory,
  clearAllHistory,
  clearHistory,
  getBookProgress,
  updateReadingProgress
}

