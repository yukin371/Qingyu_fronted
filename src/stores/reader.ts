import { defineStore } from 'pinia'
import { readerAPI } from '@/api/reading/reader'
import type {
  Chapter,
  ChapterContent,
  ChapterListItem,
  ReadingProgress,
  ReadingHistory,
  ReadingSettings,
  ShelfBook
} from '@/types/models'
import type { Annotation, ChapterNavigation } from '@/types/reader'

/**
 * 阅读器状态接口
 */
export interface ReaderState {
  // 当前章节
  currentChapter: ChapterContent | null
  chapterLoading: boolean

  // 章节列表
  chapterList: ChapterListItem[]
  chapterListLoading: boolean
  totalChapters: number

  // 阅读进度
  readingProgress: Record<string, ReadingProgress>
  progressLoading: boolean

  // 阅读历史
  readingHistory: ReadingHistory[]
  historyLoading: boolean

  // 阅读设置
  settings: ReadingSettings

  // 注记
  annotations: Annotation[]
  annotationsLoading: boolean

  // 书架
  shelf: ShelfBook[]
  shelfLoading: boolean

  // 错误信息
  error: string | null

  // 阅读统计
  totalReadingTime: number
  todayReadingTime: number
}

/**
 * 默认阅读设置
 */
const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  theme: 'light',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  pageWidth: 800,
  autoSave: true,
  pageMode: 'scroll',
  autoRead: false,
  autoReadSpeed: 500,
  enableConvert: false,
  eyeCare: false,
  keepScreenOn: false
}

