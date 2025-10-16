import request from '@/utils/request'

/**
 * 评分系统API接口
 * 基于后端阅读端API文档 v1.0
 */
export const ratingAPI = {
  /**
   * 获取书籍评分列表
   * @param {string} bookId - 书籍ID
   * @param {number} page - 页码
   * @param {number} limit - 每页数量
   * @returns {Promise} 评分列表
   */
  getBookRatings(bookId, page = 1, limit = 10) {
    return request.get(`/reading/books/${bookId}/ratings`, {
      params: { page, limit }
    })
  },

  /**
   * 创建书籍评分
   * @param {Object} ratingData - 评分数据
   * @param {string} ratingData.bookId - 书籍ID
   * @param {number} ratingData.rating - 评分 (1-5)
   * @param {string} [ratingData.review] - 评价内容
   * @returns {Promise} 创建响应
   */
  createRating(ratingData) {
    return request.post('/reading/ratings', ratingData)
  },

  /**
   * 更新评分
   * @param {string} id - 评分ID
   * @param {Object} ratingData - 评分数据
   * @param {number} [ratingData.rating] - 评分
   * @param {string} [ratingData.review] - 评价内容
   * @returns {Promise} 更新响应
   */
  updateRating(id, ratingData) {
    return request.put(`/reading/ratings/${id}`, ratingData)
  },

  /**
   * 删除评分
   * @param {string} id - 评分ID
   * @returns {Promise} 删除响应
   */
  deleteRating(id) {
    return request.delete(`/reading/ratings/${id}`)
  },

  /**
   * 获取书籍评分统计
   * @param {string} bookId - 书籍ID
   * @returns {Promise} 评分统计数据
   */
  getBookRatingStats(bookId) {
    return request.get(`/reading/books/${bookId}/ratings/stats`)
  }
}

export default ratingAPI


