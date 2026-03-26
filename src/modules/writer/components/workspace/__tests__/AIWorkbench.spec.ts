import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AIWorkbench from '../AIWorkbench.vue'

describe('AIWorkbench', () => {
  it('renders apply feedback and switches tabs from action triggers', async () => {
    const wrapper = mount(AIWorkbench, {
      shallow: true,
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        sourceText: '这是当前章节正文。',
        actionTrigger: null,
        aiApplyFeedback: {
          status: 'fallback',
          title: '选区已失效，改为安全回填',
          detail: '原选区内容已变化，系统改为按段落写回。',
          mode: 'replace_selection',
          updatedAt: Date.now(),
        },
      },
    })

    await wrapper.setProps({
      actionTrigger: {
        id: 1,
        action: 'rewrite',
        text: '测试片段',
        applyMode: 'replace_selection',
      },
    })
    await nextTick()

    expect(wrapper.find('.apply-feedback').exists()).toBe(true)
    expect(wrapper.find('.apply-feedback').text()).toContain('选区已失效')
    expect(wrapper.html()).toContain('rewrite-workbench-tool-stub')
  })
})
