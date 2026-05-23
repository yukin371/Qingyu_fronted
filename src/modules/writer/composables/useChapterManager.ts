/**
 * 章节管理相关的逻辑
 */
import { ref, reactive, type Ref, type ComputedRef } from 'vue'
import { message, messageBox } from '@/design-system/services'
import { useAuthStore } from '@/stores/auth'
import {
  getPublishRecords,
  publishChapter as apiPublishChapter,
  unpublishChapter as apiUnpublishChapter,
  scheduleChapter as apiScheduleChapter,
  type PublishRecord,
  type PublishStatus,
  type PublishStats,
  type ChapterPublishConfig,
} from '@/modules/writer/api'
import { syncPublishedBookFromRecords } from '@/modules/workflow/publishedBridge'
import { getWorkspaceMockProject } from '@/modules/writer/mock/workspaceMock'
import { getDocumentContent } from '@/modules/writer/api/wrapper'
import {
  calculateProofreadContentHash,
  getProofreadQualityGateStatus,
} from '@/modules/writer/services/proofreadQualityGate.service'
import { extractPlainTextFromEditorContent } from '@/modules/writer/utils/editorContent'

// 导出类型
export type { PublishRecord, PublishStatus, PublishStats }

// 本地项目类型
interface LocalProject {
  projectId?: string
  id?: string
  title?: string
  chapterCount?: number
  wordCount?: number
}

