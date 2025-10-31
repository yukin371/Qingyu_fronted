/**
 * 书城 - 排行榜相关API
 */

import { httpService } from '@/core/services/http.service'
import type { RankingItem } from '@/types/bookstore'

/**
 * 获取实时榜
 * GET /api/v1/bookstore/rankings/realtime
 */
export function getRealtimeRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/realtime', {
    params: { limit },
  })
}

/**
 * 获取周榜
 * GET /api/v1/bookstore/rankings/weekly
 */
export function getWeeklyRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/weekly', {
    params: { limit },
  })
}

/**
 * 获取月榜
 * GET /api/v1/bookstore/rankings/monthly
 */
export function getMonthlyRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/monthly', {
    params: { limit },
  })
}

/**
 * 获取新人榜
 * GET /api/v1/bookstore/rankings/newbie
 */
export function getNewbieRanking(limit = 20) {
  return httpService.get<RankingItem[]>('/bookstore/rankings/newbie', {
    params: { limit },
  })
}

/**
 * 按类型获取榜单
 * GET /api/v1/bookstore/rankings/:type
 */
export function getRankingByType(type: string, limit = 20) {
  return httpService.get<RankingItem[]>(`/bookstore/rankings/${type}`, {
    params: { limit },
  })
}

