import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ref, computed } from 'vue'
import {
  useWorkflowContext,
  formatEntityStatsLabel,
  buildEntitySummary,
} from '../useWorkflowContext'

// Mock the stores
vi.mock('@/modules/writer/stores/writerStore', () => ({
  useWriterStore: () => ({
    characters: {
      list: [
        { id: 'char-1', name: '张三', traits: ['勇敢'], currentState: '紧张' },
        { id: 'char-2', name: '李四', traits: ['聪明'], currentState: '平静' },
      ],
      relations: [{ id: 'rel-1', fromId: 'char-1', toId: 'char-2', type: '朋友', strength: 5 }],
    },
  }),
}))

vi.mock('@/modules/writer/stores/v3/storyHarnessStore', () => ({
  useStoryHarnessStore: () => ({
    savedBatchChangeRequests: [
      { id: 'cr-1', title: '更新张三的恐惧值', summary: '...' },
      { id: 'cr-2', title: '关系变更', summary: '...' },
    ],
  }),
}))

describe('useWorkflowContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns workflow context signature based on project and chapter id', () => {
    const projectId = computed(() => 'project-1')
    const chapterId = computed(() => 'chapter-1')

    const { workflowContextSignature } = useWorkflowContext({
      projectId,
      chapterId,
    })

    expect(workflowContextSignature.value).toBe('project-1-chapter-1')
  })

  it('returns workflow context with correct structure', () => {
    const projectId = computed(() => 'project-1')
    const chapterId = computed(() => 'chapter-1')

    const { workflowContext } = useWorkflowContext({
      projectId,
      chapterId,
    })

    expect(workflowContext.value.signature).toBe('project-1-chapter-1')
    expect(workflowContext.value.projectId).toBe('project-1')
    expect(workflowContext.value.chapterId).toBe('chapter-1')
    expect(workflowContext.value.chapterTitle).toBe('')
  })

  it('returns active characters from writer store', () => {
    const projectId = computed(() => 'project-1')
    const chapterId = computed(() => 'chapter-1')

    const { activeCharacters } = useWorkflowContext({
      projectId,
      chapterId,
    })

    expect(activeCharacters.value).toHaveLength(2)
    expect(activeCharacters.value[0].name).toBe('张三')
    expect(activeCharacters.value[0].currentState).toBe('紧张')
  })

  it('returns active relations from writer store', () => {
    const projectId = computed(() => 'project-1')
    const chapterId = computed(() => 'chapter-1')

    const { activeRelations } = useWorkflowContext({
      projectId,
      chapterId,
    })

    expect(activeRelations.value).toHaveLength(1)
    expect(activeRelations.value[0].fromName).toBe('张三')
    expect(activeRelations.value[0].toName).toBe('李四')
  })

  it('returns pending change requests count', () => {
    const projectId = computed(() => 'project-1')
    const chapterId = computed(() => 'chapter-1')

    const { pendingChangeRequestsCount } = useWorkflowContext({
      projectId,
      chapterId,
    })

    expect(pendingChangeRequestsCount.value).toBe(2)
  })

  it('returns entity stats with character counts', () => {
    const projectId = computed(() => 'project-1')
    const chapterId = computed(() => 'chapter-1')

    const { entityStats } = useWorkflowContext({
      projectId,
      chapterId,
    })

    expect(entityStats.value.characters).toBe(2)
    expect(entityStats.value.pending).toBe(2)
  })
})

describe('formatEntityStatsLabel', () => {
  it('formats entity stats with all types', () => {
    const stats = {
      characters: 3,
      items: 2,
      locations: 1,
      pending: 5,
    }

    const label = formatEntityStatsLabel(stats)

    expect(label).toContain('角色 3')
    expect(label).toContain('物品 2')
    expect(label).toContain('地点 1')
    expect(label).toContain('待处理 5')
  })

  it('returns "暂无数据" for zero stats', () => {
    const stats = { characters: 0, items: 0, locations: 0, pending: 0 }

    const label = formatEntityStatsLabel(stats)

    expect(label).toBe('暂无数据')
  })
})

describe('buildEntitySummary', () => {
  it('builds entity summary from characters', () => {
    const characters = [
      { id: 'char-1', name: '张三', currentState: '紧张', traits: [] },
      { id: 'char-2', name: '李四', currentState: '平静', traits: [] },
    ]

    const summary = buildEntitySummary(characters)

    expect(summary).toHaveLength(2)
    expect(summary[0]).toEqual({
      id: 'char-1',
      name: '张三',
      type: 'character',
      summary: '紧张',
    })
  })
})
