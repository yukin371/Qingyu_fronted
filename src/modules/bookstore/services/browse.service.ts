import { httpService } from '@/core/services/http.service'
import type { BookBrief } from '@/types/models'
import type { BrowseFilters } from '@/types/models'

interface GetBooksResponse {
  code: number
  data: {
    books: BookBrief[]
    total: number
  }
}

export const browseService = {
  /**
   * 获取书籍列表
   */
  async getBooks(filters: BrowseFilters): Promise<GetBooksResponse> {
    const params = {
      q: filters.q || undefined,
      categoryId: filters.categoryId || undefined,
      year: filters.year || undefined,
      status: filters.status || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      tagMode: filters.tagMode,
      page: filters.page,
      pageSize: filters.pageSize,
      sortBy: filters.sortBy
    }

    // 移除undefined值
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    )

    return httpService.get('/bookstore/books', { params: cleanParams })
  },

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(query: string) {
    return httpService.get('/bookstore/books/suggestions', { params: { q: query } })
  },

  /**
   * 获取标签列表
   */
  async getTags(categoryId?: string) {
    return httpService.get('/bookstore/tags', { params: { categoryId } })
  },

  /**
   * 获取分类列表
   */
  async getCategories() {
    return httpService.get('/bookstore/categories/tree')
  },

  /**
   * 获取年份列表
   */
  async getYears() {
    return httpService.get('/bookstore/books/years')
  }
}
