/**
 * 阅读器核心 API 模块 (v1.3)
 * 对接后端 /api/v1/reader/* 路由
 * 后端路由文档: Qingyu_backend/router/reader/reader_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 章节
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
 * 章节内容
 */
export interface ChapterContent {
  chapter: Chapter
  content: string
  nextChapter?: Chapter
  prevChapter?: Chapter
}

/**
 * 章节列表项
 */
export interface ChapterListItem {
  id: string
  chapterNumber: number
  title: string
  wordCount?: number
  publishedAt?: string
}

/**
 * 章节导航
 */
export interface ChapterNavigation {
  previous: Chapter | null
  current: Chapter
  next: Chapter | null
}

/**
 * 阅读进度
 */
export interface ReadingProgress {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number
  lastReadTime: string
}

/**
 * 阅读历史
 */
export interface ReadingHistory {
  id: string
  bookId: string
  chapterId: string
  position: number
  duration?: number
  timestamp: string
}

/**
 * 阅读设置
 */
export interface ReadingSettings {
  fontSize: number
  lineHeight: number
  theme: 'light' | 'dark' | 'sepia'
  fontFamily: string
  autoScroll?: boolean
  scrollSpeed?: number
}

/**
 * 注记类型
 */
export type AnnotationType = 'bookmark' | 'highlight' | 'note'

/**
 * 注记
 */
export interface Annotation {
  id: string
  bookId: string
  chapterId: string
  type: AnnotationType
  position: number
  length?: number
  content?: string
  note?: string
  color?: string
  createTime: string
  updateTime: string
}

/**
 * 注记统计
 */
export interface AnnotationStats {
  total: number
  bookmarks: number
  highlights: number
  notes: number
}

/**
 * 阅读器核心 API 接口 (v1.3)
 */
