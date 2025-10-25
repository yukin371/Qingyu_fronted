/**
 * 推荐系统API模块 (v1.3)
 * 基于 doc/api/frontend/推荐系统API参考.md
 */

import request from '@/utils/request'
import type { APIResponse } from '@/types/api'
import type {
  RecommendationResult,
  RecommendationItem,
  SimilarItem,
  UserBehavior,
  BehaviorRecordParams,
  PersonalizedRecommendationParams,
  SimilarRecommendationParams,
  CategoryRecommendationParams,
  HotRecommendationParams
} from '@/types/recommendation'
import type { BookBrief } from '@/types/bookstore'

/**
 * 推荐系统API接口 (v1.3)
 */
export const recommendationAPI = {
  /**
   * 获取个性化推荐
   */
  async getPersonalizedRecommendations(
    params?: PersonalizedRecommendationParams
  ): Promise<APIResponse<RecommendationResult>> {
    return request.get<APIResponse<RecommendationResult>>('/recommendation/personalized', {
      params: { limit: params?.limit || 10, ...params }
    })
  },

  /**
   * 获取相似物品推荐
   */
  async getSimilarItems(params: SimilarRecommendationParams): Promise<APIResponse<SimilarItem[]>> {
    return request.get<APIResponse<SimilarItem[]>>('/recommendation/similar', {
      params
    })
  },

  /**
   * 记录用户行为
   */
  async recordBehavior(behaviorData: BehaviorRecordParams): Promise<APIResponse<null>> {
    return request.post<APIResponse<null>>('/recommendation/behavior', behaviorData)
  },

  /**
   * 获取首页推荐
   */
  async getHomepageRecommendations(limit: number = 20): Promise<APIResponse<RecommendationResult>> {
    return request.get<APIResponse<RecommendationResult>>('/recommendation/homepage', {
      params: { limit }
    })
  },

  /**
   * 获取热门推荐
   */
  async getHotRecommendations(params?: HotRecommendationParams): Promise<APIResponse<BookBrief[]>> {
    return request.get<APIResponse<BookBrief[]>>('/recommendation/hot', {
      params: { limit: params?.limit || 10, days: params?.days || 7, ...params }
    })
  },

  /**
   * 获取分类推荐
   */
  async getCategoryRecommendations(params: CategoryRecommendationParams): Promise<APIResponse<BookBrief[]>> {
    return request.get<APIResponse<BookBrief[]>>('/recommendation/category', {
      params
    })
  }
}

export default recommendationAPI



