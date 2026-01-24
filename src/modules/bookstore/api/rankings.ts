/**
 * 书城 - 排行榜相关API
 */

import { httpService } from '@/core/services/http.service'
import type { RankingItem } from '../types'

/**
 * 获取实时排行榜
 * @description 获取实时更新的书籍排行榜，反映当前热门趋势
 * @endpoint GET /api/v1/bookstore/rankings/realtime
 * @category rankings
 * @tags 排行榜
 * @param {number} limit - 限制返回数量（默认20）
 * @response {RankingItem[]} 200 - 成功返回实时排行榜
 */
export function getRealtimeRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/realtime', {
    params: { limit },
  })
}

/**
 * 获取周排行榜
 * @description 获取过去一周的书籍排行榜，按综合评分排序
 * @endpoint GET /api/v1/bookstore/rankings/weekly
 * @category rankings
 * @tags 排行榜
 * @param {number} limit - 限制返回数量（默认20）
 * @response {RankingItem[]} 200 - 成功返回周排行榜
 */
export function getWeeklyRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/weekly', {
    params: { limit },
  })
}

/**
 * 获取月排行榜
 * @description 获取过去一个月的书籍排行榜，按综合评分排序
 * @endpoint GET /api/v1/bookstore/rankings/monthly
 * @category rankings
 * @tags 排行榜
 * @param {number} limit - 限制返回数量（默认20）
 * @response {RankingItem[]} 200 - 成功返回月排行榜
 */
export function getMonthlyRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/monthly', {
    params: { limit },
  })
}

/**
 * 获取新人排行榜
 * @description 获取新作者作品的排行榜，鼓励新人创作
 * @endpoint GET /api/v1/bookstore/rankings/newbie
 * @category rankings
 * @tags 排行榜
 * @param {number} limit - 限制返回数量（默认20）
 * @response {RankingItem[]} 200 - 成功返回新人排行榜
 */
export function getNewbieRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/newbie', {
    params: { limit },
  })
}

/**
 * 按类型获取排行榜
 * @description 根据指定的排行榜类型获取对应的榜单数据
 * @endpoint GET /api/v1/bookstore/rankings/:type
 * @category rankings
 * @tags 排行榜
 * @param {string} type - 排行榜类型（realtime/weekly/monthly/newbie等）
 * @param {number} limit - 限制返回数量（默认20）
 * @response {RankingItem[]} 200 - 成功返回指定类型的排行榜
 */
export function getRankingByType(type: string, limit = 20) {
  return httpService.get<RankingItem[]>(`/bookstore/rankings/${type}`, {
    params: { limit },
  })
}

