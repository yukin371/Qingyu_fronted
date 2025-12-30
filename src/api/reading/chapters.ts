/**
 * 章节相关API
 *
 * 对接后端 /api/v1/reader/chapters 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'

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
 * 获取书籍章节列表
 * GET /api/v1/reader/chapters?bookId=xxx
 * GET /api/v1/reader/chapters/book/:bookId
 */
export function getBookChapters(bookId: string) {
  return httpService.get<Chapter[]>('/reader/chapters/book/' + bookId)
}

/**
 * 获取章节信息
 * GET /api/v1/reader/chapters/:id
 */
export function getChapterById(chapterId: string) {
  return httpService.get<Chapter>(`/reader/chapters/${chapterId}`)
}

/**
 * 获取章节内容
 * GET /api/v1/reader/chapters/:id/content
 */
export function getChapterContent(chapterId: string) {
  return httpService.get<{ chapter: Chapter; content: string }>(`/reader/chapters/${chapterId}/content`)
}

/**
 * 获取导航章节（上一章、下一章）
 * GET /api/v1/reader/chapters/:id/navigation
 */
export function getNavigationChapters(chapterId: string) {
  return httpService.get<{
    previous: Chapter | null
    current: Chapter
    next: Chapter | null
  }>(`/reader/chapters/${chapterId}/navigation`)
}

/**
 * 获取第一章
 * GET /api/v1/reader/chapters/book/:bookId/first
 */
export function getFirstChapter(bookId: string) {
  return httpService.get<Chapter>(`/reader/chapters/book/${bookId}/first`)
}

/**
 * 获取最后一章
 * GET /api/v1/reader/chapters/book/:bookId/last
 */
export function getLastChapter(bookId: string) {
  return httpService.get<Chapter>(`/reader/chapters/book/${bookId}/last`)
}
