import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  resolveWriterDocumentTarget,
  shouldForceCurrentDocumentTarget,
} from '../writerDocumentAgent.service'

const mockListDocuments = vi.fn()
const mockReadDocument = vi.fn()
const mockSearchDocument = vi.fn()

vi.mock('../documentTools.service', () => ({
  documentToolsService: {
    listDocuments: (...args: unknown[]) => mockListDocuments(...args),
    readDocument: (...args: unknown[]) => mockReadDocument(...args),
    searchDocument: (...args: unknown[]) => mockSearchDocument(...args),
  },
}))

describe('writerDocumentAgent.service', () => {
  beforeEach(() => {
    mockListDocuments.mockReset()
    mockReadDocument.mockReset()
    mockSearchDocument.mockReset()
  })

  it('forces current document target when the prompt explicitly mentions current chapter', async () => {
    const result = await resolveWriterDocumentTarget('请扩写当前章节，补足细节', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '第一章',
      currentSourceText: '当前整章正文',
      selectedContext: {
        text: '候选稿正文',
        addedAt: Date.now(),
        kind: 'revision',
        applyMode: 'replace_document',
      },
    })

    expect(result).toMatchObject({
      status: 'ready',
      targetKind: 'current_document',
      sourceText: '当前整章正文',
    })
  })

  it('keeps revision candidate as the target when no explicit chapter target is given', async () => {
    const result = await resolveWriterDocumentTarget('把这版语气压得更冷', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '第一章',
      currentSourceText: '当前整章正文',
      selectedContext: {
        text: '候选稿正文',
        addedAt: Date.now(),
        kind: 'revision',
        applyMode: 'replace_document',
      },
    })

    expect(result).toMatchObject({
      status: 'ready',
      targetKind: 'revision',
      sourceText: '候选稿正文',
      applyModeHint: 'replace_document',
    })
  })

  it('resolves previous chapter by document order', async () => {
    mockListDocuments.mockResolvedValue({
      documents: [
        {
          documentId: 'chapter-1',
          title: '第一章',
          level: 0,
          order: 1,
          type: 'chapter',
          wordCount: 0,
        },
        {
          documentId: 'chapter-2',
          title: '第二章',
          level: 0,
          order: 2,
          type: 'chapter',
          wordCount: 0,
        },
      ],
    })
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-1',
      version: 1,
      contentType: 'plain_text',
      totalLines: 1,
      lines: [{ line: 1, text: '第一章正文' }],
    })

    const result = await resolveWriterDocumentTarget('在上一章补一段伏笔', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-2',
      currentDocumentTitle: '第二章',
      currentSourceText: '第二章正文',
      selectedContext: null,
    })

    expect(result).toMatchObject({
      status: 'ready',
      targetKind: 'resolved_document',
      targetDocumentId: 'chapter-1',
      targetDocumentTitle: '第一章',
      sourceText: '第一章正文',
    })
  })

  it('resolves quoted chapter titles to target documents', async () => {
    mockListDocuments.mockResolvedValue({
      documents: [
        {
          documentId: 'chapter-1',
          title: '序章',
          level: 0,
          order: 1,
          type: 'chapter',
          wordCount: 0,
        },
        {
          documentId: 'chapter-2',
          title: '雨夜',
          level: 0,
          order: 2,
          type: 'chapter',
          wordCount: 0,
        },
      ],
    })
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-2',
      version: 1,
      contentType: 'plain_text',
      totalLines: 1,
      lines: [{ line: 1, text: '雨夜章节正文' }],
    })

    const result = await resolveWriterDocumentTarget('帮我重写《雨夜》这一章的结尾', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '序章',
      currentSourceText: '序章正文',
      selectedContext: null,
    })

    expect(result).toMatchObject({
      status: 'ready',
      targetDocumentId: 'chapter-2',
      targetDocumentTitle: '雨夜',
      sourceText: '雨夜章节正文',
    })
  })

  it('falls back to keyword search when the prompt asks to find a matching chapter', async () => {
    mockListDocuments.mockResolvedValue({
      documents: [
        {
          documentId: 'chapter-1',
          title: '第一章',
          level: 0,
          order: 1,
          type: 'chapter',
          wordCount: 0,
        },
        {
          documentId: 'chapter-2',
          title: '第二章',
          level: 0,
          order: 2,
          type: 'chapter',
          wordCount: 0,
        },
      ],
    })
    mockSearchDocument.mockResolvedValueOnce({
      documentId: 'chapter-1',
      query: '玉佩',
      totalMatches: 0,
      matches: [],
    })
    mockSearchDocument.mockResolvedValueOnce({
      documentId: 'chapter-2',
      query: '玉佩',
      totalMatches: 2,
      matches: [{ line: 3, startColumn: 1, endColumn: 2, text: '玉佩发烫', before: [], after: [] }],
    })
    mockReadDocument.mockResolvedValue({
      documentId: 'chapter-2',
      version: 1,
      contentType: 'plain_text',
      totalLines: 1,
      lines: [{ line: 1, text: '第二章正文' }],
    })

    const result = await resolveWriterDocumentTarget('找到提到玉佩的章节，并补强伏笔', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '第一章',
      currentSourceText: '第一章正文',
      selectedContext: null,
    })

    expect(result).toMatchObject({
      status: 'ready',
      targetDocumentId: 'chapter-2',
      targetDocumentTitle: '第二章',
      sourceText: '第二章正文',
    })
  })

  it('reports ambiguity when keyword search matches multiple chapters', async () => {
    mockListDocuments.mockResolvedValue({
      documents: [
        {
          documentId: 'chapter-1',
          title: '第一章',
          level: 0,
          order: 1,
          type: 'chapter',
          wordCount: 0,
        },
        {
          documentId: 'chapter-2',
          title: '第二章',
          level: 0,
          order: 2,
          type: 'chapter',
          wordCount: 0,
        },
      ],
    })
    mockSearchDocument.mockResolvedValue({
      query: '玉佩',
      totalMatches: 1,
      matches: [{ line: 1, startColumn: 1, endColumn: 2, text: '玉佩', before: [], after: [] }],
    })

    const result = await resolveWriterDocumentTarget('找到提到玉佩的章节，并补强伏笔', {
      projectId: 'project-1',
      currentDocumentId: 'chapter-1',
      currentDocumentTitle: '第一章',
      currentSourceText: '第一章正文',
      selectedContext: null,
    })

    expect(result.status).toBe('unresolved')
    expect(result.assistantMessage).toContain('命中了多个章节')
  })

  it('recognizes force-current-document phrases', () => {
    expect(shouldForceCurrentDocumentTarget('请重写当前章节')).toBe(true)
    expect(shouldForceCurrentDocumentTarget('帮我扩写本章全文')).toBe(true)
    expect(shouldForceCurrentDocumentTarget('继续修改这版候选稿')).toBe(false)
  })
})
