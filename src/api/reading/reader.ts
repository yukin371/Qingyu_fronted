import request from '@/utils/request'
import type { ApiResponse, PaginationParams } from '@/types/api'
import type {
  Chapter,
  ChapterContent,
  ChapterListItem,
  ReadingProgress,
  ReadingHistory,
  ReadingSettings
} from '@/types/models'

/**
 * 进度保存数据
 */
export interface ProgressSaveData {
  bookId: string
  chapterId: string
  progress: number // 0-100
  scrollPosition?: number
}

/**
 * 阅读时长数据
 */
export interface ReadingTimeData {
  bookId: string
  duration: number // 秒
}

/**
 * 注记类型
 */
export type AnnotationType = 'bookmark' | 'highlight' | 'note'

/**
 * 注记数据
 */
export interface Annotation {
  id?: string
  bookId: string
  chapterId: string
  type: AnnotationType
  text: string
  note?: string
  range?: string
  color?: string
  createTime?: string
  updateTime?: string
}

/**
 * 注记统计
 */
export interface AnnotationStats {
  totalCount: number
  bookmarkCount: number
  highlightCount: number
  noteCount: number
}

/**
 * 章节导航
 */
export interface ChapterNavigation {
  current: Chapter
  prev: Chapter | null
  next: Chapter | null
}

/**
 * 阅读器API接口
 * 基于后端阅读端API文档 v1.0
 */
export const readerAPI = {
  // ==================== 章节阅读 ====================

  /**
   * 获取章节信息
   */
  async getChapterInfo(chapterId: string): Promise<ApiResponse<Chapter>> {
    return request.get(`/reader/chapters/${chapterId}`)
  },

  /**
   * 获取章节内容（需要登录）
   */
  async getChapterContent(chapterId: string): Promise<ApiResponse<ChapterContent>> {
    return request.get(`/reader/chapters/${chapterId}/content`)
  },

  /**
   * 获取书籍章节列表
   */
  async getChapterList(
    bookId: string,
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<{
    chapters: ChapterListItem[]
    total: number
    page: number
    size: number
  }>> {
    return request.get('/reader/chapters', {
      params: { bookId, page, size }
    })
  },

  /**
   * 获取章节导航（上一章、下一章）
   */
  async getChapterNavigation(
    bookId: string,
    chapterNum: number
  ): Promise<ApiResponse<ChapterNavigation>> {
    return request.get('/reader/chapters/navigation', {
      params: { bookId, chapterNum }
    })
  },

  /**
   * 获取第一章
   */
  async getFirstChapter(bookId: string): Promise<ApiResponse<Chapter>> {
    return request.get('/reader/chapters/first', {
      params: { bookId }
    })
  },

  /**
   * 获取最后一章
   */
  async getLastChapter(bookId: string): Promise<ApiResponse<Chapter>> {
    return request.get('/reader/chapters/last', {
      params: { bookId }
    })
  },

  // ==================== 阅读进度 ====================

  /**
   * 获取阅读进度
   */
  async getProgress(bookId: string): Promise<ApiResponse<ReadingProgress>> {
    return request.get(`/reader/progress/${bookId}`)
  },

  /**
   * 保存阅读进度
   */
  async saveProgress(progressData: ProgressSaveData): Promise<ApiResponse<ReadingProgress>> {
    return request.post('/reader/progress', progressData)
  },

  /**
   * 更新阅读时长
   */
  async updateReadingTime(timeData: ReadingTimeData): Promise<ApiResponse<any>> {
    return request.put('/reader/progress/time', timeData)
  },

  /**
   * 获取阅读历史
   */
  async getReadingHistory(
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<{
    histories: ReadingHistory[]
    total: number
    page: number
    size: number
  }>> {
    return request.get('/reader/progress/history', {
      params: { page, size }
    })
  },

  /**
   * 获取总阅读时长
   */
  async getTotalReadingTime(): Promise<ApiResponse<{
    totalTime: number
    todayTime: number
    weekTime: number
  }>> {
    return request.get('/reader/progress/total-time')
  },

  // ==================== 注记功能 ====================

  /**
   * 创建注记
   */
  async createAnnotation(annotation: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<Annotation>> {
    return request.post('/reader/annotations', annotation)
  },

  /**
   * 更新注记
   */
  async updateAnnotation(id: string, annotation: Partial<Annotation>): Promise<ApiResponse<Annotation>> {
    return request.put(`/reader/annotations/${id}`, annotation)
  },

  /**
   * 删除注记
   */
  async deleteAnnotation(id: string): Promise<ApiResponse<any>> {
    return request.delete(`/reader/annotations/${id}`)
  },

  /**
   * 获取书籍注记列表
   */
  async getBookAnnotations(
    bookId: string,
    type: AnnotationType | '' = '',
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<{
    annotations: Annotation[]
    total: number
    page: number
    size: number
  }>> {
    return request.get(`/reader/annotations/book/${bookId}`, {
      params: { type, page, size }
    })
  },

  /**
   * 获取章节注记列表
   */
  async getChapterAnnotations(chapterId: string): Promise<ApiResponse<Annotation[]>> {
    return request.get(`/reader/annotations/chapter/${chapterId}`)
  },

  /**
   * 获取注记统计
   */
  async getAnnotationStats(): Promise<ApiResponse<AnnotationStats>> {
    return request.get('/reader/annotations/stats')
  },

  /**
   * 批量创建注记
   */
  async batchCreateAnnotations(annotations: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>[]): Promise<ApiResponse<{
    successCount: number
    failedCount: number
  }>> {
    return request.post('/reader/annotations/batch', { annotations })
  },

  // ==================== 阅读设置 ====================

  /**
   * 获取阅读设置
   */
  async getSettings(): Promise<ApiResponse<ReadingSettings>> {
    return request.get('/reader/settings')
  },

  /**
   * 保存阅读设置
   */
  async saveSettings(settings: ReadingSettings): Promise<ApiResponse<ReadingSettings>> {
    return request.post('/reader/settings', settings)
  },

  /**
   * 更新阅读设置
   */
  async updateSettings(settings: Partial<ReadingSettings>): Promise<ApiResponse<ReadingSettings>> {
    return request.put('/reader/settings', settings)
  }
}

export default readerAPI


