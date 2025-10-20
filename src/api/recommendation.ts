import request from '@/utils/request'
import type { ApiResponse, RecommendationBehavior, RecommendationItem } from '@/types/api'

/**
 * 推荐系统API接口（TypeScript）
 */
export const recommendationAPI = {
  /** 获取个性化推荐 */
  async getPersonalizedRecommendations(limit: number = 10): Promise<ApiResponse<RecommendationItem[]>> {
    return request.get('/recommendation/personalized', { params: { limit } })
  },

  /** 获取相似物品推荐 */
  async getSimilarItems(itemId: string, limit: number = 10): Promise<ApiResponse<RecommendationItem[]>> {
    return request.get('/recommendation/similar', { params: { itemId, limit } })
  },

  /** 记录用户行为 */
  async recordBehavior(behaviorData: RecommendationBehavior): Promise<ApiResponse<true>> {
    return request.post('/recommendation/behavior', behaviorData)
  },

  /** 获取首页推荐 */
  async getHomepageRecommendations(limit: number = 10): Promise<ApiResponse<RecommendationItem[]>> {
    return request.get('/recommendation/homepage', { params: { limit } })
  },

  /** 获取热门推荐 */
  async getHotRecommendations(limit: number = 10, days: number = 7): Promise<ApiResponse<RecommendationItem[]>> {
    return request.get('/recommendation/hot', { params: { limit, days } })
  },

  /** 获取分类推荐 */
  async getCategoryRecommendations(category: string, limit: number = 10): Promise<ApiResponse<RecommendationItem[]>> {
    return request.get('/recommendation/category', { params: { category, limit } })
  }
}

export default recommendationAPI



