import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMetaStore } from '@/modules/bookstore/stores/meta.store'
import { browseService } from '@/modules/bookstore/services/browse.service'

vi.mock('@/modules/bookstore/services/browse.service')

describe('MetaStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should fetch categories on first call', async () => {
      const mockCategories = [
        { _id: '1', name: '玄幻' },
        { _id: '2', name: '都市' }
      ]

      vi.mocked(browseService.getCategories).mockResolvedValue({
        data: mockCategories
      })

      const store = useMetaStore()
      const result = await store.getCategories()

      expect(browseService.getCategories).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockCategories)
      expect(store.categories).toEqual(mockCategories)
    })

    it('should return cached categories on subsequent calls', async () => {
      const mockCategories = [{ _id: '1', name: '玄幻' }]

      vi.mocked(browseService.getCategories).mockResolvedValue({
        data: mockCategories
      })

      const store = useMetaStore()

      await store.getCategories()
      await store.getCategories()

      expect(browseService.getCategories).toHaveBeenCalledTimes(1)
    })

    it('should force refresh when force=true', async () => {
      vi.mocked(browseService.getCategories).mockResolvedValue({
        data: [{ _id: '1', name: '玄幻' }]
      })

      const store = useMetaStore()

      await store.getCategories()
      await store.getCategories(true)

      expect(browseService.getCategories).toHaveBeenCalledTimes(2)
    })

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error')
      vi.mocked(browseService.getCategories).mockRejectedValue(mockError)

      const store = useMetaStore()
      const result = await store.getCategories()

      expect(result).toEqual([])
      expect(store.categories).toEqual([])
    })
  })

  describe('getYears', () => {
    it('should fetch years on first call', async () => {
      const mockYears = ['2024', '2023', '2022']

      vi.mocked(browseService.getYears).mockResolvedValue({
        data: mockYears
      })

      const store = useMetaStore()
      const result = await store.getYears()

      expect(browseService.getYears).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockYears)
      expect(store.years).toEqual(mockYears)
    })

    it('should return cached years on subsequent calls', async () => {
      const mockYears = ['2024', '2023']

      vi.mocked(browseService.getYears).mockResolvedValue({
        data: mockYears
      })

      const store = useMetaStore()

      await store.getYears()
      await store.getYears()

      expect(browseService.getYears).toHaveBeenCalledTimes(1)
    })

    it('should force refresh when force=true', async () => {
      vi.mocked(browseService.getYears).mockResolvedValue({
        data: ['2024']
      })

      const store = useMetaStore()

      await store.getYears()
      await store.getYears(true)

      expect(browseService.getYears).toHaveBeenCalledTimes(2)
    })

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error')
      vi.mocked(browseService.getYears).mockRejectedValue(mockError)

      const store = useMetaStore()
      const result = await store.getYears()

      expect(result).toEqual([])
      expect(store.years).toEqual([])
    })
  })

  describe('getTags', () => {
    it('should fetch tags on first call', async () => {
      const mockTags = ['热血', '穿越', '系统']

      vi.mocked(browseService.getTags).mockResolvedValue({
        data: mockTags
      })

      const store = useMetaStore()
      const result = await store.getTags()

      expect(browseService.getTags).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockTags)
      expect(store.tags).toEqual(mockTags)
    })

    it('should pass categoryId to service when provided', async () => {
      vi.mocked(browseService.getTags).mockResolvedValue({
        data: ['玄幻']
      })

      const store = useMetaStore()

      await store.getTags('fantasy-cat')

      expect(browseService.getTags).toHaveBeenCalledWith('fantasy-cat')
    })

    it('should return cached tags on subsequent calls', async () => {
      const mockTags = ['热血', '穿越']

      vi.mocked(browseService.getTags).mockResolvedValue({
        data: mockTags
      })

      const store = useMetaStore()

      await store.getTags()
      await store.getTags()

      expect(browseService.getTags).toHaveBeenCalledTimes(1)
    })

    it('should force refresh when force=true', async () => {
      vi.mocked(browseService.getTags).mockResolvedValue({
        data: ['热血']
      })

      const store = useMetaStore()

      await store.getTags()
      await store.getTags('', true)

      expect(browseService.getTags).toHaveBeenCalledTimes(2)
    })

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error')
      vi.mocked(browseService.getTags).mockRejectedValue(mockError)

      const store = useMetaStore()
      const result = await store.getTags()

      expect(result).toEqual([])
      expect(store.tags).toEqual([])
    })
  })
})
