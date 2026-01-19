/**
 * Reader Service
 * Business logic for reading functionality
 */

import * as readerAPI from '@/modules/reader/api'
import type {
  Chapter,
  ChapterContent,
  ReadingProgress,
  ReadingSettings
} from '../types/reader.types'
import { storageService } from '@/core/services/storage.service'
import { STORAGE_KEYS } from '@/core/config/constants'

class ReaderService {
  /**
   * Get chapter content
   */
  async getChapterContent(bookId: string, chapterId: string): Promise<ChapterContent> {
    return await readerAPI.getChapterContent(bookId, chapterId)
  }

  /**
   * Get book chapters
   */
  async getBookChapters(bookId: string, page = 1, size = 50): Promise<Chapter[]> {
    return await readerAPI.getBookChapters(bookId, page, size)
  }

  /**
   * Save reading progress
   */
  async saveReadingProgress(
    bookId: string,
    chapterId: string,
    progress: number
  ): Promise<void> {
    try {
      await readerAPI.saveReadingProgress({
        book_id: bookId,
        chapter_id: chapterId,
        progress_percent: progress,
        read_duration: 0 // TODO: Track actual duration
      })
    } catch (error) {
      console.error('Failed to save reading progress:', error)
    }
  }

  /**
   * Get reading progress
   */
  async getReadingProgress(bookId: string): Promise<ReadingProgress | null> {
    try {
      return await readerAPI.getReadingProgress(bookId)
    } catch (error) {
      console.error('Failed to get reading progress:', error)
      return null
    }
  }

  /**
   * Get reading settings
   */
  getReadingSettings(): ReadingSettings {
    const defaultSettings: ReadingSettings = {
      fontSize: 16,
      lineHeight: 1.8,
      theme: 'light',
      fontFamily: 'default',
      pageWidth: 800
    }

    return storageService.get<ReadingSettings>(STORAGE_KEYS.READING_SETTINGS) || defaultSettings
  }

  /**
   * Save reading settings
   */
  saveReadingSettings(settings: ReadingSettings): void {
    storageService.set(STORAGE_KEYS.READING_SETTINGS, settings)
  }

  /**
   * Calculate next chapter
   */
  getNextChapter(chapters: Chapter[], currentChapterId: string): Chapter | null {
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapterId)
    if (currentIndex === -1 || currentIndex === chapters.length - 1) {
      return null
    }
    return chapters[currentIndex + 1]
  }

  /**
   * Calculate previous chapter
   */
  getPreviousChapter(chapters: Chapter[], currentChapterId: string): Chapter | null {
    const currentIndex = chapters.findIndex(ch => ch.id === currentChapterId)
    if (currentIndex <= 0) {
      return null
    }
    return chapters[currentIndex - 1]
  }

  /**
   * Format reading time
   */
  formatReadingTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  /**
   * Estimate reading time
   */
  estimateReadingTime(wordCount: number, wordsPerMinute: number = 300): number {
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

export const readerService = new ReaderService()
export default readerService

