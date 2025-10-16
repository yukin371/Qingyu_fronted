import request from '@/utils/request'

/**
 * 书籍和章节API接口
 * 基于后端阅读端API文档 v1.0
 */
export const booksAPI = {
  // ==================== 书籍管理 ====================

  /**
   * 获取书籍详情
   * @param {string} id - 书籍ID
   * @returns {Promise} 书籍详情
   */
  getBookDetail(id) {
    return request.get(`/bookstore/books/${id}`)
  },

  /**
   * 获取书籍列表（分页）
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   * @param {string} [params.category] - 分类筛选
   * @param {string} [params.status] - 状态筛选
   * @param {string} [params.sort] - 排序方式
   * @returns {Promise} 书籍列表
   */
  getBookList(params) {
    return request.get('/bookstore/books', { params })
  },

  /**
   * 根据分类获取书籍
   * @param {string} category - 分类名称
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 书籍列表
   */
  getBooksByCategory(category, page = 1, size = 20) {
    return request.get(`/bookstore/books/category/${encodeURIComponent(category)}`, {
      params: { page, size }
    })
  },

  /**
   * 根据作者获取书籍
   * @param {string} author - 作者名称
   * @returns {Promise} 书籍列表
   */
  getBooksByAuthor(author) {
    return request.get(`/bookstore/books/author/${encodeURIComponent(author)}`)
  },

  /**
   * 搜索书籍
   * @param {Object} params - 搜索参数
   * @param {string} params.q - 搜索关键词
   * @param {string} [params.type] - 搜索类型
   * @param {string} [params.category] - 分类筛选
   * @param {number} [params.page] - 页码
   * @param {number} [params.size] - 每页数量
   * @returns {Promise} 搜索结果
   */
  searchBooks(params) {
    return request.get('/books/search', { params })
  },

  /**
   * 根据标题搜索
   * @param {string} title - 书籍标题
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 搜索结果
   */
  searchByTitle(title, page = 1, size = 20) {
    return request.get('/books/search/title', {
      params: { title, page, size }
    })
  },

  /**
   * 根据标签搜索
   * @param {string} tags - 标签列表（逗号分隔）
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 搜索结果
   */
  searchByTags(tags, page = 1, size = 20) {
    return request.get('/books/search/tags', {
      params: { tags, page, size }
    })
  },

  // ==================== 章节管理 ====================

  /**
   * 获取章节详情
   * @param {string} id - 章节ID
   * @returns {Promise} 章节详情
   */
  getChapterDetail(id) {
    return request.get(`/chapters/${id}`)
  },

  /**
   * 获取书籍章节列表
   * @param {string} bookId - 书籍ID
   * @param {number} page - 页码
   * @param {number} size - 每页数量
   * @returns {Promise} 章节列表
   */
  getBookChapters(bookId, page = 1, size = 20) {
    return request.get(`/books/${bookId}/chapters`, {
      params: { page, size }
    })
  },

  /**
   * 获取最新章节
   * @param {string} bookId - 书籍ID
   * @param {number} limit - 返回数量
   * @returns {Promise} 最新章节列表
   */
  getLatestChapters(bookId, limit = 10) {
    return request.get(`/books/${bookId}/chapters/latest`, {
      params: { limit }
    })
  },

  // ==================== 分类管理 ====================

  /**
   * 获取所有分类
   * @returns {Promise} 分类列表
   */
  getAllCategories() {
    return request.get('/bookstore/categories')
  },

  /**
   * 获取子分类
   * @param {string} id - 父分类ID
   * @returns {Promise} 子分类列表
   */
  getChildCategories(id) {
    return request.get(`/bookstore/categories/${id}/children`)
  }
}

export default booksAPI


