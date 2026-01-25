import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBrowseStore } from '@/modules/bookstore/stores/browse.store'

describe('BrowseStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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
})
