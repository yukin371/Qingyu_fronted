import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useEditorStore } from '../editorStore'

const mockGetDocumentContents = vi.fn()
const mockGetDocumentContent = vi.fn()
const mockReplaceDocumentContents = vi.fn()

const mockLoadAll = vi.fn()
const mockUseWorldStore = vi.fn()

vi.mock('@/modules/writer/api/wrapper', () => ({
  getDocumentContents: (...args: unknown[]) => mockGetDocumentContents(...args),
  getDocumentContent: (...args: unknown[]) => mockGetDocumentContent(...args),
  replaceDocumentContents: (...args: unknown[]) => mockReplaceDocumentContents(...args),
}))

vi.mock('../worldStore', () => ({
  useWorldStore: (...args: unknown[]) => mockUseWorldStore(...args),
}))

describe('EditorStore V2 Actions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loadDocument 应该优先加载段落内容并更新映射状态', async () => {
    const store = useEditorStore()
    mockGetDocumentContents.mockResolvedValue({
      data: {
        contents: [
          { paragraphId: 'p-1', order: 0, content: '第一段' },
          { paragraphId: 'p-2', order: 1, content: '第二段' },
        ],
      },
    })

    await store.loadDocument('doc-1')

    expect(store.currentChapterId).toBe('doc-1')
    expect(store.paragraphOrder).toEqual(['p-1', 'p-2'])
    expect(store.paragraphs.get('p-1')?.content).toBe('第一段')
    expect(store.content).toBe('第一段\n第二段')
    expect(store.editorContent).toBe('第一段\n第二段')
    expect(store.isSaving).toBe(false)
    expect(store.isDirty).toBe(false)
  })

  it('loadDocument 在段落接口失败时应回退到全文接口', async () => {
    const store = useEditorStore()
    mockGetDocumentContents.mockRejectedValue(new Error('segment api down'))
    mockGetDocumentContent.mockResolvedValue({
      data: { content: 'fallback 文本' },
    })

    await store.loadDocument('doc-fallback')

    expect(store.currentChapterId).toBe('doc-fallback')
    expect(store.content).toBe('fallback 文本')
    expect(store.editorContent).toBe('fallback 文本')
    expect(store.isSaving).toBe(false)
  })

  it('saveParagraphs 在未选中文档时不调用 API', async () => {
    const store = useEditorStore()

    await store.saveParagraphs([{ paragraphId: 'p-1', order: 0, content: 'x' }])

    expect(mockReplaceDocumentContents).not.toHaveBeenCalled()
  })

  it('saveParagraphs 应调用替换 API 并同步段落与内容', async () => {
    const store = useEditorStore()
    store.setCurrentChapter('doc-save')
    mockReplaceDocumentContents.mockResolvedValue({ data: { ok: true } })

    const contents = [
      { paragraphId: 'p-1', order: 0, content: 'alpha' },
      { paragraphId: 'p-2', order: 1, content: 'beta' },
    ]
    await store.saveParagraphs(contents)

    expect(mockReplaceDocumentContents).toHaveBeenCalledTimes(1)
    expect(mockReplaceDocumentContents).toHaveBeenCalledWith('doc-save', contents)
    expect(store.paragraphOrder).toEqual(['p-1', 'p-2'])
    expect(store.paragraphs.get('p-2')?.content).toBe('beta')
    expect(store.content).toBe('alpha\nbeta')
    expect(store.editorContent).toBe('alpha\nbeta')
    expect(store.isDirty).toBe(false)
  })

  it('loadSettings 应按类型返回 worldStore 数据', async () => {
    const store = useEditorStore()
    store.setCurrentProject('project-1')
    mockUseWorldStore.mockReturnValue({
      loadAll: mockLoadAll,
      characters: [{ id: 'c1', name: '角色A' }],
      locations: [{ id: 'l1', name: '地点A' }],
    })

    const chars = await store.loadSettings('character')
    const locs = await store.loadSettings('location')
    const items = await store.loadSettings('item')

    expect(mockLoadAll).toHaveBeenCalledTimes(3)
    expect(chars).toEqual([{ id: 'c1', name: '角色A' }])
    expect(locs).toEqual([{ id: 'l1', name: '地点A' }])
    expect(items).toEqual([])
  })
})
