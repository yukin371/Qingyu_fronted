import request from '@/utils/request'
import type { ApiResponse, PaginationParams } from '@/types/api'
import type {
  Book,
  BookBrief,
  Chapter,
  ChapterListItem,
  Category,
  SearchFilter,
  SearchResult
} from '@/types/models'

/**
 * 书籍列表查询参数
 */
export interface BookListParams extends PaginationParams {
  category?: string
  status?: 'serializing' | 'completed' | 'paused' | ''
  sort?: 'updateTime' | 'rating' | 'viewCount' | 'wordCount'
  order?: 'asc' | 'desc'
}

/**
 * 搜索参数
 */
export interface BookSearchParams extends PaginationParams {
  q: string
  type?: 'title' | 'author' | 'tag' | 'all'
  category?: string
}

/**
 * 书籍和章节API接口
 * 基于后端阅读端API文档 v1.0
 */
export const booksAPI = {
  // ==================== 书籍管理 ====================

  /**
   * 获取书籍详情
   */
  async getBookDetail(id: string): Promise<ApiResponse<Book>> {
    return request.get(`/bookstore/books/${id}`)
  },

  /**
   * 获取书籍列表（使用推荐接口）
   * 注意：后端暂未实现通用书籍列表接口，使用推荐接口代替
   * TODO: 等待后端实现 GET /bookstore/books 接口
   */
  async getBookList(params: BookListParams): Promise<ApiResponse<{
    books: BookBrief[]
    total: number
    page: number
    size: number
  }>> {
    // 暂时使用推荐接口代替通用列表接口
    // 注意：这个接口不支持分类和状态筛选
    return request.get('/bookstore/books/recommended', { params })
  },

  /**
   * 根据分类获取书籍
   */
  async getBooksByCategory(
    category: string,
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<{
    books: BookBrief[]
    total: number
    page: number
    size: number
  }>> {
    return request.get(`/bookstore/books/category/${encodeURIComponent(category)}`, {
      params: { page, size }
    })
  },

  /**
   * 根据作者获取书籍
   */
  async getBooksByAuthor(author: string): Promise<ApiResponse<BookBrief[]>> {
    return request.get(`/bookstore/books/author/${encodeURIComponent(author)}`)
  },

  /**
   * 搜索书籍
   */
  async searchBooks(params: BookSearchParams): Promise<ApiResponse<SearchResult>> {
    return request.get('/books/search', { params })
  },

  /**
   * 根据标题搜索
   */
  async searchByTitle(
    title: string,
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<SearchResult>> {
    return request.get('/books/search/title', {
      params: { title, page, size }
    })
  },

  /**
   * 根据标签搜索
   */
  async searchByTags(
    tags: string,
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<SearchResult>> {
    return request.get('/books/search/tags', {
      params: { tags, page, size }
    })
  },

  // ==================== 章节管理 ====================

  /**
   * 获取章节详情
   */
  async getChapterDetail(id: string): Promise<ApiResponse<Chapter>> {
    return request.get(`/chapters/${id}`)
  },

  /**
   * 获取书籍章节列表
   */
  async getBookChapters(
    bookId: string,
    page: number = 1,
    size: number = 20
  ): Promise<ApiResponse<{
    chapters: ChapterListItem[]
    total: number
    page: number
    size: number
  }>> {
    return request.get(`/books/${bookId}/chapters`, {
      params: { page, size }
    })
  },

  /**
   * 获取最新章节
   */
  async getLatestChapters(
    bookId: string,
    limit: number = 10
  ): Promise<ApiResponse<ChapterListItem[]>> {
    return request.get(`/books/${bookId}/chapters/latest`, {
      params: { limit }
    })
  },

  // ==================== 分类管理 ====================

  /**
   * 获取所有分类（分类树）
   */
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return request.get('/bookstore/categories/tree')
  },

  /**
   * 获取子分类
   */
  async getChildCategories(id: string): Promise<ApiResponse<Category[]>> {
    return request.get(`/bookstore/categories/${id}/children`)
  }
}

export default booksAPI

