/**
 * 关注系统 API
 */
import request from '../request'

// 用户关系
export interface UserRelation {
  following_id: string
  follower_id: string
  created_at: string
}

// 用户关注信息
export interface UserFollowInfo {
  user_id: string
  username: string
  avatar_url?: string
  bio?: string
  follower_count: number
  following_count: number
  is_following?: boolean
  is_followed_by?: boolean
  created_at?: string
}

// 关注统计
export interface FollowStats {
  follower_count: number
  following_count: number
  mutual_count: number
}

/**
 * 获取用户关注列表
 */
export function getFollowingList(params: {
  user_id?: string
  page?: number
  page_size?: number
}) {
  return request<{
    items: UserFollowInfo[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/follow/following',
    method: 'get',
    params
  })
}

/**
 * 获取用户粉丝列表
 */
export function getFollowersList(params: {
  user_id?: string
  page?: number
  page_size?: number
}) {
  return request<{
    items: UserFollowInfo[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/follow/followers',
    method: 'get',
    params
  })
}

/**
 * 关注用户
 */
export function followUser(userId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/follow/${userId}`,
    method: 'post'
  })
}

/**
 * 取消关注用户
 */
export function unfollowUser(userId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/follow/${userId}`,
    method: 'delete'
  })
}

/**
 * 获取关注统计
 */
export function getFollowStats(userId?: string) {
  return request<FollowStats>({
    url: '/api/v1/social/follow/stats',
    method: 'get',
    params: userId ? { user_id: userId } : undefined
  })
}

/**
 * 检查是否关注用户
 */
export function checkFollowStatus(userId: string) {
  return request<{ is_following: boolean }>({
    url: `/api/v1/social/follow/${userId}/status`,
    method: 'get'
  })
}

/**
 * 获取推荐关注
 */
export function getRecommendedFollows(limit = 10) {
  return request<UserFollowInfo[]>({
    url: '/api/v1/social/follow/recommended',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取互关好友
 */
export function getMutualFollows(limit = 20) {
  return request<UserFollowInfo[]>({
    url: '/api/v1/social/follow/mutual',
    method: 'get',
    params: { limit }
  })
}

/**
 * 关注系统 API 对象
 */
export const followAPI = {
  getFollowingList,
  getFollowersList,
  followUser,
  unfollowUser,
  getFollowStats,
  checkFollowStatus,
  getRecommendedFollows,
  getMutualFollows
}
