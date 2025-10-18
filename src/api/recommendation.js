import request from '@/utils/request'

/**
 * 推荐系统API接口
 * 基于后端推荐系统API文档 v1.0
 */
export const recommendationAPI = {
  /**
   * 获取个性化推荐
   * @param {number} limit - 推荐数量（默认10，最大50）
   * @returns {Promise} 个性化推荐列表
   */
  getPersonalizedRecommendations(limit = 10) {
    return request.get('/recommendation/personalized', {
      params: { limit }
    })
  },

  /**
   * 获取相似物品推荐
   * @param {string} itemId - 物品ID（书籍ID）
   * @param {number} limit - 推荐数量（默认10）
   * @returns {Promise} 相似推荐列表
   */
  getSimilarItems(itemId, limit = 10) {
    return request.get('/recommendation/similar', {
      params: { itemId, limit }
    })
  },

  /**
   * 记录用户行为
   * @param {Object} behaviorData - 行为数据
   * @param {string} behaviorData.itemId - 物品ID
   * @param {string} behaviorData.behaviorType - 行为类型 (view/click/favorite/purchase)
   * @param {Object} [behaviorData.context] - 上下文信息
   * @returns {Promise} 记录结果
   */
  recordBehavior(behaviorData) {
    return request.post('/recommendation/behavior', behaviorData)
  },

  /**
   * 获取首页推荐
   * @param {number} limit - 推荐数量（默认10）
   * @returns {Promise} 首页推荐列表
   */
  getHomepageRecommendations(limit = 10) {
    return request.get('/recommendation/homepage', {
      params: { limit }
    })
  },

  /**
   * 获取热门推荐
   * @param {number} limit - 推荐数量（默认10）
   * @param {number} days - 统计天数（默认7天）
   * @returns {Promise} 热门推荐列表
   */
  getHotRecommendations(limit = 10, days = 7) {
    return request.get('/recommendation/hot', {
      params: { limit, days }
    })
  },

  /**
   * 获取分类推荐
   * @param {string} category - 分类名称或ID
   * @param {number} limit - 推荐数量（默认10）
   * @returns {Promise} 分类推荐列表
   */
  getCategoryRecommendations(category, limit = 10) {
    return request.get('/recommendation/category', {
      params: { category, limit }
    })
  }
}

export default recommendationAPI

