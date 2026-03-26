import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const setTipTapEditor = vi.fn()

vi.mock('@/modules/writer/stores/editorStore', () => ({
  useEditorStore: () => ({
    setTipTapEditor,
    saveParagraphs: vi.fn().mockResolvedValue(undefined),
  }),
}))

import TipTapEditorView from '../TipTapEditorView.vue'

describe('TipTapEditorView', () => {
  it('shows empty-state guidance when the document has no plain text', () => {
    const wrapper = mount(TipTapEditorView, {
      props: {
        modelValue: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        projectId: 'project-1',
        documentId: 'chapter-1',
        showReferencePanel: false,
      },
      global: {
        stubs: {
          QyTipTapEditor: { template: '<div class="qy-tiptap-editor-stub" />' },
        },
      },
    })

    expect(wrapper.find('.editor-empty-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('这一章还没有正文')
  })

  it('emits selection-action with apply mode derived from the action', async () => {
    const wrapper = mount(TipTapEditorView, {
      props: {
        modelValue: JSON.stringify({
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '测试片段' }] }],
        }),
        projectId: 'project-1',
        documentId: 'chapter-1',
        showReferencePanel: false,
      },
      global: {
        stubs: {
          QyTipTapEditor: {
            template: `
              <button
                class="qy-tiptap-editor-stub"
                @click="$emit('selection-change', { text: '测试片段', from: 2, to: 6, x: 100, y: 80, visible: true })"
              />
            `,
          },
        },
      },
    })

    await wrapper.find('.qy-tiptap-editor-stub').trigger('click')

    await wrapper.findAll('.selection-toolbar__action')[0].trigger('click')

    expect(wrapper.emitted('selection-action')).toEqual([
      [
        {
          action: 'continue',
          text: '测试片段',
          from: 2,
          to: 6,
          applyMode: 'insert_after_selection',
        },
      ],
    ])
  })
})
