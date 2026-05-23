import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ReviewWorkbenchTool from '../ReviewWorkbenchTool.vue'

const proofreadContent = vi.fn()
const auditSensitiveWords = vi.fn()
const saveProofreadQualityGateRecord = vi.fn()

vi.mock('@/modules/ai/api/workbench', () => ({
  proofreadContent: (...args: unknown[]) => proofreadContent(...args),
  auditSensitiveWords: (...args: unknown[]) => auditSensitiveWords(...args),
}))

vi.mock('@/modules/writer/services/proofreadQualityGate.service', () => ({
  saveProofreadQualityGateRecord: (...args: unknown[]) => saveProofreadQualityGateRecord(...args),
}))

describe('ReviewWorkbenchTool', () => {
  beforeEach(() => {
    proofreadContent.mockReset()
    auditSensitiveWords.mockReset()
    saveProofreadQualityGateRecord.mockReset()

    proofreadContent.mockResolvedValue({
      issues: [
        {
          id: 'issue-1',
          type: 'grammar',
          severity: 'warning',
          message: '建议调整语序以减少歧义',
          suggestions: ['将主语提前', '缩短从句'],
        },
      ],
      score: 86.5,
      previewWarnings: [],
    })

    auditSensitiveWords.mockResolvedValue({
      sensitiveWords: [
        {
          id: 'risk-1',
          word: '极端措辞',
          suggestion: '建议替换为更中性表达',
        },
      ],
    })
  })

  it('emits a review result candidate for proofread results', async () => {
    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在雨夜里盯着李四，情绪极端。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')

    expect(proofreadContent).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'review',
      action: 'proofread',
      title: '审校建议提案',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain(
      '建议调整语序以减少歧义',
    )
    expect(saveProofreadQualityGateRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        chapterId: 'chapter-1',
        issues: expect.any(Array),
      }),
    )
    expect(wrapper.emitted('proofreadIssuesChange')?.[0]?.[0]).toEqual([])
  })

  it('emits a review result candidate for audit results', async () => {
    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在雨夜里盯着李四，情绪极端。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__primary').trigger('click')

    expect(auditSensitiveWords).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]).toMatchObject({
      source: 'review',
      action: 'audit',
      title: '风险复核提案',
    })
    expect(wrapper.emitted('resultCandidate')?.[0]?.[0]?.generatedText).toContain('极端措辞')
    expect(wrapper.emitted('proofreadIssuesChange')?.[0]?.[0]).toEqual([])
  })

  it('shows unified running and ready status copy for proofread lifecycle', async () => {
    let resolveProofread: (value: { issues: unknown[]; score: number }) => void
    proofreadContent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProofread = resolve
        }),
    )

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在雨夜里盯着李四，情绪极端。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--running')
    expect(wrapper.get('.tool-panel__status').text()).toContain('处理中')

    resolveProofread!({
      issues: [
        {
          id: 'issue-1',
          type: 'grammar',
          message: '建议调整语序',
        },
      ],
      score: 90,
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--success')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已就绪')
  })

  it('shows synced status copy when review action is injected before execution', () => {
    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '',
        actionTrigger: {
          source: 'review',
          action: 'proofread',
          text: '',
        },
      },
    })

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--warning')
    expect(wrapper.get('.tool-panel__status').text()).toContain('已同步')
  })

  it('applies a positioned proofread suggestion through the editor apply payload', async () => {
    proofreadContent.mockResolvedValue({
      issues: [
        {
          id: 'issue-1',
          type: 'typo',
          severity: 'error',
          message: '疑似错别字',
          position: {
            start: 2,
            end: 4,
          },
          originalText: '在见',
          suggestions: ['再见'],
        },
      ],
      score: 72,
      previewWarnings: [],
    })

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在见李四。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('proofreadIssuesChange')?.[0]?.[0]).toEqual([
      {
        id: 'issue-1',
        severity: 'error',
        position: {
          start: 2,
          end: 4,
        },
        originalText: '在见',
        status: 'open',
      },
    ])

    await wrapper.get('.review-issue__actions .result-card__action').trigger('click')

    expect(wrapper.emitted('apply')?.[0]?.[0]).toMatchObject({
      action: 'proofread',
      sourceText: '张三在见李四。',
      generatedText: '张三再见李四。',
      applyMode: 'replace_document',
      targetDocumentId: 'chapter-1',
    })
    expect(wrapper.emitted('proofreadIssuesChange')?.[1]?.[0]).toEqual([])
    expect(wrapper.text()).toContain('已接受')
  })

  it('emits focus event for positioned open issues', async () => {
    proofreadContent.mockResolvedValue({
      issues: [
        {
          id: 'issue-focus',
          type: 'grammar',
          severity: 'warning',
          message: '建议定位检查',
          position: {
            start: 0,
            end: 2,
          },
          originalText: '张三',
          suggestions: ['张三'],
        },
      ],
      score: 88,
      previewWarnings: [],
    })

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三站在雨里。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    await flushPromises()
    await wrapper.findAll('.review-issue__actions .result-card__action')[1].trigger('click')

    expect(wrapper.emitted('proofreadIssueFocus')?.[0]?.[0]).toBe('issue-focus')
  })

  it('keeps stale positioned issues visible but disables unsafe apply and focus', async () => {
    proofreadContent.mockResolvedValue({
      issues: [
        {
          id: 'issue-stale-position',
          type: 'typo',
          severity: 'error',
          message: '疑似错别字',
          position: {
            start: 0,
            end: 2,
          },
          originalText: '李四',
          suggestions: ['李思'],
        },
      ],
      score: 70,
      previewWarnings: [],
    })

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三站在雨里。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('原文片段与当前正文不一致，请重新审校。')
    const actions = wrapper.findAll('.review-issue__actions .result-card__action')
    expect(actions[0].attributes('disabled')).toBeDefined()
    expect(actions[1].attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('proofreadIssuesChange')?.[0]?.[0]).toEqual([])
  })

  it('marks open issues stale and clears highlights after manual content edits', async () => {
    proofreadContent.mockResolvedValue({
      issues: [
        {
          id: 'issue-edit-stale',
          type: 'typo',
          severity: 'error',
          message: '疑似错别字',
          position: {
            start: 2,
            end: 4,
          },
          originalText: '在见',
          suggestions: ['再见'],
        },
      ],
      score: 72,
      previewWarnings: [],
    })

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三在见李四。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    await flushPromises()

    expect(wrapper.emitted('proofreadIssuesChange')?.[0]?.[0]).toHaveLength(1)

    await wrapper.get('textarea').setValue('张三再见李四。')

    expect(wrapper.get('.tool-panel__status').classes()).toContain('tool-panel__status--warning')
    expect(wrapper.get('.tool-panel__status').classes()).not.toContain(
      'tool-panel__status--success',
    )
    expect(wrapper.get('.tool-panel__status').text()).toContain('结果已过期')
    expect(wrapper.text()).toContain('已过期')
    expect(wrapper.emitted('proofreadIssuesChange')?.at(-1)?.[0]).toEqual([])
  })

  it('shows mobile preview warnings and reading controls', async () => {
    proofreadContent.mockResolvedValue({
      issues: [],
      score: 96,
      previewWarnings: [
        {
          id: 'warning-1',
          type: 'paragraph_too_long',
          message: '第 1 段在手机上过长，建议拆分。',
        },
      ],
    })

    const wrapper = mount(ReviewWorkbenchTool, {
      props: {
        projectId: 'project-1',
        chapterId: 'chapter-1',
        chapterTitle: '第一章',
        seedText: '张三站在雨里。\n\n李四没有回头。',
        actionTrigger: null,
      },
    })

    await wrapper.get('.tool-panel__secondary').trigger('click')
    await flushPromises()
    await wrapper.findAll('.review-tab')[1].trigger('click')

    expect(wrapper.text()).toContain('手机阅读预览')
    expect(wrapper.text()).toContain('第 1 段在手机上过长')
    expect(wrapper.find('.phone-preview__content').html()).toContain('张三站在雨里')
  })
})
