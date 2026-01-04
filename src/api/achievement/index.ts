/**
 * 成就系统 API
 */
import { http } from '@/core/http'
import type { Achievement, UserAchievement, LevelInfo } from '@/types/achievement'

/**
 * 获取所有成就
 */
export function getAchievements(params?: { type?: string; unlocked?: boolean }) {
  return http.get<{
    code: number
    message: string
    data: {
      list: Achievement[]
      total: number
    }
  }>('/api/v1/achievements', { params })
}

/**
 * 获取我的成就
 */
export function getMyAchievements() {
  return http.get<{
    code: number
    message: string
    data: {
      unlocked: Achievement[]
      locked: Achievement[]
      total: number
      unlockedCount: number
    }
  }>('/api/v1/achievements/my')
}

/**
 * 获取用户成就
 */
export function getUserAchievements(userId: string) {
  return http.get<{
    code: number
    message: string
    data: {
      unlocked: Achievement[]
      total: number
    }
  }>(`/api/v1/users/${userId}/achievements`)
}

/**
 * 获取成就详情
 */
export function getAchievementDetail(id: string) {
  return http.get<{
    code: number
    message: string
    data: Achievement
  }>(`/api/v1/achievements/${id}`)
}

/**
 * 获取等级信息
 */
export function getLevelInfo() {
  return http.get<{
    code: number
    message: string
    data: LevelInfo
  }>('/api/v1/achievements/level')
}

/**
 * 领取成就奖励
 */
export function claimAchievementReward(achievementId: string) {
  return http.post<{
    code: number
    message: string
    data: {
      success: boolean
      reward: any
    }
  }>(`/api/v1/achievements/${achievementId}/claim`)
}

/**
 * 获取成就排行
 */
export function getAchievementRanking(params?: {
  type?: 'achievement_count' | 'level'
  limit?: number
}) {
  return http.get<{
    code: number
    message: string
    data: {
      userId: string
      username: string
      nickname: string
      avatar: string
      level: number
      achievementCount: number
      rank: number
    }[]
  }>('/api/v1/achievements/ranking', { params })
}

/**
 * 获取经验值变化记录
 */
export function getExpHistory(params?: { page?: number; size?: number }) {
  return http.get<{
    code: number
    message: string
    data: {
      list: {
        id: string
        type: string
        amount: number
        reason: string
        createdAt: string
      }[]
      total: number
    }
  }>('/api/v1/achievements/exp-history', { params })
}
