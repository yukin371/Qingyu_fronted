/**
 * 社区状态管理
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as communityApi from '../api'
import type { Post, PostComment, Topic, PostQuery } from '@/types/community'

export const useCommunityStore = defineStore('community', () => {
  // State
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const comments = ref<PostComment[]>([])
  const topics = ref<Topic[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const total = ref(0)

  // Getters
  const hasPosts = computed(() => posts.value.length > 0)

  // Actions
  /**
   * 获取动态列表
   */
  async function fetchPosts(params?: PostQuery) {
    loading.value = true
    error.value = null
    try {
      const response = await communityApi.getPosts(params)
      if (response.data.code === 0) {
        posts.value = response.data.data.list
        total.value = response.data.data.total
      }
    } catch (err) {
      error.value = err as Error
      console.error('获取动态列表失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取动态详情
   */
  async function fetchPostDetail(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await communityApi.getPostDetail(id)
      if (response.data.code === 0) {
        currentPost.value = response.data.data
      }
    } catch (err) {
      error.value = err as Error
      console.error('获取动态详情失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取评论列表
   */
  async function fetchComments(postId: string) {
    try {
      const response = await communityApi.getPostComments(postId)
      if (response.data.code === 0) {
        comments.value = response.data.data.list
      }
    } catch (err) {
      console.error('获取评论失败:', err)
    }
  }

  /**
   * 发布动态
   */
  async function createPost(data: {
    type: string
    content: string
    images?: string[]
    bookId?: string
    topics?: string[]
  }) {
    loading.value = true
    try {
      const response = await communityApi.createPost(data)
      if (response.data.code === 0) {
        posts.value.unshift(response.data.data)
        return response.data.data
      }
    } catch (err) {
      console.error('发布动态失败:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 发表评论
   */
  async function createComment(postId: string, content: string, replyTo?: string) {
    try {
      const response = await communityApi.createPostComment(postId, { content, replyTo })
      if (response.data.code === 0) {
        comments.value.unshift(response.data.data)
        if (currentPost.value) {
          currentPost.value.commentCount++
        }
        return response.data.data
      }
    } catch (err) {
      console.error('发表评论失败:', err)
      throw err
    }
  }

  /**
   * 点赞/取消点赞
   */
  async function toggleLike(postId: string) {
    const post = posts.value.find(p => p.id === postId) || currentPost.value
    if (!post) return

    try {
      if (post.isLiked) {
        await communityApi.unlikePost(postId)
        post.isLiked = false
        post.likeCount--
      } else {
        await communityApi.likePost(postId)
        post.isLiked = true
        post.likeCount++
      }
    } catch (err) {
      console.error('点赞操作失败:', err)
    }
  }

  /**
   * 获取话题列表
   */
  async function fetchTopics() {
    try {
      const response = await communityApi.getTopics()
      if (response.data.code === 0) {
        topics.value = response.data.data.list
      }
    } catch (err) {
      console.error('获取话题失败:', err)
    }
  }

  /**
   * 获取话题动态
   */
  async function fetchTopicPosts(topicId: string) {
    loading.value = true
    try {
      const response = await communityApi.getTopicPosts(topicId)
      if (response.data.code === 0) {
        posts.value = response.data.data.list
      }
    } catch (err) {
      console.error('获取话题动态失败:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    posts,
    currentPost,
    comments,
    topics,
    loading,
    error,
    total,
    // Getters
    hasPosts,
    // Actions
    fetchPosts,
    fetchPostDetail,
    fetchComments,
    createPost,
    createComment,
    toggleLike,
    fetchTopics,
    fetchTopicPosts
  }
})