export const readerAPI = {
  // ==================== 章节阅读 ====================

  /**
   * 获取章节信息
   * GET /api/v1/reader/chapters/:id
   */
  async getChapterInfo(chapterId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(`/reader/chapters/${chapterId}`)
  },

  /**
   * 获取章节内容（需要登录）
   * GET /api/v1/reader/chapters/:id/content
   */
  async getChapterContent(chapterId: string): Promise<APIResponse<ChapterContent>> {
    return httpService.get<APIResponse<ChapterContent>>(
      `/reader/chapters/${chapterId}/content`
    )
  },

  /**
   * 获取书籍章节列表
   * GET /api/v1/reader/chapters/book/:bookId
   */
  async getChapterList(
    bookId: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<ChapterListItem>> {
    return httpService.get<PaginatedResponse<ChapterListItem>>(
      `/reader/chapters/book/${bookId}`,
      { params: { page, size } }
    )
  },

  /**
   * 获取章节导航（上一章、下一章）
   * GET /api/v1/reader/chapters/:id/navigation
   */
  async getChapterNavigation(chapterId: string): Promise<APIResponse<ChapterNavigation>> {
    return httpService.get<APIResponse<ChapterNavigation>>(
      `/reader/chapters/${chapterId}/navigation`
    )
  },

  /**
   * 获取第一章
   * GET /api/v1/reader/chapters/book/:bookId/first
   */
  async getFirstChapter(bookId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(
      `/reader/chapters/book/${bookId}/first`
    )
  },

  /**
   * 获取最后一章
   * GET /api/v1/reader/chapters/book/:bookId/last
   */
  async getLastChapter(bookId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(
      `/reader/chapters/book/${bookId}/last`
    )
  },

  // ==================== 阅读进度 ====================

  /**
   * 获取阅读进度
   * GET /api/v1/reader/progress/:bookId
   */
  async getProgress(bookId: string): Promise<APIResponse<ReadingProgress>> {
    return httpService.get<APIResponse<ReadingProgress>>(`/reader/progress/${bookId}`)
  },

  /**
   * 保存阅读进度
   * POST /api/v1/reader/progress
   */
  async saveProgress(progressData: {
    bookId: string
    chapterId: string
    chapterNumber: number
    progress: number
  }): Promise<APIResponse<ReadingProgress>> {
    return httpService.post<APIResponse<ReadingProgress>>('/reader/progress', progressData)
  },

  /**
   * 更新阅读时长
   * POST /api/v1/reader/progress/time
   */
  async updateReadingTime(timeData: {
    bookId: string
    chapterId: string
    duration: number
  }): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>('/reader/progress/time', timeData)
  },

  /**
   * 获取阅读历史
   * GET /api/v1/reader/progress/history
   */
  async getReadingHistory(
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<ReadingHistory>> {
    return httpService.get<PaginatedResponse<ReadingHistory>>('/reader/progress/history', {
      params: { page, size }
    })
  },

  /**
   * 获取总阅读时长
   * GET /api/v1/reader/progress/stats
   */
  async getTotalReadingTime(): Promise<APIResponse<{
    totalTime: number
    todayTime: number
    weekTime: number
  }>> {
    return httpService.get<APIResponse<any>>('/reader/progress/stats')
  },

  // ==================== 注记功能 ====================

  /**
   * 创建注记
   * POST /api/v1/reader/annotations
   */
  async createAnnotation(
    annotation: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>
  ): Promise<APIResponse<Annotation>> {
    return httpService.post<APIResponse<Annotation>>('/reader/annotations', annotation)
  },

  /**
   * 更新注记
   * PUT /api/v1/reader/annotations/:id
   */
  async updateAnnotation(
    id: string,
    annotation: Partial<Annotation>
  ): Promise<APIResponse<Annotation>> {
    return httpService.put<APIResponse<Annotation>>(
      `/reader/annotations/${id}`,
      annotation
    )
  },

  /**
   * 删除注记
   * DELETE /api/v1/reader/annotations/:id
   */
  async deleteAnnotation(id: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/reader/annotations/${id}`)
  },

  /**
   * 获取书籍注记列表
   * GET /api/v1/reader/annotations/book/:bookId
   */
  async getBookAnnotations(
    bookId: string,
    type: AnnotationType | '' = '',
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<Annotation>> {
    return httpService.get<PaginatedResponse<Annotation>>(
      `/reader/annotations/book/${bookId}`,
      { params: { type, page, size } }
    )
  },

  /**
   * 获取章节注记列表
   * GET /api/v1/reader/annotations/chapter/:chapterId
   */
  async getChapterAnnotations(chapterId: string): Promise<APIResponse<Annotation[]>> {
    return httpService.get<APIResponse<Annotation[]>>(
      `/reader/annotations/chapter/${chapterId}`
    )
  },

  /**
   * 获取注记统计
   * GET /api/v1/reader/annotations/stats
   */
  async getAnnotationStats(): Promise<APIResponse<AnnotationStats>> {
    return httpService.get<APIResponse<AnnotationStats>>('/reader/annotations/stats')
  },

  /**
   * 批量创建注记
   * POST /api/v1/reader/annotations/batch
   */
  async batchCreateAnnotations(
    annotations: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>[]
  ): Promise<APIResponse<{
    successCount: number
    failedCount: number
  }>> {
    return httpService.post<APIResponse<{
      successCount: number
      failedCount: number
    }>>('/reader/annotations/batch', { annotations })
  },

  // ==================== 阅读设置 ====================

  /**
   * 获取阅读设置
   * GET /api/v1/reader/settings
   */
  async getSettings(): Promise<APIResponse<ReadingSettings>> {
    return httpService.get<APIResponse<ReadingSettings>>('/reader/settings')
  },

  /**
   * 保存阅读设置
   * POST /api/v1/reader/settings
   */
  async saveSettings(settings: ReadingSettings): Promise<APIResponse<ReadingSettings>> {
    return httpService.post<APIResponse<ReadingSettings>>('/reader/settings', settings)
  },

  /**
   * 更新阅读设置
   * PUT /api/v1/reader/settings
   */
  async updateSettings(
    settings: Partial<ReadingSettings>
  ): Promise<APIResponse<ReadingSettings>> {
    return httpService.put<APIResponse<ReadingSettings>>('/reader/settings', settings)
  }
}

export default readerAPI
