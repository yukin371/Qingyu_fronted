/**
 * 共享 Workflow Context Composable
 *
 * 从 ProjectWorkspace 中提取 workflow context 构建逻辑，
 * 供全屏工具复用。
 */
import { computed, type ComputedRef } from 'vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'
import type { WriterWorkflowContext } from '@/modules/writer/types/workflow'
import type {
  StoryHarnessCharacterSummary,
  StoryHarnessRelationSummary,
} from '@/modules/writer/stores/v3/storyHarnessStore'

export interface UseWorkflowContextOptions {
  projectId: ComputedRef<string>
  chapterId: ComputedRef<string>
}

export interface UseWorkflowContextReturn {
  /** 当前工作流上下文签名 */
  workflowContextSignature: ComputedRef<string>
  /** 完整的工作流上下文对象 */
  workflowContext: ComputedRef<WriterWorkflowContext>
  /** 当前章节活跃的角色列表 */
  activeCharacters: ComputedRef<StoryHarnessCharacterSummary[]>
  /** 当前章节活跃的关系列表 */
  activeRelations: ComputedRef<StoryHarnessRelationSummary[]>
  /** 当前章节待处理的变更建议数量 */
  pendingChangeRequestsCount: ComputedRef<number>
  /** 实体统计（多类型） */
  entityStats: ComputedRef<{
    characters: number
    items: number
    locations: number
    pending: number
  }>
}

/**
 * 使用共享的 Workflow Context
 *
 * @param options - 项目ID和章节ID的计算属性
 * @returns 工作流上下文及其相关数据
 */
export function useWorkflowContext(options: UseWorkflowContextOptions): UseWorkflowContextReturn {
  const { projectId, chapterId } = options

  const writerStore = useWriterStore()
  const storyHarnessStore = useStoryHarnessStore()

  /** 工作流上下文签名 */
  const workflowContextSignature = computed(() => `${projectId.value}-${chapterId.value}`)

  /** 当前章节活跃的角色列表 */
  const activeCharacters = computed<StoryHarnessCharacterSummary[]>(() => {
    return writerStore.characters.list.slice(0, 20).map((c) => ({
      id: c.id,
      name: c.name,
      traits: c.traits ?? [],
      currentState: c.currentState,
    }))
  })

  /** 当前章节活跃的关系列表 */
  const activeRelations = computed<StoryHarnessRelationSummary[]>(() => {
    return writerStore.characters.relations.slice(0, 50).map((r) => {
      const fromChar = writerStore.characters.list.find((c) => c.id === r.fromId)
      const toChar = writerStore.characters.list.find((c) => c.id === r.toId)
      return {
        id: r.id,
        fromName: fromChar?.name ?? '未知',
        toName: toChar?.name ?? '未知',
        type: r.type,
        strength: r.strength,
      }
    })
  })

  /** 当前章节待处理的变更建议数量 */
  const pendingChangeRequestsCount = computed(() => {
    return storyHarnessStore.savedBatchChangeRequests.length
  })

  /** 完整的工作流上下文对象 */
  const workflowContext = computed<WriterWorkflowContext>(() => ({
    signature: workflowContextSignature.value,
    projectId: projectId.value,
    chapterId: chapterId.value,
    chapterTitle: '',
    activeCharacters: activeCharacters.value,
    activeRelations: activeRelations.value,
    pendingChangeRequests: [],
    pendingChangeRequestCount: pendingChangeRequestsCount.value,
  }))

  /** 实体统计（多类型） */
  const entityStats = computed(() => {
    const chars = writerStore.characters.list.filter(
      (c) => (c as any).entityType !== 'item' && (c as any).entityType !== 'location',
    )
    const items = writerStore.characters.list.filter((c) => (c as any).entityType === 'item')
    const locations = writerStore.characters.list.filter(
      (c) => (c as any).entityType === 'location',
    )

    return {
      characters: chars.length,
      items: items.length,
      locations: locations.length,
      pending: pendingChangeRequestsCount.value,
    }
  })

  return {
    workflowContextSignature,
    workflowContext,
    activeCharacters,
    activeRelations,
    pendingChangeRequestsCount,
    entityStats,
  }
}

/**
 * 构建实体摘要列表（用于 Context Lens）
 */
export function buildEntitySummary(
  characters: StoryHarnessCharacterSummary[],
): Array<{ id: string; name: string; type: string; summary?: string }> {
  return characters.map((c) => ({
    id: c.id,
    name: c.name,
    type: 'character',
    summary: c.currentState,
  }))
}

/**
 * 格式化实体统计为标签文本
 */
export function formatEntityStatsLabel(stats: {
  characters: number
  items: number
  locations: number
  pending: number
}): string {
  const parts: string[] = []
  if (stats.characters > 0) parts.push(`角色 ${stats.characters}`)
  if (stats.items > 0) parts.push(`物品 ${stats.items}`)
  if (stats.locations > 0) parts.push(`地点 ${stats.locations}`)
  if (stats.pending > 0) parts.push(`待处理 ${stats.pending}`)
  return parts.join(' · ') || '暂无数据'
}
