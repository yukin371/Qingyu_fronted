import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StoryHarnessPanel from '../StoryHarnessPanel.vue'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'

describe('StoryHarnessPanel', () => {
  it('点击建议队列入口后应打开 Change Request 抽屉', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.hydrateSavedBatch = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三开始怀疑李四。',
        chapterCount: 12,
        scopeLabel: '第一章 / 当前章节',
        activeCharacters: [{ id: 'char-1', name: '张三', traits: ['热血'], currentState: '怀疑中' }],
        activeRelations: [],
        changeRequests: [
          {
            id: 'cr-1',
            source: 'live',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
        ],
        handleTriggerIndex: vi.fn().mockResolvedValue(undefined),
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: {
            props: ['modelValue', 'changeRequests', 'handleChangeRequestDecision'],
            template:
              '<div data-testid="story-harness-drawer-stub" :data-open="String(modelValue)" :data-count="changeRequests.length" />',
          },
        },
      },
    })

    expect(wrapper.get('[data-testid="story-harness-drawer-stub"]').attributes('data-open')).toBe('false')
    await wrapper.get('[data-testid="story-harness-open-change-requests"]').trigger('click')
    expect(wrapper.get('[data-testid="story-harness-drawer-stub"]').attributes('data-open')).toBe('true')
  })

  it('点击生成建议按钮后应调用手动索引入口', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const handleTriggerIndex = vi.fn().mockResolvedValue(undefined)

    const wrapper = mount(StoryHarnessPanel, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        content: '张三开始怀疑李四。',
        chapterCount: 12,
        changeRequests: [],
        handleTriggerIndex,
      },
      global: {
        plugins: [pinia],
        stubs: {
          StoryHarnessChangeRequestDrawer: true,
        },
      },
    })

    await wrapper.get('[data-testid="story-harness-trigger-index"]').trigger('click')
    expect(handleTriggerIndex).toHaveBeenCalledTimes(1)
  })
})
