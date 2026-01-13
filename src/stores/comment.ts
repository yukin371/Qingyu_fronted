/**
 * 段落评论状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ParagraphComment, ParagraphCommentSummary } from '@/types/reader'
import { useAuthStore } from './auth'

export const useCommentStore = defineStore('comment', () => {
  // 状态
  const currentParagraphId = ref<string | null>(null)
  const comments = ref<Map<string, ParagraphComment[]>>(new Map())
  const summaries = ref<Map<string, ParagraphCommentSummary>>(new Map())
  const isLoading = ref(false)

  // 计算属性
  const currentComments = computed(() => {
    if (!currentParagraphId.value) return []
    return comments.value.get(currentParagraphId.value) || []
  })

  const currentSummary = computed(() => {
    if (!currentParagraphId.value) return null
    return summaries.value.get(currentParagraphId.value)
  })

  // 测试模式：加载模拟评论数据
  async function loadParagraphComments(paragraphId: string) {
    currentParagraphId.value = paragraphId
    isLoading.value = true

    // 检测测试模式
    const authStore = useAuthStore()
    const token = authStore.token as any
    const isMockToken = token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

    if (isMockToken) {
      // 返回模拟评论
      console.log('[测试模式] 加载段落评论:', paragraphId)

      const mockComments: ParagraphComment[] = [
        {
          id: 'c1',
          paragraphId,
          chapterId: 'chapter-001',
          paragraphIndex: 0,
          userId: 'user1',
          username: '书虫小明',
          avatar: 'https://picsum.photos/seed/user1/40/40',
          content: '这一段写得太棒了！情节跌宕起伏，人物刻画细腻入微。',
          likes: 12,
          likedByMe: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'c2',
          paragraphId,
          chapterId: 'chapter-001',
          paragraphIndex: 0,
          userId: 'user2',
          username: '文学爱好者',
          avatar: 'https://picsum.photos/seed/user2/40/40',
          emoji: '👍',
          likes: 8,
          likedByMe: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]

      comments.value.set(paragraphId, mockComments)
      isLoading.value = false
      return mockComments
    }

    // 生产模式：调用真实API
    // TODO: API调用
    isLoading.value = false
    return []
  }

  // 测试模式：添加评论
  async function addComment(data: {
    paragraphId: string
    chapterId: string
    paragraphIndex: number
    content?: string
    emoji?: string
  }) {
    const authStore = useAuthStore()
    const user = authStore.user

    if (!user) return

    const newComment: ParagraphComment = {
      id: `c${Date.now()}`,
      paragraphId: data.paragraphId,
      chapterId: data.chapterId,
      paragraphIndex: data.paragraphIndex,
      userId: user.id,
      username: user.nickname || user.username,
      avatar: user.avatar || '',
      content: data.content,
      emoji: data.emoji,
      likes: 0,
      likedByMe: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const existing = comments.value.get(data.paragraphId) || []
    comments.value.set(data.paragraphId, [...existing, newComment])

    // 更新摘要
    const summary = summaries.value.get(data.paragraphId)
    if (summary) {
      summaries.value.set(data.paragraphId, {
        ...summary,
        commentCount: summary.commentCount + 1,
        latestComment: {
          content: data.content || data.emoji || '',
          username: newComment.username,
          time: '刚刚'
        }
      })
    }

    return newComment
  }

  // 测试模式：点赞
  async function toggleLike(commentId: string) {
    for (const [paragraphId, commentList] of comments.value.entries()) {
      const comment = commentList.find(c => c.id === commentId)
      if (comment) {
        comment.likedByMe = !comment.likedByMe
        comment.likes += comment.likedByMe ? 1 : -1
        break
      }
    }
  }

  // 测试模式：加载章节摘要
  async function loadChapterSummaries(chapterId: string) {
    const authStore = useAuthStore()
    const token = authStore.token as any
    const isMockToken = token && (typeof token === 'string' ? token : JSON.stringify(token)).includes('mock')

    if (isMockToken) {
      console.log('[测试模式] 加载章节评论摘要')

      // 为段落0-5添加评论摘要
      for (let i = 0; i < 6; i++) {
        const count = Math.floor(Math.random() * 20)
        if (count > 0) {
          summaries.value.set(`${chapterId}-${i}`, {
            paragraphId: `${chapterId}-${i}`,
            commentCount: count,
            latestComment: {
              content: '精彩段落！',
              username: '读者' + i,
              time: '1小时前'
            }
          })
        }
      }
    }
  }

  function selectParagraph(paragraphId: string) {
    currentParagraphId.value = paragraphId
  }

  function clearSelection() {
    currentParagraphId.value = null
  }

  return {
    currentParagraphId,
    comments,
    summaries,
    isLoading,
    currentComments,
    currentSummary,
    loadParagraphComments,
    addComment,
    toggleLike,
    loadChapterSummaries,
    selectParagraph,
    clearSelection
  }
})
