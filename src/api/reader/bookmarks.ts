/**
 * 书签相关 API
 * 对接后端 /api/v1/reader/annotations 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 书签信息
 */
export interface Bookmark {
  id: string
  chapterId: string
  bookId: string
  position: number
  note?: string
  highlightText?: string
  createdAt: string
  updatedAt: string
}

/**
 * 书签 API 接口 (v1.0)
 * 对接后端: /api/v1/reader/annotations (type=bookmark)
 */
export const bookmarksAPI = {
  /**
   * 获取用户所有书签
   * GET /api/v1/reader/annotations?type=bookmark
   */
  async getUserBookmarks(params?: {
    page?: number
    pageSize?: number
    bookId?: string
  }): Promise<PaginatedResponse<Bookmark>> {
    return httpService.get<PaginatedResponse<Bookmark>>('/reader/annotations', {
      params: { ...params, type: 'bookmark' }
    })
  },

  /**
   * 创建书签
   * POST /api/v1/reader/annotations
   */
  async createBookmark(data: {
    chapterId: string
    position: number
    note?: string
    highlightText?: string
  }): Promise<APIResponse<Bookmark>> {
    return httpService.post<APIResponse<Bookmark>>('/reader/annotations', {
      ...data,
      type: 'bookmark'
    })
  },

  /**
   * 更新书签
   * PUT /api/v1/reader/annotations/:id
   */
  async updateBookmark(
    bookmarkId: string,
    data: {
      note?: string
      highlightText?: string
    }
  ): Promise<APIResponse<Bookmark>> {
    return httpService.put<APIResponse<Bookmark>>(`/reader/annotations/${bookmarkId}`, data)
  },

  /**
   * 删除书签
   * DELETE /api/v1/reader/annotations/:id
   */
  async deleteBookmark(bookmarkId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/reader/annotations/${bookmarkId}`)
  },

  /**
   * 获取章节书签
   * GET /api/v1/reader/annotations/chapter/:chapterId?type=bookmark
   */
  async getChapterBookmarks(chapterId: string): Promise<APIResponse<Bookmark[]>> {
    return httpService.get<APIResponse<Bookmark[]>>(
      `/reader/annotations/chapter/${chapterId}`,
      { params: { type: 'bookmark' } }
    )
  },

  /**
   * 获取最新书签
   * GET /api/v1/reader/bookmark/latest
   */
  async getLatestBookmark(): Promise<APIResponse<Bookmark | null>> {
    return httpService.get<APIResponse<Bookmark | null>>('/reader/bookmark/latest')
  },

  /**
   * 批量删除书签
   * DELETE /api/v1/reader/annotations/batch
   */
  async batchDeleteBookmarks(bookmarkIds: string[]): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>('/reader/annotations/batch', {
      data: { ids: bookmarkIds }
    })
  }
}

// 向后兼容：导出旧的函数名
export const getUserBookmarks = (params?: any) => bookmarksAPI.getUserBookmarks(params)
export const createBookmark = (data: any) => bookmarksAPI.createBookmark(data)
export const updateBookmark = (id: string, data: any) => bookmarksAPI.updateBookmark(id, data)
export const deleteBookmark = (id: string) => bookmarksAPI.deleteBookmark(id)
export const getChapterBookmarks = (id: string) => bookmarksAPI.getChapterBookmarks(id)
export const batchDeleteBookmarks = (ids: string[]) => bookmarksAPI.batchDeleteBookmarks(ids)

export default bookmarksAPI
