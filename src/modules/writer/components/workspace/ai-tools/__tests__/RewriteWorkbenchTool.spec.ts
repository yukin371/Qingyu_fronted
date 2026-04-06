import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RewriteWorkbenchTool from '../RewriteWorkbenchTool.vue'

const rewriteWithWorkbench = vi.fn()

vi.mock('@/modules/ai/api/workbench', () => ({
  rewriteWithWorkbench: (...args: unknown[]) => rewriteWithWorkbench(...args),
}))

describe('RewriteWorkbenchTool', () => {
  beforeEach(() => {
    rewriteWithWorkbench.mockReset()
    rewriteWithWorkbench.mockResolvedValue({ rewrittenText: '改写后的文本。' })
  })

  it('merges workflow context prompt into rewrite instructions', async () => {
    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '原始文本',
        actionTrigger: null,
        workflowContext: {
          signature: 'sig-1',
          projectId: 'project-1',
          chapterId: 'chapter-1',
          chapterTitle: '第一章',
          scopeLabel: '第一场',
          activeCharacters: [],
          activeRelations: [],
          pendingChangeRequests: [],
          pendingChangeRequestCount: 2,
        },
      },
    })

    await wrapper.get('input[type="text"]').setValue('保持节奏紧凑')
    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(rewriteWithWorkbench).toHaveBeenCalledTimes(1)
    expect(rewriteWithWorkbench).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        chapterId: 'chapter-1',
        originalText: '原始文本',
        instructions: expect.stringContaining('保持节奏紧凑'),
      }),
    )

    const payload = rewriteWithWorkbench.mock.calls[0][0] as {
      instructions?: string
      chapterId?: string
    }
    expect(payload.instructions).toContain('当前工作流上下文：')
    expect(payload.instructions).toContain('章节：第一章')
    expect(payload.instructions).toContain('场景作用域：第一场')
  })

  it('keeps instructions undefined when both manual and workflow context are empty', async () => {
    const wrapper = mount(RewriteWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: '',
        chapterTitle: '',
        seedText: '原始文本',
        actionTrigger: null,
        workflowContext: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(rewriteWithWorkbench).toHaveBeenCalledTimes(1)
    const payload = rewriteWithWorkbench.mock.calls[0][0] as { instructions?: string }
    expect(payload.instructions).toBeUndefined()
    expect(payload.chapterId).toBeUndefined()
  })
})
