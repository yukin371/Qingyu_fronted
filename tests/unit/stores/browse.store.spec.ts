import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useBrowseStore } from '@/modules/bookstore/stores/browse.store'
import { browseService } from '@/modules/bookstore/services/browse.service'

vi.mock('@/modules/bookstore/services/browse.service')

describe('BrowseStore', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    setActivePinia(createPinia())

    // 创建路由实例（用于 URL 同步测试）
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/bookstore/browse',
          name: 'browse',
          component: { template: '<div></div>' }
        }
      ]
    })

    vi.clearAllMocks()
  })

  it('should initialize with default filters', () => {
    const store = useBrowseStore()
    
    expect(store.filters.q).toBe('')
    expect(store.filters.categoryId).toBe('')
    expect(store.filters.tags).toEqual([])
    expect(store.filters.page).toBe(1)
  })

  it('should update filters', () => {
    const store = useBrowseStore()
    
    store.updateFilters({ q: '测试', categoryId: 'fantasy' })
    
    expect(store.filters.q).toBe('测试')
    expect(store.filters.categoryId).toBe('fantasy')
  })

  it('should reset page when updating non-page filters', () => {
    const store = useBrowseStore()
    
    store.filters.page = 5
    store.updateFilters({ q: '测试' })
    
    expect(store.filters.page).toBe(1)
  })

  it('should reset all filters', () => {
    const store = useBrowseStore()
    
    store.updateFilters({ 
      q: '测试',
      categoryId: 'fantasy',
      tags: ['热血']
    })
    
    store.resetFilters()
    
    expect(store.filters.q).toBe('')
    expect(store.filters.categoryId).toBe('')
    expect(store.filters.tags).toEqual([])
  })

  it('should detect active filters', () => {
    const store = useBrowseStore()

    expect(store.hasActiveFilters).toBe(false)

    store.updateFilters({ q: '测试' })

    expect(store.hasActiveFilters).toBe(true)
  })

  describe('fetchBooks', () => {
    it('should fetch books successfully', async () => {
      const mockBooks = [
        { _id: '1', title: 'Book 1', cover: '', author: 'Author 1', status: 'serializing', tags: [] },
        { _id: '2', title: 'Book 2', cover: '', author: 'Author 2', status: 'completed', tags: [] }
      ]

      vi.mocked(browseService.getBooks).mockResolvedValue({
        code: 200,
        data: {
          books: mockBooks,
          total: 10
        }
      })

      const store = useBrowseStore()

      await store.fetchBooks()

      expect(store.books).toEqual(mockBooks)
      expect(store.pagination.total).toBe(10)
      expect(store.pagination.hasMore).toBe(false) // 10 < 24 (pageSize)
      expect(store.loading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should set loading state during fetch', async () => {
      vi.mocked(browseService.getBooks).mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => {
            resolve({
              code: 200,
              data: { books: [], total: 0 }
            })
          }, 100)
        })
      )

      const store = useBrowseStore()

      const fetchPromise = store.fetchBooks()
      expect(store.loading).toBe(true)

      await fetchPromise
      expect(store.loading).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error')
      vi.mocked(browseService.getBooks).mockRejectedValue(mockError)

      const store = useBrowseStore()

      await store.fetchBooks()

      expect(store.books).toEqual([])
      expect(store.error).toEqual(mockError)
      expect(store.loading).toBe(false)
    })

    it('should pass current filters to service', async () => {
      vi.mocked(browseService.getBooks).mockResolvedValue({
        code: 200,
        data: { books: [], total: 0 }
      })

      const store = useBrowseStore()
      store.filters.q = 'test query'
      store.filters.categoryId = 'cat123'

      await store.fetchBooks()

      expect(browseService.getBooks).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'test query',
          categoryId: 'cat123'
        })
      )
    })

    it('should calculate hasMore correctly', async () => {
      const store = useBrowseStore()

      // Case 1: total <= pageSize * page (no more)
      vi.mocked(browseService.getBooks).mockResolvedValue({
        code: 200,
        data: { books: [], total: 24 }
      })
      await store.fetchBooks()
      expect(store.pagination.hasMore).toBe(false)

      // Case 2: total > pageSize * page (has more)
      vi.mocked(browseService.getBooks).mockResolvedValue({
        code: 200,
        data: { books: [], total: 30 }
      })
      await store.fetchBooks()
      expect(store.pagination.hasMore).toBe(true)
    })

    it('should clear error on successful fetch', async () => {
      const store = useBrowseStore()
      store.error = new Error('Previous error')

      vi.mocked(browseService.getBooks).mockResolvedValue({
        code: 200,
        data: { books: [], total: 0 }
      })

      await store.fetchBooks()

      expect(store.error).toBe(null)
    })
  })
})
