/**
 * 章节相关 API
 * 对接后端 /api/v1/reader/chapters 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse } from '@/types/api'

/**
 * 章节信息
 */
export interface Chapter {
  id: string
  bookId: string
  chapterNumber: number
  title: string
  content?: string
  wordCount?: number
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 章节导航信息
 */
export interface ChapterNavigation {
  previous: Chapter | null
  current: Chapter
  next: Chapter | null
}

/**
 * 章节 API 接口 (v1.0)
 * 对接后端: /api/v1/reader/chapters
 */
export const chaptersAPI = {
  /**
   * 获取书籍章节列表
   * GET /api/v1/reader/chapters/book/:bookId
   */
  async getBookChapters(bookId: string): Promise<APIResponse<Chapter[]>> {
    return httpService.get<APIResponse<Chapter[]>>(`/reader/chapters/book/${bookId}`)
  },

  /**
   * 获取章节信息
   * GET /api/v1/reader/chapters/:id
   */
  async getChapterById(chapterId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(`/reader/chapters/${chapterId}`)
  },

  /**
   * 获取章节内容
   * GET /api/v1/reader/chapters/:id/content
   */
  async getChapterContent(chapterId: string): Promise<APIResponse<{ chapter: Chapter; content: string }>> {
    return httpService.get<APIResponse<{ chapter: Chapter; content: string }>>(
      `/reader/chapters/${chapterId}/content`
    )
  },

  /**
   * 获取导航章节（上一章、下一章）
   * GET /api/v1/reader/chapters/:id/navigation
   */
  async getNavigationChapters(chapterId: string): Promise<APIResponse<ChapterNavigation>> {
    return httpService.get<APIResponse<ChapterNavigation>>(
      `/reader/chapters/${chapterId}/navigation`
    )
  },

  /**
   * 获取第一章
   * GET /api/v1/reader/chapters/book/:bookId/first
   */
  async getFirstChapter(bookId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(`/reader/chapters/book/${bookId}/first`)
  },

  /**
   * 获取最后一章
   * GET /api/v1/reader/chapters/book/:bookId/last
   */
  async getLastChapter(bookId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(`/reader/chapters/book/${bookId}/last`)
  }
}

// 向后兼容：导出旧的函数名
export const getBookChapters = (bookId: string) => chaptersAPI.getBookChapters(bookId)
export const getChapterById = (chapterId: string) => chaptersAPI.getChapterById(chapterId)
export const getChapterContent = (chapterId: string) => chaptersAPI.getChapterContent(chapterId)
export const getNavigationChapters = (chapterId: string) => chaptersAPI.getNavigationChapters(chapterId)
export const getFirstChapter = (bookId: string) => chaptersAPI.getFirstChapter(bookId)
export const getLastChapter = (bookId: string) => chaptersAPI.getLastChapter(bookId)

export default chaptersAPI
