/**
 * Bookstore API 统一导出
 * 导出wrapper层的所有方法和类型
 */

export * from './wrapper'

import * as wrapper from './wrapper'

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
    return http.get<Book[]>(`${BASE_URL}/recommended`, { params: { limit } })
  },

  getPopular: (limit = 10) => {
    return http.get<Book[]>(`${BASE_URL}/popular`, { params: { limit } })
  },

  getLatest: (limit = 10) => {
    return http.get<Book[]>(`${BASE_URL}/latest`, { params: { limit } })
  },

  getSimilar: (id: string, limit = 10) => {
    return http.get<Book[]>(`${BASE_URL}/${id}/similar`, { params: { limit } })
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
