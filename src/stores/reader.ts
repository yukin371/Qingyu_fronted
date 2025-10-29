/**
 * 阅读器状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Chapter, ChapterContent, ReaderSettings } from '@/types/reader'
import {
  getChapterInfo,
  getChapterContent,
  getReaderSettings,
  updateReaderSettings,
  recordReadingHistory,
} from '@/api/reader'

export const useReaderStore = defineStore('reader', () => {
  // 状态
  const currentChapter = ref<Chapter | null>(null)
  const chapterContent = ref<ChapterContent | null>(null)
  const settings = ref<ReaderSettings | null>(null)
  const isLoading = ref(false)
  const readingProgress = ref(0) // 当前章节阅读进度 0-100

  // 计算属性
  const hasNextChapter = computed(() => !!currentChapter.value?.nextChapterId)
  const hasPrevChapter = computed(() => !!currentChapter.value?.prevChapterId)

  /**
   * 加载章节内容
   */
  async function loadChapter(chapterId: string) {
    try {
      isLoading.value = true

      // 并行加载章节信息和内容
      const [chapter, content] = await Promise.all([
        getChapterInfo(chapterId),
        getChapterContent(chapterId),
      ])

      currentChapter.value = chapter
      chapterContent.value = content
      readingProgress.value = 0

      return { chapter, content }
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
   * 获取阅读设置
   */
  async function loadSettings() {
    try {
      const data = await getReaderSettings()
      settings.value = data
      return data
    } catch (error) {
      console.error('获取阅读设置失败:', error)
      // 使用默认设置
      settings.value = getDefaultSettings()
      throw error
    }
  }

  /**
   * 更新阅读设置
   */
  async function updateSettings(newSettings: Partial<ReaderSettings>) {
    try {
      const data = await updateReaderSettings(newSettings)
      settings.value = data
      return data
    } catch (error) {
      console.error('更新阅读设置失败:', error)
      throw error
    }
  }

  /**
   * 保存阅读进度
   */
  async function saveReadingProgress() {
    if (!currentChapter.value) {
      return
    }

    try {
      await recordReadingHistory({
        bookId: currentChapter.value.bookId,
        chapterId: currentChapter.value.id,
        progress: readingProgress.value,
      })
    } catch (error) {
      console.error('保存阅读进度失败:', error)
      // 不抛出错误，避免影响阅读体验
    }
  }

  /**
   * 更新阅读进度
   */
  function updateProgress(progress: number) {
    readingProgress.value = Math.max(0, Math.min(100, progress))
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

  return {
    // 状态
    currentChapter,
    chapterContent,
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
    loadSettings,
    updateSettings,
    saveReadingProgress,
    updateProgress,
    clearChapter,
  }
})
