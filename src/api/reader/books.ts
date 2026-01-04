/**
 * 书架管理 API
 * 对接后端 /api/v1/reader/books 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 书架书籍信息
 */
export interface BookshelfBook {
  id: string
  title: string
  author: string
  cover?: string
  description?: string
  category: string
  status: 'serializing' | 'completed' | 'paused'
  totalChapters: number
  wordCount?: number
  lastReadTime?: string
  lastReadChapter?: string
  progress?: number
  updatedAt: string
}

/**
 * 书架查询参数
 */
export interface BookshelfParams {
  page?: number
  pageSize?: number
  status?: 'reading' | 'finished' | 'all'
  sortBy?: 'lastReadTime' | 'addTime' | 'updateTime'
}

/**
 * 书架API接口 (v1.0)
 * 对接后端: /api/v1/reader/books
 */
export const bookshelfAPI = {
  /**
   * 获取书架列表
   * GET /api/v1/reader/books
   */
  async getBookshelf(params?: BookshelfParams): Promise<PaginatedResponse<BookshelfBook>> {
    return httpService.get<PaginatedResponse<BookshelfBook>>('/reader/books', { params })
  },

  /**
   * 获取最近阅读
   * GET /api/v1/reader/books/recent
   */
  async getRecentReading(limit: number = 10): Promise<APIResponse<BookshelfBook[]>> {
    return httpService.get<APIResponse<BookshelfBook[]>>('/reader/books/recent', {
      params: { limit }
    })
  },

  /**
   * 获取未读完的书籍
   * GET /api/v1/reader/books/unfinished
   */
  async getUnfinishedBooks(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<BookshelfBook>> {
    return httpService.get<PaginatedResponse<BookshelfBook>>('/reader/books/unfinished', {
      params
    })
  },

  /**
   * 获取已读完的书籍
   * GET /api/v1/reader/books/finished
   */
  async getFinishedBooks(params?: {
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<BookshelfBook>> {
    return httpService.get<PaginatedResponse<BookshelfBook>>('/reader/books/finished', {
      params
    })
  },

  /**
   * 添加书籍到书架
   * POST /api/v1/reader/books/:bookId
   */
  async addToBookshelf(bookId: string): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>(`/reader/books/${bookId}`)
  },

  /**
   * 从书架移除书籍
   * DELETE /api/v1/reader/books/:bookId
   */
  async removeFromBookshelf(bookId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/reader/books/${bookId}`)
  }
}

// 向后兼容：导出旧的函数名
export const getBookshelf = (params?: BookshelfParams) => bookshelfAPI.getBookshelf(params)
export const getRecentReading = (limit?: number) => bookshelfAPI.getRecentReading(limit)
export const getUnfinishedBooks = (params?: any) => bookshelfAPI.getUnfinishedBooks(params)
export const getFinishedBooks = (params?: any) => bookshelfAPI.getFinishedBooks(params)
export const addToBookshelf = (bookId: string) => bookshelfAPI.addToBookshelf(bookId)
export const removeFromBookshelf = (bookId: string) => bookshelfAPI.removeFromBookshelf(bookId)

// 别名导出：booksAPI 等同于 bookshelfAPI
export const booksAPI = bookshelfAPI

export default bookshelfAPI
