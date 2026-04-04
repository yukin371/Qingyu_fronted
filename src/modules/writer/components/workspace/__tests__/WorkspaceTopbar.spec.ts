import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceTopbar from '../WorkspaceTopbar.vue'

describe('WorkspaceTopbar', () => {
  it('emits panel toggle events from icon buttons', async () => {
    const wrapper = mount(WorkspaceTopbar, {
      props: {
        projectDisplayName: '测试项目',
        currentChapterTitle: '第一章',
        activeToolLabel: '写作',
        saveStatusLabel: '已保存',
        leftPanelCollapsed: false,
        rightPanelCollapsed: false,
        isImmersiveMode: false,
      },
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(wrapper.emitted('toggle-left-panel')).toHaveLength(1)
    expect(wrapper.emitted('toggle-right-panel')).toHaveLength(1)
  })

  it('disables panel toggle buttons in immersive mode', () => {
    const wrapper = mount(WorkspaceTopbar, {
      props: {
        projectDisplayName: '测试项目',
        currentChapterTitle: '第一章',
        activeToolLabel: '沉浸',
        saveStatusLabel: '已保存',
        leftPanelCollapsed: false,
        rightPanelCollapsed: false,
        isImmersiveMode: true,
      },
      global: {
        stubs: {
          QyIcon: true,
        },
      },
    })

    const buttons = wrapper.findAll('button')
    expect((buttons[0].element as HTMLButtonElement).disabled).toBe(true)
    expect((buttons[1].element as HTMLButtonElement).disabled).toBe(true)
  })
})
