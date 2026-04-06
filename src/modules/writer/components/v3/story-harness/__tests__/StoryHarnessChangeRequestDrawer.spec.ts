import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useStoryHarnessStore } from '@/modules/writer/stores/v3/storyHarnessStore'
import StoryHarnessChangeRequestDrawer from '../StoryHarnessChangeRequestDrawer.vue'

describe('StoryHarnessChangeRequestDrawer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应支持本地合并、筛选、稍后处理和恢复待处理', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const harnessStore = useStoryHarnessStore()
    harnessStore.syncChangeRequests(['cr-1', 'cr-2'])

    const wrapper = mount(StoryHarnessChangeRequestDrawer, {
      props: {
        modelValue: true,
        changeRequests: [
          {
            id: 'cr-1',
            source: 'save_batch',
            type: 'state',
            title: '角色状态可能需要更新：张三',
            summary: '状态可能转为怀疑或动摇',
            reason: '这类变化适合先作为 Change Request 预览。',
            evidence: '张三开始怀疑李四。',
            severity: 'focus',
          },
          {
            id: 'cr-2',
            source: 'live',
            type: 'relation',
            title: '关系摘要可能需要更新：张三 → 李四',
            summary: '关系可能转向不信任',
            reason: '多人同场且正文出现冲突表达。',
            severity: 'hint',
          },
        ],
      },
      global: {
        plugins: [pinia],
        stubs: {
          QyDrawer: { template: '<div><slot /><slot name="footer" /></div>' },
        },
      },
    })

    expect(wrapper.text()).toContain('待处理队列')
    expect(harnessStore.pendingChangeRequestCount).toBe(2)
    expect(wrapper.text()).toContain('保存后批次 1')
    expect(wrapper.text()).toContain('即时预览 1')

    await wrapper.get('[data-testid="story-harness-accept-cr-1"]').trigger('click')
    expect(harnessStore.acceptedChangeRequestCount).toBe(1)
    expect(harnessStore.pendingChangeRequestCount).toBe(1)
    expect(wrapper.text()).toContain('最近处理')
    expect(wrapper.text()).toContain('已标记为已合并')

    await wrapper.get('[data-testid="story-harness-filter-resolved"]').trigger('click')
    expect(wrapper.text()).toContain('已处理记录')
    expect(wrapper.text()).toContain('角色状态可能需要更新：张三')
    expect(wrapper.text()).not.toContain('关系摘要可能需要更新：张三 → 李四')

    await wrapper.get('[data-testid="story-harness-reset-cr-1"]').trigger('click')
    expect(harnessStore.pendingChangeRequestCount).toBe(2)

    await wrapper.get('[data-testid="story-harness-filter-pending"]').trigger('click')
    await wrapper.get('[data-testid="story-harness-defer-cr-1"]').trigger('click')
    expect(harnessStore.deferredChangeRequestCount).toBe(1)
    expect(harnessStore.pendingChangeRequestCount).toBe(1)

    expect(wrapper.text()).toContain('关系摘要可能需要更新：张三 → 李四')
  })
})
