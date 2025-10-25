/**
 * Bookshelf API
 */

import { httpService } from '@/core/services/http.service'
import type { BookshelfItem } from '../types/reader.types'
import type { APIResponse } from '@/core/types/api.types'

export const bookshelfAPI = {
  /**
   * Get bookshelf
   */
  async getBookshelf(): Promise<BookshelfItem[]> {
    return httpService.get<APIResponse<BookshelfItem[]>>('/reader/bookshelf')
  },

  /**
   * Add to bookshelf
   */
  async addToBookshelf(bookId: string): Promise<void> {
    return httpService.post('/reader/bookshelf', { book_id: bookId })
  },

  /**
   * Remove from bookshelf
   */
  async removeFromBookshelf(bookId: string): Promise<void> {
    return httpService.delete(`/reader/bookshelf/${bookId}`)
  }
}

export default bookshelfAPI

