import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  extractWriterAssetCandidates,
  loadWriterAssetRefState,
  removeScopeAssetRef,
  upsertScopeAssetRef,
} from '../writerAssetRefs'

describe('writerAssetRefs', () => {
  beforeEach(() => {
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    })
    localStorage.clear()
  })

  it('应从正文中提取可绑定的角色和地点候选', () => {
    const candidates = extractWriterAssetCandidates({
      text: '夜里，@沈砚 再次踏进 #雾港。阿砚知道雾港已经失守，%铜钥匙 还在身上。',
      characters: [
        {
          id: 'char-1',
          name: '沈砚',
          alias: ['阿砚'],
        },
      ],
      locations: [
        {
          id: 'loc-1',
          name: '雾港',
        },
      ],
      items: [
        {
          id: 'item-1',
          name: '铜钥匙',
          alias: ['仓库钥匙'],
        },
      ],
    })

    expect(candidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetType: 'character',
          assetId: 'char-1',
          assetName: '沈砚',
        }),
        expect.objectContaining({
          assetType: 'location',
          assetId: 'loc-1',
          assetName: '雾港',
        }),
        expect.objectContaining({
          assetType: 'item',
          assetId: 'item-1',
          assetName: '铜钥匙',
          unresolved: false,
        }),
      ]),
    )
  })

  it('应持久化并移除章节绑定资产', () => {
    const projectId = 'project-1'
    upsertScopeAssetRef({
      projectId,
      scopeType: 'chapter',
      scopeId: 'chapter-1',
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      source: 'mention',
    })

    let state = loadWriterAssetRefState(projectId)
    expect(state.chapterRefs['chapter-1']).toHaveLength(1)
    expect(state.chapterRefs['chapter-1'][0]).toMatchObject({
      assetType: 'character',
      assetId: 'char-1',
      assetName: '沈砚',
      scopeType: 'chapter',
      scopeId: 'chapter-1',
    })

    state = removeScopeAssetRef(
      projectId,
      'chapter',
      'chapter-1',
      state.chapterRefs['chapter-1'][0].id,
    )
    expect(state.chapterRefs['chapter-1']).toEqual([])
  })
})
