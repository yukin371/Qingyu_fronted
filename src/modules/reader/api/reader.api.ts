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
    const response = await httpService.get<APIResponse<ChapterContent>>(`/reader/chapters/${chapterId}/content`)
    return response.data
  },

  /**
   * Get book chapters
   */
  async getBookChapters(bookId: string): Promise<Chapter[]> {
    const response = await httpService.get<APIResponse<Chapter[]>>(`/reader/books/${bookId}/chapters`)
    return response.data
  },

  /**
   * Get reading progress
   */
  async getReadingProgress(bookId: string): Promise<ReadingProgress> {
    const response = await httpService.get<APIResponse<ReadingProgress>>(`/reader/progress/${bookId}`)
    return response.data
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

