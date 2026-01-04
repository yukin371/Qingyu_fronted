/**
 * 关注系统 API 模块
 * 对接后端 /api/v1/social/follow/* 路由
 * 后端路由文档: Qingyu_backend/router/social/social_router.go
 */

import { httpService } from '@/core/services/http.service'
import type { APIResponse, PaginatedResponse } from '@/types/api'

/**
 * 用户基本信息（用于关注列表）
 */
export interface UserInfo {
  id: string
  username: string
  nickname?: string
  avatar?: string
  bio?: string
  followerCount: number
  followingCount: number
  isFollowing?: boolean
  createdAt: string
}

/**
 * 关注统计
 */
export interface FollowStats {
  followersCount: number
  followingCount: number
}

/**
 * 关注 API 接口 (v1.0)
 * 对接后端: /api/v1/social/follow/*
 */
export const followAPI = {
  /**
   * 关注用户
   * POST /api/v1/social/follow/:userId
   */
  async followUser(userId: string): Promise<APIResponse<void>> {
    return httpService.post<APIResponse<void>>(`/social/follow/${userId}`)
  },

  /**
   * 取消关注用户
   * DELETE /api/v1/social/follow/:userId
   */
  async unfollowUser(userId: string): Promise<APIResponse<void>> {
    return httpService.delete<APIResponse<void>>(`/social/follow/${userId}`)
  },

  /**
   * 检查关注状态
   * GET /api/v1/social/follow/:userId/status
   */
  async checkFollowStatus(userId: string): Promise<APIResponse<{ isFollowing: boolean }>> {
    return httpService.get<APIResponse<{ isFollowing: boolean }>>(`/social/follow/${userId}/status`)
  },

  /**
   * 获取用户的粉丝列表
   * GET /api/v1/social/users/:userId/followers
   */
  async getFollowers(
    userId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<UserInfo>> {
    return httpService.get<PaginatedResponse<UserInfo>>(`/social/users/${userId}/followers`, { params })
  },

  /**
   * 获取用户的关注列表
   * GET /api/v1/social/users/:userId/following
   */
  async getFollowing(
    userId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<PaginatedResponse<UserInfo>> {
    return httpService.get<PaginatedResponse<UserInfo>>(`/social/users/${userId}/following`, { params })
  },

  /**
   * 获取关注统计
   * GET /api/v1/social/users/:userId/follow-stats
   */
  async getFollowStats(userId: string): Promise<APIResponse<FollowStats>> {
    return httpService.get<APIResponse<FollowStats>>(`/social/users/${userId}/follow-stats`)
  }
}

// 向后兼容：导出旧的函数名
export const followUser = (userId: string) => followAPI.followUser(userId)
export const unfollowUser = (userId: string) => followAPI.unfollowUser(userId)
export const checkFollowStatus = (userId: string) => followAPI.checkFollowStatus(userId)
export const getFollowers = (userId: string, params?: any) => followAPI.getFollowers(userId, params)
export const getFollowing = (userId: string, params?: any) => followAPI.getFollowing(userId, params)
export const getFollowStats = (userId: string) => followAPI.getFollowStats(userId)

export default followAPI
