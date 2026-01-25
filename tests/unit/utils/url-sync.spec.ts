import { describe, it, expect } from 'vitest'
import { filtersToQuery, queryToFilters } from '@/modules/bookstore/utils/url-sync'

describe('URL Sync Utils', () => {
  describe('filtersToQuery', () => {
    it('should convert empty filters to empty query', () => {
      const filters = {
        q: '',
        categoryId: '',
        year: '',
        status: '',
        tags: [],
        sortBy: 'updateTime',
        page: 1,
        pageSize: 24,
        tagMode: 'and' as const
      }
      
      const query = filtersToQuery(filters)
      expect(Object.keys(query)).toEqual([])
    })

    it('should convert filters with search query', () => {
      const filters = {
        q: '三体',
        categoryId: '',
        year: '',
        status: '',
        tags: [],
        sortBy: 'updateTime',
        page: 1,
        pageSize: 24,
        tagMode: 'and' as const
      }
      
      const query = filtersToQuery(filters)
      expect(query.q).toBe('三体')
    })

    it('should convert filters with tags', () => {
      const filters = {
        q: '',
        categoryId: '',
        year: '',
        status: '',
        tags: ['热血', '穿越'],
        sortBy: 'updateTime',
        page: 1,
        pageSize: 24,
        tagMode: 'and' as const
      }
      
      const query = filtersToQuery(filters)
      expect(query.tags).toEqual(['热血', '穿越'])
    })

    it('should exclude default values', () => {
      const filters = {
        q: '',
        categoryId: '',
        year: '',
        status: '',
        tags: [],
        sortBy: 'updateTime',
        page: 1,
        pageSize: 24,
        tagMode: 'and' as const
      }
      
      const query = filtersToQuery(filters)
      expect(query.sortBy).toBeUndefined()
      expect(query.page).toBeUndefined()
    })
  })

  describe('queryToFilters', () => {
    it('should convert empty query to empty filters', () => {
      const query = {}
      const filters = queryToFilters(query)
      
      expect(Object.keys(filters)).toEqual([])
    })

    it('should convert query with search string', () => {
      const query = { q: '测试' }
      const filters = queryToFilters(query)
      
      expect(filters.q).toBe('测试')
    })

    it('should convert query with tags array', () => {
      const query = { tags: ['热血', '穿越'] }
      const filters = queryToFilters(query)
      
      expect(filters.tags).toEqual(['热血', '穿越'])
    })

    it('should convert query with single tag string', () => {
      const query = { tags: '热血' }
      const filters = queryToFilters(query)
      
      expect(filters.tags).toEqual(['热血'])
    })

    it('should parse page number', () => {
      const query = { page: '5' }
      const filters = queryToFilters(query)
      
      expect(filters.page).toBe(5)
    })
  })
})
