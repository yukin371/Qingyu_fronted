import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface StoryHarnessSessionPayload {
  projectId: string
  chapterId: string
  chapterTitle: string
  content: string
  chapterCount: number
}

export const useStoryHarnessStore = defineStore('writer-story-harness', () => {
  const projectId = ref('')
  const chapterId = ref('')
  const chapterTitle = ref('')
  const content = ref('')
  const chapterCount = ref(0)
  const pendingChangeRequestCount = ref(0)

  const hasActiveChapter = computed(() => Boolean(chapterId.value))
  const draftLength = computed(() => content.value.trim().length)
  const writingStateLabel = computed(() => {
    if (!hasActiveChapter.value) return '未绑定章节'
    if (draftLength.value === 0) return '待写作'
    if (draftLength.value < 200) return '起笔中'
    return '写作中'
  })
  const chapterProgressLabel = computed(() => {
    if (!hasActiveChapter.value) return '未进入章节'
    return `第 ${chapterCount.value > 0 ? chapterCount.value : 1} 章流转宿主已接入`
  })

  function syncSession(payload: StoryHarnessSessionPayload) {
    projectId.value = payload.projectId
    chapterId.value = payload.chapterId
    chapterTitle.value = payload.chapterTitle
    content.value = payload.content
    chapterCount.value = payload.chapterCount
  }

  function setPendingChangeRequestCount(count: number) {
    pendingChangeRequestCount.value = Math.max(0, count)
  }

  return {
    projectId,
    chapterId,
    chapterTitle,
    content,
    chapterCount,
    pendingChangeRequestCount,
    hasActiveChapter,
    draftLength,
    writingStateLabel,
    chapterProgressLabel,
    syncSession,
    setPendingChangeRequestCount,
  }
})
