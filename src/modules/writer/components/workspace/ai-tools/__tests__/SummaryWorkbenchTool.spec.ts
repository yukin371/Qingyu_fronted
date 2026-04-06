import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SummaryWorkbenchTool from '../SummaryWorkbenchTool.vue'

const summarizeSelection = vi.fn()
const summarizeChapter = vi.fn()

vi.mock('@/modules/ai/api/workbench', () => ({
  summarizeSelection: (...args: unknown[]) => summarizeSelection(...args),
  summarizeChapter: (...args: unknown[]) => summarizeChapter(...args),
}))

describe('SummaryWorkbenchTool', () => {
  beforeEach(() => {
    summarizeSelection.mockReset()
    summarizeChapter.mockReset()
    summarizeSelection.mockResolvedValue({
      summary: '这一段主要呈现张三对李四的试探。',
      keyPoints: ['张三先试探', '李四暂不回应'],
    })
    summarizeChapter.mockResolvedValue({
      summary: '本章应聚焦双方试探升级。',
      keyPoints: ['张三主动施压', '李四继续隐藏真实态度'],
    })
  })

  it('emits a summary result candidate for selection summaries', async () => {
    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三试探李四。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')

    expect(summarizeSelection).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'summary',
      action: 'summary',
      title: '片段摘要结果',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain('核心要点：')
  })

  it('emits a chapter-direction candidate for chapter summaries', async () => {
    const wrapper = mount(SummaryWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '整章正文。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(summarizeChapter).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'summary',
      action: 'summarize_chapter',
      title: '章节方向提案',
      sourceText: '第一章',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain(
      '本章应聚焦双方试探升级。',
    )
  })
})
