/**
 * 段落评论状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ParagraphComment, ParagraphCommentSummary } from '@/types/reader/index'
import { useAuthStore } from './auth'

const MOCK_COMMENT_CONTENTS = [
  '这一段情绪铺垫很到位，代入感很强。',
  '细节描写很有画面感，像在看电影。',
  '这里的节奏控制得不错，读起来很顺。',
  '人物反应很真实，能感受到紧张氛围。',
  '转场自然，前后衔接很舒服。',
  '这句台词写得很有味道，记忆点很高。',
  '伏笔埋得巧，期待后面展开。',
  '这个段落的信息量大但不乱，赞。'
]

const MOCK_COMMENT_USERS = [
  { id: 'user1', name: '书虫小明', avatar: 'https://picsum.photos/seed/user1/40/40' },
  { id: 'user2', name: '文学爱好者', avatar: 'https://picsum.photos/seed/user2/40/40' },
  { id: 'user3', name: '夜读人', avatar: 'https://picsum.photos/seed/user3/40/40' },
  { id: 'user4', name: '追更喵', avatar: 'https://picsum.photos/seed/user4/40/40' },
  { id: 'user5', name: '段落观察员', avatar: 'https://picsum.photos/seed/user5/40/40' }
]

function getStableMockCountByParagraphIndex(paragraphIndex: number): number {
  const counts = [2, 0, 4, 1, 3, 2, 0, 5, 2, 1, 3, 0]
  return counts[paragraphIndex % counts.length]
}

function buildMockComments(paragraphId: string, chapterId: string, paragraphIndex: number, count: number): ParagraphComment[] {
  return Array.from({ length: count }, (_, i) => {
    const user = MOCK_COMMENT_USERS[i % MOCK_COMMENT_USERS.length]
    const content = MOCK_COMMENT_CONTENTS[(paragraphIndex + i) % MOCK_COMMENT_CONTENTS.length]
    const ts = Date.now() - (i + 1) * 18 * 60 * 1000
    return {
      id: `mock-${paragraphId}-${i + 1}`,
      paragraphId,
      chapterId,
      paragraphIndex,
      userId: user.id,
      username: user.name,
      avatar: user.avatar,
      content,
      likes: Math.max(0, 12 - i * 2),
      likedByMe: i === 0,
      createdAt: new Date(ts).toISOString(),
      updatedAt: new Date(ts).toISOString()
    }
  })
}

function isUrlTestMode(): boolean {
  if (typeof window === 'undefined') return false
  const url = new URL(window.location.href)
  return url.searchParams.get('test') === 'true'
}

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
    const isMockMode = Boolean(isMockToken) || isUrlTestMode()

    if (isMockMode) {
      // 返回模拟评论
      console.log('[测试模式] 加载段落评论:', paragraphId)

      const separatorIndex = paragraphId.lastIndexOf('-')
      const chapterId = separatorIndex > 0 ? paragraphId.slice(0, separatorIndex) : 'chapter-001'
      const paragraphIndexRaw = separatorIndex > 0 ? paragraphId.slice(separatorIndex + 1) : '0'
      const paragraphIndex = Number(paragraphIndexRaw) || 0
      const summaryCount = summaries.value.get(paragraphId)?.commentCount
      const mockCount = summaryCount && summaryCount > 0 ? Math.min(summaryCount, 8) : 2
      const mockComments = buildMockComments(paragraphId, chapterId || 'chapter-001', paragraphIndex, mockCount)

      const nextComments = new Map(comments.value)
      nextComments.set(paragraphId, mockComments)
      comments.value = nextComments
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
    replyToCommentId?: string
    replyToUsername?: string
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
      replyToCommentId: data.replyToCommentId,
      replyToUsername: data.replyToUsername,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const existing = comments.value.get(data.paragraphId) || []
    const nextComments = new Map(comments.value)
    nextComments.set(data.paragraphId, [...existing, newComment])
    comments.value = nextComments

    // 更新摘要
    const summary = summaries.value.get(data.paragraphId)
    if (summary) {
      const nextSummaries = new Map(summaries.value)
      nextSummaries.set(data.paragraphId, {
        ...summary,
        commentCount: summary.commentCount + 1,
        latestComment: {
          content: data.content || data.emoji || '',
          username: newComment.username,
          time: '刚刚'
        }
      })
      summaries.value = nextSummaries
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
    const isMockMode = Boolean(isMockToken) || isUrlTestMode()

    if (isMockMode) {
      console.log('[测试模式] 加载章节评论摘要')

      // 为前 12 段提供稳定 mock 摘要，避免刷新后评论数量跳变
      const nextSummaries = new Map(summaries.value)
      for (let i = 0; i < 12; i++) {
        const count = getStableMockCountByParagraphIndex(i)
        if (count > 0) {
          const preview = MOCK_COMMENT_CONTENTS[i % MOCK_COMMENT_CONTENTS.length]
          nextSummaries.set(`${chapterId}-${i}`, {
            paragraphId: `${chapterId}-${i}`,
            commentCount: count,
            latestComment: {
              content: preview,
              username: '读者' + i,
              time: '1小时前'
            }
          })
        }
      }
      summaries.value = nextSummaries
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
