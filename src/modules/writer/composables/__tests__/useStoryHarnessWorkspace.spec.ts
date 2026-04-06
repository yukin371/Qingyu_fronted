import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStoryHarnessWorkspace } from '../useStoryHarnessWorkspace'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore'

describe('useStoryHarnessWorkspace', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应整合作用域上下文，并在保存后让正式批次压住同签名即时预览', async () => {
    const writerStore = useWriterStore()
    const harnessStore = useStoryHarnessStore()

    writerStore.characters.list = [
      { id: 'char-1', name: '张三', traits: ['热血'], currentState: '强撑' },
      { id: 'char-2', name: '李四', traits: ['冷静'], currentState: '负伤' },
    ] as any
    writerStore.characters.relations = [
      {
        id: 'rel-1',
        fromId: 'char-1',
        toId: 'char-2',
        type: '同盟',
        strength: 72,
      },
    ] as any
    writerStore.outline.tree = [
      {
        id: 'outline-1',
        documentId: 'chapter-1',
        title: '雨夜祠堂',
        characters: ['char-1'],
        children: [],
      },
    ] as any
    writerStore.outline.currentNode = null

    const displayChapterId = ref('chapter-1')
    const displayChapterTitle = ref('第一章')
    const currentChapterPlainText = ref(
      '张三看见李四断了手，却没敢立刻追问。\n// @张三 受伤严重，退出后续战斗。',
    )
    const availableDocMap = computed(
      () =>
        new Map([
          [
            'chapter-1',
            {
              id: 'chapter-1',
              title: '第一章',
              characterIds: ['char-2'],
            },
          ],
        ]) as any,
    )

    const harness = useStoryHarnessWorkspace({
      projectId: computed(() => 'project-1'),
      displayChapterId: computed(() => displayChapterId.value),
      displayChapterTitle: computed(() => displayChapterTitle.value),
      currentChapterPlainText: computed(() => currentChapterPlainText.value),
      availableDocMap,
    })

    expect(harness.currentScopeLabel.value).toBe('雨夜祠堂')
    expect(harness.activeScopeCharacters.value.map((character) => character.name)).toEqual(['张三', '李四'])
    expect(harness.activeScopeRelations.value).toHaveLength(1)
    expect(harness.storyHarnessLiveChangeRequests.value).toHaveLength(2)
    expect(harness.storyHarnessLiveChangeRequests.value.every((item) => item.source === 'live')).toBe(true)
    expect(harness.storyHarnessChangeRequests.value[0].title).toContain('正文指令建议')

    await harness.persistCurrentLiveChangeRequests()

    expect(harnessStore.savedBatchReceipt?.count).toBe(2)
    expect(harness.storyHarnessChangeRequests.value).toHaveLength(2)
    expect(harness.storyHarnessChangeRequests.value.every((item) => item.source === 'save_batch')).toBe(true)
    expect(harness.storyHarnessChangeRequests.value[0].title).toContain('正文指令建议')
  })
})
