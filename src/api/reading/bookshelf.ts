/**
 * 书架相关API
 *
 * 对接后端 /api/v1/reader/books 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'

/**
 * 书架状态
 */
export type BookshelfStatus = 'reading' | 'completed' | 'want_to_read'

/**
 * 书架项
 */
export interface BookshelfItem {
  bookId: string
  title: string
  author: string
  cover?: string
  status: BookshelfStatus
  progress?: number
  addedAt: string
  updatedAt: string
}

/**
 * 获取书架列表
 * GET /api/v1/reader/books
 */
export function getBookshelf() {
  return httpService.get<BookshelfItem[]>('/reader/books')
}

/**
 * 获取最近阅读
 * GET /api/v1/reader/books/recent
 */
export function getRecentReading() {
  return httpService.get<BookshelfItem[]>('/reader/books/recent')
}

/**
 * 获取未读完的书籍
 * GET /api/v1/reader/books/unfinished
 */
export function getUnfinishedBooks() {
  return httpService.get<BookshelfItem[]>('/reader/books/unfinished')
}

/**
 * 获取已读完的书籍
 * GET /api/v1/reader/books/finished
 */
export function getFinishedBooks() {
  return httpService.get<BookshelfItem[]>('/reader/books/finished')
}

/**
 * 添加到书架
 * POST /api/v1/reader/books/:bookId
 */
export function addToBookshelf(bookId: string) {
  return httpService.post<void>(`/reader/books/${bookId}`)
}

/**
 * 从书架移除
 * DELETE /api/v1/reader/books/:bookId
 */
export function removeFromBookshelf(bookId: string) {
  return httpService.delete<void>(`/reader/books/${bookId}`)
}

/**
 * 更新书架状态
 * PATCH /api/v1/reader/books/:bookId/status
 */
export function updateBookshelfStatus(bookId: string, status: BookshelfStatus) {
  return httpService.patch<void>(`/reader/books/${bookId}/status`, { status })
}

/**
 * 批量操作书架
 * POST /api/v1/reader/books/batch
 */
export function batchBookshelfOperation(operations: {
  action: 'add' | 'remove' | 'update'
  bookIds: string[]
  status?: BookshelfStatus
}) {
  return httpService.post<void>('/reader/books/batch', operations)
}
