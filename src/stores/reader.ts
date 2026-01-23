/**
 * 阅读器状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Chapter, ChapterContent, ReaderSettings } from '@/types/reader'
import readerAPI from '@/modules/reader/api/reader'

export const useReaderStore = defineStore('reader', () => {
  // 状态
  const currentBookId = ref<string | null>(null)
  const currentChapter = ref<Chapter | null>(null)
  const chapterContent = ref<ChapterContent | null>(null)
  const chapterList = ref<Chapter[]>([])
  const settings = ref<ReaderSettings>({
    userId: '',
    fontSize: 16,
    fontFamily: 'system-ui',
    lineHeight: 1.8,
    letterSpacing: 0,
    theme: 'light',
    pageMode: 'scroll',
    autoSave: true,
    enableAnimation: true,
    showProgress: true,
    pageWidth: 800,
    updatedAt: new Date().toISOString(),
  })
  const isLoading = ref(false)
  const readingProgress = ref(0) // 当前章节阅读进度 0-100

  // 计算属性
  const hasNextChapter = computed(() => !!currentChapter.value?.nextChapterId)
  const hasPrevChapter = computed(() => !!currentChapter.value?.prevChapterId)

  /**
   * 加载章节内容
   */
  async function loadChapter(chapterId: string, bookId?: string) {
    try {
      isLoading.value = true

      // 使用提供的bookId或当前的bookId
      const targetBookId = bookId || currentBookId.value
      if (!targetBookId) {
        throw new Error('未指定书籍ID')
      }

      // 更新当前书籍ID
      currentBookId.value = targetBookId

      // 并行加载章节信息和内容
      const [chapterRes, contentRes] = await Promise.all([
        readerAPI.getChapterInfo(chapterId),
        readerAPI.getChapterContent(targetBookId, chapterId),
      ])

      // 合并章节信息和内容数据，并转换字段名
      const chapterInfo = chapterRes.data as any
      const contentData = contentRes.data as any

      // 转换API响应数据格式为前端Chapter类型
      const chapter: any = {
        id: chapterInfo.id,
        bookId: chapterInfo.book_id,
        title: chapterInfo.title,
        chapterNumber: chapterInfo.chapter_num,
        wordCount: chapterInfo.word_count,
        isFree: chapterInfo.is_free,
        price: chapterInfo.price,
        publishedAt: chapterInfo.publish_time,
        createdAt: chapterInfo.created_at,
        updatedAt: chapterInfo.updated_at,
        prevChapterId: null,
        nextChapterId: null,
        content: contentData.content || '',
      }

      currentChapter.value = chapter
      chapterContent.value = chapter
      readingProgress.value = 0

      return { chapter: currentChapter.value, content: chapterContent.value }
    } catch (error) {
      console.error('加载章节失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 跳转到下一章
   */
  async function nextChapter() {
    if (!currentChapter.value?.nextChapterId) {
      throw new Error('没有下一章')
    }

    // 保存当前阅读进度
    await saveReadingProgress()

    return loadChapter(currentChapter.value.nextChapterId)
  }

  /**
   * 跳转到上一章
   */
  async function prevChapter() {
    if (!currentChapter.value?.prevChapterId) {
      throw new Error('没有上一章')
    }

    // 保存当前阅读进度
    await saveReadingProgress()

    return loadChapter(currentChapter.value.prevChapterId)
  }

  /**
   * 加载章节列表
   */
  async function loadChapterList(bookId: string) {
    try {
      const response = await readerAPI.getChapterList(bookId, 1, 1000)
      const list = Array.isArray(response)
        ? response
        : (response as any)?.data?.chapters || (response as any)?.chapters || []
      chapterList.value = list as any
      return list
    } catch (error) {
      console.error('加载章节列表失败:', error)
      chapterList.value = []
      return []
    }
  }

  /**
   * 获取阅读设置
   */
  async function loadSettings() {
    try {
      const res = await readerAPI.getSettings()
      const data = res.data as any
      settings.value = { ...settings.value, ...data }
      return data
    } catch (error) {
      console.error('获取阅读设置失败:', error)
      // 继续使用默认设置
      return settings.value
    }
  }

  /**
   * 更新阅读设置
   */
  async function updateSettings(newSettings: Partial<ReaderSettings>) {
    try {
      settings.value = { ...settings.value, ...newSettings }
      const res = await readerAPI.updateSettings(newSettings as any)
      return res.data as any
    } catch (error) {
      console.error('更新阅读设置失败:', error)
      // 仍然保持本地更新
      return settings.value
    }
  }

  /**
   * 重置阅读设置
   */
  function resetSettings() {
    settings.value = getDefaultSettings()
  }

  /**
   * 保存阅读进度
   */
  async function saveReadingProgress() {
    if (!currentChapter.value) {
      return
    }

    try {
      await readerAPI.saveProgress({
        bookId: currentChapter.value.bookId,
        chapterId: currentChapter.value.id,
        progress: readingProgress.value,
      } as any)
    } catch (error) {
      console.error('保存阅读进度失败:', error)
      // 不抛出错误，避免影响阅读体验
    }
  }

  /**
   * 保存进度（带位置信息）
   */
  async function saveProgress(bookId: string, chapterId: string, progress: number, scrollPosition: number) {
    try {
      await readerAPI.saveProgress({
        bookId,
        chapterId,
        progress,
      } as any)
    } catch (error) {
      console.error('保存进度失败:', error)
    }
  }

  /**
   * 更新阅读时长
   */
  async function updateReadingTime(bookId: string, duration: number) {
    try {
      // 这里可以调用相应的API更新阅读时长
      console.log('更新阅读时长:', bookId, duration)
    } catch (error) {
      console.error('更新阅读时长失败:', error)
    }
  }

  /**
   * 更新阅读进度
   */
  function updateProgress(progress: number) {
    readingProgress.value = Math.max(0, Math.min(100, progress))
  }

  /**
   * 跳转到上一章（别名）
   */
  async function loadPreviousChapter() {
    return prevChapter()
  }

  /**
   * 跳转到下一章（别名）
   */
  async function loadNextChapter() {
    return nextChapter()
  }

  /**
   * 获取默认设置
   */
  function getDefaultSettings(): ReaderSettings {
    return {
      userId: '',
      fontSize: 16,
      fontFamily: 'system-ui',
      lineHeight: 1.8,
      letterSpacing: 0,
      theme: 'light',
      pageMode: 'scroll',
      autoSave: true,
      enableAnimation: true,
      showProgress: true,
      pageWidth: 800,
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * 清除当前章节
   */
  function clearChapter() {
    currentChapter.value = null
    chapterContent.value = null
    readingProgress.value = 0
  }

  /**
   * 清除当前章节（别名）
   */
  function clearCurrentChapter() {
    clearChapter()
  }

  return {
    // 状态
    currentBookId,
    currentChapter,
    chapterContent,
    chapterList,
    settings,
    isLoading,
    readingProgress,

    // 计算属性
    hasNextChapter,
    hasPrevChapter,

    // 方法
    loadChapter,
    nextChapter,
    prevChapter,
    loadPreviousChapter,
    loadNextChapter,
    loadChapterList,
    loadSettings,
    updateSettings,
    resetSettings,
    saveReadingProgress,
    saveProgress,
    updateReadingTime,
    updateProgress,
    clearChapter,
    clearCurrentChapter,
  }
})