export function useChapterManager(
  bookId: Ref<string>,
  isMockProjectContext: Ref<boolean>,
  currentLocalProject: ComputedRef<LocalProject>,
) {
  const authStore = useAuthStore()

  // 章节发布状态
  const loadingRecords = ref(false)
  const publishRecords = ref<PublishRecord[]>([])
  const recordPage = ref(1)
  const recordPageSize = ref(20)
  const recordTotal = ref(0)
  const chapterFilter = reactive({ status: '' })

  // Mock 数据存储
  const mockRecordMap = reactive<Record<string, PublishRecord[]>>({})

  // 确保 Mock 记录存在
  const ensureMockRecords = (projectId: string): PublishRecord[] => {
    if (mockRecordMap[projectId]?.length) return mockRecordMap[projectId]
    const projectMock = getWorkspaceMockProject(projectId)
    if (projectMock?.chapters?.length) {
      const now = Date.now()
      const records: PublishRecord[] = projectMock.chapters
        .slice()
        .sort((a, b) => a.chapterNum - b.chapterNum)
        .map((chapter, idx) => {
          const chapterNo = chapter.chapterNum || idx + 1
          const status: PublishStatus =
            chapterNo <= 2 ? 'published' : chapterNo === 3 ? 'pending_review' : 'draft'
          return {
            id: `${projectId}-record-${chapterNo}`,
            book_id: projectId,
            chapter_id: chapter.id,
            chapter_title: chapter.title,
            chapter_number: chapterNo,
            status,
            published_at:
              status === 'published'
                ? new Date(now - chapterNo * 86400000).toISOString()
                : undefined,
            created_at: new Date(now - chapterNo * 3600000).toISOString(),
          }
        })
      mockRecordMap[projectId] = records
      return records
    }

    const chapterCount = Math.max(Number(currentLocalProject.value?.chapterCount || 0), 3)
    const now = Date.now()
    const records: PublishRecord[] = Array.from({ length: chapterCount }, (_, idx) => {
      const chapterNo = idx + 1
      const status: PublishStatus =
        chapterNo <= 2 ? 'published' : chapterNo === 3 ? 'pending_review' : 'draft'
      return {
        id: `${projectId}-record-${chapterNo}`,
        book_id: projectId,
        chapter_id: `${projectId}-chapter-${chapterNo}`,
        chapter_title: `第${chapterNo}章`,
        chapter_number: chapterNo,
        status,
        published_at:
          status === 'published' ? new Date(now - chapterNo * 86400000).toISOString() : undefined,
        created_at: new Date(now - chapterNo * 3600000).toISOString(),
      }
    })
    mockRecordMap[projectId] = records
    return records
  }

  // 持久化 Mock 发布数据
  const persistMockPublication = (projectId: string) => {
    const records = ensureMockRecords(projectId)
    const mockProject = getWorkspaceMockProject(projectId)
    syncPublishedBookFromRecords(projectId, records, {
      title: currentLocalProject.value?.title || mockProject?.project.title || '未命名作品',
    })
  }

  const resolveChapterContentHash = async (record: PublishRecord) => {
    try {
      if (isMockProjectContext.value) {
        const mockProject = getWorkspaceMockProject(bookId.value)
        const mockContent = mockProject?.contentByDocId?.[record.chapter_id]
        return mockContent
          ? calculateProofreadContentHash(extractPlainTextFromEditorContent(mockContent))
          : undefined
      }

      const response = await getDocumentContent(record.chapter_id)
      const content = response?.content || ''
      return calculateProofreadContentHash(extractPlainTextFromEditorContent(content))
    } catch (error) {
      console.warn('[useChapterManager] 获取章节正文 hash 失败:', error)
      return undefined
    }
  }

  const confirmQualityGateBeforePublish = async (record: PublishRecord, actionLabel: string) => {
    const currentContentHash = await resolveChapterContentHash(record)
    const status = getProofreadQualityGateStatus(
      bookId.value,
      record.chapter_id,
      currentContentHash,
    )
    if (status.level === 'pass') {
      return true
    }

    const detailParts = [
      status.record
        ? `评分 ${typeof status.record.score === 'number' ? status.record.score.toFixed(1) : '--'}，问题 ${status.record.totalIssues} 条。`
        : '未找到最近一次审校记录。',
      status.reason === 'stale' ? '当前正文与最近一次审校记录不一致，建议重新审校。' : '',
      !currentContentHash && status.record?.contentHash
        ? '暂时无法读取当前正文，未能确认审校记录是否仍匹配。'
        : '',
    ].filter(Boolean)

    try {
      await messageBox.confirm(
        `${status.message}\n${detailParts.join('\n')}\n仍要继续${actionLabel}吗？`,
        '发布前审校提醒',
        {
          type: status.level === 'missing' ? 'warning' : 'error',
          confirmButtonText: `继续${actionLabel}`,
          cancelButtonText: '返回审校',
        },
      )
      return true
    } catch {
      message.info('已取消发布操作，可先返回编辑器完成审校。')
      return false
    }
  }

  // 加载发布记录
  const loadPublishRecords = async () => {
    if (!bookId.value) return
    loadingRecords.value = true
    try {
      if (isMockProjectContext.value) {
        const allRecords = ensureMockRecords(bookId.value)
        const filtered = chapterFilter.status
          ? allRecords.filter((r) => r.status === chapterFilter.status)
          : allRecords
        const start = (recordPage.value - 1) * recordPageSize.value
        const end = start + recordPageSize.value
        publishRecords.value = filtered.slice(start, end)
        recordTotal.value = filtered.length
        return
      }
      const res = await getPublishRecords(bookId.value, {
        page: recordPage.value,
        page_size: recordPageSize.value,
        status: (chapterFilter.status as PublishStatus) || undefined,
      })
      publishRecords.value = res.items
      recordTotal.value = res.total
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '加载失败')
    } finally {
      loadingRecords.value = false
    }
  }

  // 发布章节
  const publishChapter = async (record: PublishRecord, loadStats: () => void) => {
    try {
      const shouldContinue = await confirmQualityGateBeforePublish(record, '发布')
      if (!shouldContinue) return

      if (isMockProjectContext.value) {
        const records = ensureMockRecords(bookId.value)
        const target = records.find((r) => r.chapter_id === record.chapter_id)
        if (target) {
          target.status = 'published'
          target.published_at = new Date().toISOString()
        }
        persistMockPublication(bookId.value)
        authStore.promoteToAuthorByPublishing(false)
        message.success('发布成功（Mock）')
        loadPublishRecords()
        loadStats()
        return
      }
      await apiPublishChapter(record.chapter_id, {
        chapter_id: record.chapter_id,
        chapter_title: record.chapter_title,
        chapter_number: record.chapter_number,
        project_id: bookId.value,
      } as ChapterPublishConfig & { project_id: string })
      authStore.promoteToAuthorByPublishing(false)
      // 发布成功后刷新用户信息，若后端已自动升级作者角色可立即生效
      await authStore.getUserInfo().catch(() => undefined)
      message.success('发布成功')
      loadPublishRecords()
      loadStats()
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '发布失败')
    }
  }

  // 下架章节
  const unpublishChapter = async (record: PublishRecord, loadStats: () => void) => {
    try {
      if (isMockProjectContext.value) {
        const records = ensureMockRecords(bookId.value)
        const target = records.find((r) => r.chapter_id === record.chapter_id)
        if (target) {
          target.status = 'draft'
          target.published_at = undefined
        }
        persistMockPublication(bookId.value)
        message.success('下架成功（Mock）')
        loadPublishRecords()
        loadStats()
        return
      }
      await apiUnpublishChapter(record.chapter_id, bookId.value)
      message.success('下架成功')
      loadPublishRecords()
      loadStats()
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '操作失败')
    }
  }

  // 定时发布
  const scheduleChapter = async (record: PublishRecord, loadStats: () => void) => {
    const shouldContinue = await confirmQualityGateBeforePublish(record, '定时发布')
    if (!shouldContinue) return

    if (isMockProjectContext.value) {
      const records = ensureMockRecords(bookId.value)
      const target = records.find((r) => r.chapter_id === record.chapter_id)
      if (target) {
        target.status = 'scheduled'
        target.published_at = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      }
      persistMockPublication(bookId.value)
      message.success('已设为定时发布（Mock）')
      loadPublishRecords()
      loadStats()
      return
    }
    try {
      const publishAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      await apiScheduleChapter(record.chapter_id, bookId.value, {
        chapter_id: record.chapter_id,
        chapter_title: record.chapter_title,
        chapter_number: record.chapter_number,
        is_free: true,
        publish_at: publishAt,
      })
      message.success('已设为次日定时发布')
      loadPublishRecords()
      loadStats()
    } catch (error: unknown) {
      const err = error as Error
      message.error(err.message || '定时发布失败')
    }
  }

  // 查看审核
  const viewReview = () => {
    return
  }

  // 计算 Mock 统计
  const computeMockStats = (projectId: string): PublishStats => {
    const records = ensureMockRecords(projectId)
    const total = records.length
    const published = records.filter((r) => r.status === 'published').length
    const pending = records.filter((r) => r.status === 'pending_review').length
    const scheduled = records.filter((r) => r.status === 'scheduled').length
    const draft = total - published - pending - scheduled
    const totalWords = Number(currentLocalProject.value?.wordCount || total * 1800)
    const publishedWords = Math.floor(totalWords * (published / Math.max(total, 1)))
    return {
      total_chapters: total,
      published_chapters: published,
      draft_chapters: Math.max(0, draft),
      pending_review_chapters: pending,
      scheduled_chapters: scheduled,
      total_words: totalWords,
      published_words: publishedWords,
    }
  }

  return {
    loadingRecords,
    publishRecords,
    recordPage,
    recordPageSize,
    recordTotal,
    chapterFilter,
    mockRecordMap,
    ensureMockRecords,
    persistMockPublication,
    loadPublishRecords,
    publishChapter,
    unpublishChapter,
    scheduleChapter,
    viewReview,
    computeMockStats,
  }
}
