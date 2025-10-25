/**
 * Reader API
 */

import { httpService } from '@/core/services/http.service'
import type {
  Chapter,
  ChapterContent,
  ReadingProgress,
  SaveProgressParams
} from '../types/reader.types'
import type { APIResponse } from '@/core/types/api.types'

export const readerAPI = {
  /**
   * Get chapter content
   */
  async getChapterContent(chapterId: string): Promise<ChapterContent> {
    return httpService.get<APIResponse<ChapterContent>>(`/reader/chapters/${chapterId}/content`)
  },

  /**
   * Get book chapters
   */
  async getBookChapters(bookId: string): Promise<Chapter[]> {
    return httpService.get<APIResponse<Chapter[]>>(`/reader/books/${bookId}/chapters`)
  },

  /**
   * Get reading progress
   */
  async getReadingProgress(bookId: string): Promise<ReadingProgress> {
    return httpService.get<APIResponse<ReadingProgress>>(`/reader/progress/${bookId}`)
  },

  /**
   * Save reading progress
   */
  async saveReadingProgress(params: SaveProgressParams): Promise<void> {
    return httpService.post('/reader/progress', params)
  },

  /**
   * Purchase chapter
   */
  async purchaseChapter(chapterId: string): Promise<void> {
    return httpService.post(`/reader/chapters/${chapterId}/purchase`)
  }
}

export default readerAPI

