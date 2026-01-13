/**
 * 社交功能状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FollowStats, UserBrief } from '@/types/social'
import { followAPI } from '@/modules/social/api/follow'

export const useSocialStore = defineStore('social', () => {
  // 状态
  const followStats = ref<Map<string, FollowStats>>(new Map())
  const followingList = ref<Set<string>>(new Set())
  const followerList = ref<Set<string>>(new Set())
  const isLoading = ref(false)

  // Getters
  const isFollowing = computed(() => (userId: string) => {
    return followingList.value.has(userId)
  })

  const isFollower = computed(() => (userId: string) => {
    return followerList.value.has(userId)
  })

  const isMutualFollow = computed(() => (userId: string) => {
    return followingList.value.has(userId) && followerList.value.has(userId)
  })

  const getStats = computed(() => (userId: string) => {
    return followStats.value.get(userId)
  })

  // Actions
  async function fetchFollowStats(userId: string) {
    try {
      const response = await followAPI.getFollowStats(userId)
      if (response.code === 200) {
        followStats.value.set(userId, response.data)
      }
    } catch (error) {
      console.error('[SocialStore] 获取关注统计失败:', error)
    }
  }

  async function followUser(userId: string) {
    isLoading.value = true
    try {
      const response = await followAPI.followUser(userId)
      if (response.code === 200) {
        // 更新本地状态
        followingList.value.add(userId)

        // 更新统计
        const stats = followStats.value.get(userId)
        if (stats) {
          stats.followingCount++
        }

        return response
      }
      throw new Error(response.message || '关注失败')
    } finally {
      isLoading.value = false
    }
  }

  async function unfollowUser(userId: string) {
    isLoading.value = true
    try {
      const response = await followAPI.unfollowUser(userId)
      if (response.code === 200) {
        // 更新本地状态
        followingList.value.delete(userId)

        // 更新统计
        const stats = followStats.value.get(userId)
        if (stats) {
          stats.followingCount--
        }

        return response
      }
      throw new Error(response.message || '取消关注失败')
    } finally {
      isLoading.value = false
    }
  }

  async function checkFollowStatus(userId: string) {
    try {
      const response = await followAPI.checkFollowStatus(userId)
      if (response.code === 200) {
        const { isFollowing } = response.data

        if (isFollowing) {
          followingList.value.add(userId)
        } else {
          followingList.value.delete(userId)
        }
      }
    } catch (error) {
      console.error('[SocialStore] 检查关注状态失败:', error)
    }
  }

  async function fetchFollowingList(userId: string, page = 1, pageSize = 20) {
    try {
      const response = await followAPI.getFollowing(userId, { page, pageSize })
      if (response.code === 200 && response.data) {
        // 更新关注列表
        const list = Array.isArray(response.data) ? response.data : response.data.list || []
        list.forEach((item: any) => {
          if (item.id) {
            followingList.value.add(item.id)
          }
        })

        return response
      }
    } catch (error) {
      console.error('[SocialStore] 获取关注列表失败:', error)
      throw error
    }
  }

  async function fetchFollowersList(userId: string, page = 1, pageSize = 20) {
    try {
      const response = await followAPI.getFollowers(userId, { page, pageSize })
      if (response.code === 200 && response.data) {
        // 更新粉丝列表
        const list = Array.isArray(response.data) ? response.data : response.data.list || []
        list.forEach((item: any) => {
          if (item.id) {
            followerList.value.add(item.id)
          }
        })

        return response
      }
    } catch (error) {
      console.error('[SocialStore] 获取粉丝列表失败:', error)
      throw error
    }
  }

  // 批量操作
  async function batchFollow(userIds: string[]) {
    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: []
    }

    for (const userId of userIds) {
      try {
        await followUser(userId)
        results.success.push(userId)
      } catch (error) {
        results.failed.push(userId)
      }
    }

    return results
  }

  // 清除缓存
  function clearCache() {
    followStats.value.clear()
    followingList.value.clear()
    followerList.value.clear()
  }

  // 清除特定用户的缓存
  function clearUserCache(userId: string) {
    followStats.value.delete(userId)
    followingList.value.delete(userId)
    followerList.value.delete(userId)
  }

  return {
    // State
    followStats,
    followingList,
    followerList,
    isLoading,

    // Getters
    isFollowing,
    isFollower,
    isMutualFollow,
    getStats,

    // Actions
    fetchFollowStats,
    followUser,
    unfollowUser,
    checkFollowStatus,
    fetchFollowingList,
    fetchFollowersList,
    batchFollow,
    clearCache,
    clearUserCache
  }
})