export const useReaderStore = defineStore('reader', {
  state: (): ReaderState => ({
    // 当前章节
    currentChapter: null,
    chapterLoading: false,

    // 章节列表
    chapterList: [],
    chapterListLoading: false,
    totalChapters: 0,

    // 阅读进度
    readingProgress: {},
    progressLoading: false,

    // 阅读历史
    readingHistory: [],
    historyLoading: false,

    // 阅读设置
    settings: { ...DEFAULT_SETTINGS },

    // 注记
    annotations: [],
    annotationsLoading: false,

    // 书架
    shelf: [],
    shelfLoading: false,

    // 错误信息
    error: null,

    // 阅读统计
    totalReadingTime: 0,
    todayReadingTime: 0
  }),

  getters: {
    /**
     * 获取当前书籍的阅读进度
     */
    getCurrentProgress: (state) => (bookId: string): ReadingProgress | null => {
      return state.readingProgress[bookId] || null
    },

    /**
     * 是否有当前章节
     */
    hasCurrentChapter: (state): boolean => {
      return !!state.currentChapter
    },

    /**
     * 获取章节总数
     */
    chapterCount: (state): number => {
      return state.totalChapters
    },

    /**
     * 获取注记数量
     */
    annotationCount: (state): number => {
      return state.annotations.length
    }
  },

  actions: {
    // ==================== 章节管理 ====================

    /**
     * 加载章节内容
     */
    async loadChapter(chapterId: string): Promise<void> {
      this.chapterLoading = true
      this.error = null

      try {
        const response = await readerAPI.getChapterContent(chapterId)
        if (response.code === 200) {
          this.currentChapter = response.data
        } else {
          this.error = response.message || '加载章节失败'
        }
      } catch (error: any) {
        console.error('加载章节失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.chapterLoading = false
      }
    },

    /**
     * 加载章节列表
     */
    async loadChapterList(bookId: string, page: number = 1, size: number = 100): Promise<void> {
      this.chapterListLoading = true
      this.error = null

      try {
        const response = await readerAPI.getChapterList(bookId, page, size)
        if (response.code === 200) {
          this.chapterList = response.data.chapters
          this.totalChapters = response.data.total
        } else {
          this.error = response.message || '加载章节列表失败'
        }
      } catch (error: any) {
        console.error('加载章节列表失败:', error)
        this.error = error.message || '网络错误，请稍后重试'
        throw error
      } finally {
        this.chapterListLoading = false
      }
    },

    /**
     * 加载上一章
     */
    async loadPreviousChapter(): Promise<void> {
      if (!this.currentChapter?.prevChapterId) {
        this.error = '已经是第一章了'
        return
      }

      await this.loadChapter(this.currentChapter.prevChapterId)
    },

    /**
     * 加载下一章
     */
    async loadNextChapter(): Promise<void> {
      if (!this.currentChapter?.nextChapterId) {
        this.error = '已经是最后一章了'
        return
      }

      await this.loadChapter(this.currentChapter.nextChapterId)
    },

    // ==================== 阅读进度 ====================

    /**
     * 加载阅读进度
     */
    async loadProgress(bookId: string): Promise<void> {
      this.progressLoading = true

      try {
        const response = await readerAPI.getProgress(bookId)
        if (response.code === 200) {
          this.readingProgress[bookId] = response.data
        }
      } catch (error) {
        console.error('加载阅读进度失败:', error)
      } finally {
        this.progressLoading = false
      }
    },

    /**
     * 保存阅读进度
     */
    async saveProgress(bookId: string, chapterId: string, progress: number, scrollPosition: number = 0): Promise<void> {
      try {
        const response = await readerAPI.saveProgress({
          bookId,
          chapterId,
          progress,
          scrollPosition
        })

        if (response.code === 200) {
          this.readingProgress[bookId] = response.data
        }
      } catch (error) {
        console.error('保存阅读进度失败:', error)
      }
    },

    /**
     * 加载阅读历史
     */
    async loadHistory(page: number = 1, size: number = 20): Promise<void> {
      this.historyLoading = true

      try {
        const response = await readerAPI.getReadingHistory(page, size)
        if (response.code === 200) {
          this.readingHistory = response.data.histories
        }
      } catch (error) {
        console.error('加载阅读历史失败:', error)
      } finally {
        this.historyLoading = false
      }
    },

    /**
     * 更新阅读时长
     */
    async updateReadingTime(bookId: string, duration: number): Promise<void> {
      try {
        await readerAPI.updateReadingTime({ bookId, duration })
        this.totalReadingTime += duration
        this.todayReadingTime += duration
      } catch (error) {
        console.error('更新阅读时长失败:', error)
      }
    },

    // ==================== 阅读设置 ====================

    /**
     * 加载阅读设置
     */
    async loadSettings(): Promise<void> {
      try {
        const response = await readerAPI.getSettings()
        if (response.code === 200) {
          this.settings = { ...DEFAULT_SETTINGS, ...response.data }
        }
      } catch (error) {
        console.error('加载阅读设置失败:', error)
        // 使用默认设置
        this.settings = { ...DEFAULT_SETTINGS }
      }
    },

    /**
     * 更新阅读设置
     */
    async updateSettings(settings: Partial<ReadingSettings>): Promise<void> {
      this.settings = { ...this.settings, ...settings }

      try {
        await readerAPI.updateSettings(settings)
      } catch (error) {
        console.error('保存阅读设置失败:', error)
      }
    },

    /**
     * 重置阅读设置
     */
    resetSettings(): void {
      this.settings = { ...DEFAULT_SETTINGS }
    },

    // ==================== 注记管理 ====================

    /**
     * 加载注记
     */
    async loadAnnotations(bookId: string): Promise<void> {
      this.annotationsLoading = true

      try {
        const response = await readerAPI.getBookAnnotations(bookId)
        if (response.code === 200) {
          this.annotations = response.data.annotations
        }
      } catch (error) {
        console.error('加载注记失败:', error)
      } finally {
        this.annotationsLoading = false
      }
    },

    /**
     * 创建注记
     */
    async createAnnotation(annotation: Omit<Annotation, 'id' | 'createTime' | 'updateTime'>): Promise<void> {
      try {
        const response = await readerAPI.createAnnotation(annotation)
        if (response.code === 200) {
          this.annotations.push(response.data)
        }
      } catch (error) {
        console.error('创建注记失败:', error)
        throw error
      }
    },

    /**
     * 更新注记
     */
    async updateAnnotation(id: string, annotation: Partial<Annotation>): Promise<void> {
      try {
        const response = await readerAPI.updateAnnotation(id, annotation)
        if (response.code === 200) {
          const index = this.annotations.findIndex(a => a.id === id)
          if (index !== -1) {
            this.annotations[index] = { ...this.annotations[index], ...response.data }
          }
        }
      } catch (error) {
        console.error('更新注记失败:', error)
        throw error
      }
    },

    /**
     * 删除注记
     */
    async deleteAnnotation(id: string): Promise<void> {
      try {
        await readerAPI.deleteAnnotation(id)
        this.annotations = this.annotations.filter(a => a.id !== id)
      } catch (error) {
        console.error('删除注记失败:', error)
        throw error
      }
    },

    // ==================== 辅助方法 ====================

    /**
     * 清除当前章节
     */
    clearCurrentChapter(): void {
      this.currentChapter = null
    },

    /**
     * 清除错误信息
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 重置状态
     */
    resetState(): void {
      this.currentChapter = null
      this.chapterLoading = false
      this.chapterList = []
      this.chapterListLoading = false
      this.totalChapters = 0
      this.readingProgress = {}
      this.progressLoading = false
      this.readingHistory = []
      this.historyLoading = false
      this.settings = { ...DEFAULT_SETTINGS }
      this.annotations = []
      this.annotationsLoading = false
      this.shelf = []
      this.shelfLoading = false
      this.error = null
      this.totalReadingTime = 0
      this.todayReadingTime = 0
    }
  }
})

