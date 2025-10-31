/**
 * 阅读器API模块 (v1.3)
 * 基于 doc/api/frontend/阅读器API参考.md
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginationParams } from '@/types/api'
import type {
  Chapter,
  ChapterContent,
  ChapterListItem,
  ChapterNavigation,
  ReadingProgress,
  ReadingHistory,
  ReadingSettings,
  Annotation,
  AnnotationStats,
  AnnotationType,
  ReadingTimeData,
  ProgressSaveData
} from '@/types/reader'

/**
 * 阅读器API接口 (v1.3)
 */
export const readerAPI = {
  // ==================== 章节阅读 ====================

  /**
   * 获取章节信息
   */
  async getChapterInfo(chapterId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>(`/reader/chapters/${chapterId}`)
  },

  /**
   * 获取章节内容（需要登录）
   */
  async getChapterContent(chapterId: string): Promise<APIResponse<ChapterContent>> {
    return httpService.get<APIResponse<ChapterContent>>(`/reader/chapters/${chapterId}/content`)
  },

  /**
   * 获取书籍章节列表
   */
  async getChapterList(
    bookId: string,
    page: number = 1,
    size: number = 20
  ): Promise<APIResponse<{
    chapters: ChapterListItem[]
    total: number
    page: number
    size: number
  }>> {
    return httpService.get<APIResponse<{
      chapters: ChapterListItem[]
      total: number
      page: number
      size: number
    }>>('/reader/chapters', {
      params: { bookId, page, size }
    })
  },

  /**
   * 获取章节导航（上一章、下一章）
   */
  async getChapterNavigation(
    bookId: string,
    chapterNum: number
  ): Promise<APIResponse<ChapterNavigation>> {
    return httpService.get<APIResponse<ChapterNavigation>>('/reader/chapters/navigation', {
      params: { bookId, chapterNum }
    })
  },

  /**
   * 获取第一章
   */
  async getFirstChapter(bookId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>('/reader/chapters/first', {
      params: { bookId }
    })
  },

  /**
   * 获取最后一章
   */
  async getLastChapter(bookId: string): Promise<APIResponse<Chapter>> {
    return httpService.get<APIResponse<Chapter>>('/reader/chapters/last', {
      params: { bookId }
    })
  },

  // ==================== 阅读进度 ====================

  /**
   * 获取阅读进度
   */
  async getProgress(bookId: string): Promise<APIResponse<ReadingProgress>> {
    return httpService.get<APIResponse<ReadingProgress>>(`/reader/progress/${bookId}`)
  },

  /**
   * 保存阅读进度
   */
  async saveProgress(progressData: ProgressSaveData): Promise<APIResponse<ReadingProgress>> {
    return httpService.post<APIResponse<ReadingProgress>>('/reader/progress', progressData)
  },

  /**
   * 更新阅读时长
   */
  async updateReadingTime(timeData: ReadingTimeData): Promise<APIResponse<null>> {
    return httpService.put<APIResponse<null>>('/reader/progress/time', timeData)
  },

  /**
   * 获取阅读历史
   */
  async getReadingHistory(
    page: number = 1,
    size: number = 20
  ): Promise<APIResponse<{
    histories: ReadingHistory[]
    total: number
    page: number
    size: number
  }>> {
    return httpService.get<APIResponse<{
      histories: ReadingHistory[]
      total: number
      page: number
      size: number
    }>>('/reader/progress/history', {
      params: { page, size }
    })
  },

  /**
   * 获取总阅读时长
   */
  async getTotalReadingTime(): Promise<APIResponse<{
    totalTime: number
    todayTime: number
    weekTime: number
  }>> {
    return httpService.get<APIResponse<{
      totalTime: number
      todayTime: number
      weekTime: number
    }>>('/reader/progress/total-time')
  },

  // ==================== 注记功能 ====================

  /**
   * 创建注记
   */
  async createAnnotation(annotation: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>): Promise<APIResponse<Annotation>> {
    return httpService.post<APIResponse<Annotation>>('/reader/annotations', annotation)
  },

  /**
   * 更新注记
   */
  async updateAnnotation(id: string, annotation: Partial<Annotation>): Promise<APIResponse<Annotation>> {
    return httpService.put<APIResponse<Annotation>>(`/reader/annotations/${id}`, annotation)
  },

  /**
   * 删除注记
   */
  async deleteAnnotation(id: string): Promise<APIResponse<null>> {
    return httpService.delete<APIResponse<null>>(`/reader/annotations/${id}`)
  },

  /**
   * 获取书籍注记列表
   */
  async getBookAnnotations(
    bookId: string,
    type: AnnotationType | '' = '',
    page: number = 1,
    size: number = 20
  ): Promise<APIResponse<{
    annotations: Annotation[]
    total: number
    page: number
    size: number
  }>> {
    return httpService.get<APIResponse<{
      annotations: Annotation[]
      total: number
      page: number
      size: number
    }>>(`/reader/annotations/book/${bookId}`, {
      params: { type, page, size }
    })
  },

  /**
   * 获取章节注记列表
   */
  async getChapterAnnotations(chapterId: string): Promise<APIResponse<Annotation[]>> {
    return httpService.get<APIResponse<Annotation[]>>(`/reader/annotations/chapter/${chapterId}`)
  },

  /**
   * 获取注记统计
   */
  async getAnnotationStats(): Promise<APIResponse<AnnotationStats>> {
    return httpService.get<APIResponse<AnnotationStats>>('/reader/annotations/stats')
  },

  /**
   * 批量创建注记
   */
  async batchCreateAnnotations(annotations: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>[]): Promise<APIResponse<{
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
   */
  async getSettings(): Promise<APIResponse<ReadingSettings>> {
    return httpService.get<APIResponse<ReadingSettings>>('/reader/settings')
  },

  /**
   * 保存阅读设置
   */
  async saveSettings(settings: ReadingSettings): Promise<APIResponse<ReadingSettings>> {
    return httpService.post<APIResponse<ReadingSettings>>('/reader/settings', settings)
  },

  /**
   * 更新阅读设置
   */
  async updateSettings(settings: Partial<ReadingSettings>): Promise<APIResponse<ReadingSettings>> {
    return httpService.put<APIResponse<ReadingSettings>>('/reader/settings', settings)
  }
}

export default readerAPI


