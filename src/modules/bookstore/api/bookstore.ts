// src/api/bookstore.ts
import http from '@/core/services/http.service'
import type { Book, BookDetail, BackendPaginatedResponse, BookStatus } from '../types/index'
import type { PaginatedResponse, APIResponse } from '@/core/types/api.types'
// 基础路径常量 - 对接后端 /api/v1/bookstore/books
const BASE_URL = '/bookstore/books'

/**
 * 辅助函数：将后端扁平的分页响应转换为前端统一的 PaginatedResponse 结构
 */
function transformPagination<T>(res: any): PaginatedResponse<T> {
  // 这里的 res 是完整的 Axios 响应体 (因为用了 returnFullResponse: true)
  // 或者是后端的完整 JSON (取决于 httpService 的具体实现细节)
  // 根据你的 httpService 逻辑：
  // returnFullResponse: true => 返回 apiData (即包含 code, data, total, page 的对象)

  const raw = res as BackendPaginatedResponse<T>

  return {
    code: raw.code,
    message: raw.message,
    data: raw.data,
    timestamp: Date.now(), // 后端如果没返回，前端补全
    pagination: {
      total: raw.total,
      page: raw.page,
      page_size: raw.size,
      total_pages: Math.ceil(raw.total / raw.size),
      has_next: raw.page * raw.size < raw.total,
      has_previous: raw.page > 1,
    },
  }
}

export const bookApi = {
  /**
   * 获取书籍详情
   * httpService 默认会解包返回 data，所以泛型填 BookDetail 即可
   */
  getDetail: (id: string) => {
    return http.get<BookDetail>(`${BASE_URL}/${id}`)
  },

  /**
   * 创建书籍详情
   */
  create: (data: Partial<BookDetail>) => {
    return http.post<BookDetail>(BASE_URL, data)
  },

  /**
   * 更新书籍详情
   */
  update: (id: string, data: Partial<BookDetail>) => {
    return http.put<BookDetail>(`${BASE_URL}/${id}`, data)
  },

  /**
   * 删除书籍
   */
  delete: (id: string) => {
    return http.delete(`${BASE_URL}/${id}`)
  },

  // ==================== 搜索与列表 (分页) ====================
  // 注意：这里使用了 returnFullResponse: true 以便获取 total 字段

  searchByTitle: async (title: string, page = 1, size = 20) => {
    const res = await http.get<BackendPaginatedResponse<Book>>(
      `${BASE_URL}/search/title`,
      { title, page, size },
      { returnFullResponse: true } // ★ 关键：获取完整响应以读取 total
    )
    return transformPagination<Book>(res)
  },

  searchByAuthor: async (author: string, page = 1, size = 20) => {
    const res = await http.get<BackendPaginatedResponse<Book>>(
      `${BASE_URL}/search/author`,
      { author, page, size },
      { returnFullResponse: true }
    )
    return transformPagination<Book>(res)
  },

  getByCategory: async (category: string, page = 1, size = 20) => {
    const res = await http.get<BackendPaginatedResponse<Book>>(
      `${BASE_URL}/category`,
      { category, page, size },
      { returnFullResponse: true }
    )
    return transformPagination<Book>(res)
  },

  getByStatus: async (status: BookStatus, page = 1, size = 20) => {
    const res = await http.get<BackendPaginatedResponse<Book>>(
      `${BASE_URL}/status`,
      { status, page, size },
      { returnFullResponse: true }
    )
    return transformPagination<Book>(res)
  },

  getByTags: async (tags: string[], page = 1, size = 20) => {
    const res = await http.get<BackendPaginatedResponse<Book>>(
      `${BASE_URL}/tags`,
      { tags: tags.join(','), page, size }, // 转换数组为逗号分隔字符串
      { returnFullResponse: true }
    )
    return transformPagination<Book>(res)
  },

  globalSearch: async (keyword: string, page = 1, size = 20) => {
    const res = await http.get<BackendPaginatedResponse<Book>>(
      `${BASE_URL}/search`,
      { keyword, page, size },
      { returnFullResponse: true }
    )
    return transformPagination<Book>(res)
  },

  // ==================== 推荐与排行 (无分页或简单列表) ====================

  getRecommended: (limit = 10) => {
    // 后端返回 APIResponse{ Data: []Book }
    // httpService 自动解包 Data
    return http.get<Book[]>(`${BASE_URL}/recommended`, { limit })
  },

  getPopular: (limit = 10) => {
    return http.get<Book[]>(`${BASE_URL}/popular`, { limit })
  },

  getLatest: (limit = 10) => {
    return http.get<Book[]>(`${BASE_URL}/latest`, { limit })
  },

  getSimilar: (id: string, limit = 10) => {
    return http.get<Book[]>(`${BASE_URL}/${id}/similar`, { limit })
  },

  // ==================== 交互操作 ====================

  getStatistics: (id: string) => {
    // 后端返回 map[string]interface{}
    return http.get<Record<string, any>>(`${BASE_URL}/${id}/statistics`)
  },

  incrementView: (id: string) => {
    return http.post(`${BASE_URL}/${id}/view`, null, { silent: true }) // 浏览通常不需要弹窗
  },

  like: (id: string) => {
    return http.post(`${BASE_URL}/${id}/like`)
  },

  unlike: (id: string) => {
    return http.post(`${BASE_URL}/${id}/unlike`)
  },
}
