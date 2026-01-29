import { describe, it, expect, vi } from 'vitest'
import { browseService } from '@/modules/bookstore/services/browse.service'
import { httpService } from '@/core/services/http.service'

vi.mock('@/core/services/http.service')

describe('browseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call getBooks with correct params', async () => {
    const mockResponse = {
      data: {
        books: [
          { _id: '1', title: 'Book 1' },
          { _id: '2', title: 'Book 2' }
        ],
        total: 10
      }
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

    const filters = {
      q: '测试',
      categoryId: '',
      year: '',
      status: '',
      tags: [],
      sortBy: 'updateTime',
      page: 1,
      pageSize: 24,
      tagMode: 'and' as const
    }

    const result = await browseService.getBooks(filters)

    expect(httpService.get).toHaveBeenCalledWith('/bookstore/books', {
      params: {
        q: '测试',
        page: 1,
        pageSize: 24,
        sortBy: 'updateTime',
        tagMode: 'and'
      }
    })
    expect(result.data).toEqual(mockResponse.data)
  })

  it('should exclude empty values from params', async () => {
    const mockResponse = {
      data: {
        books: [],
        total: 0
      }
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

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

    await browseService.getBooks(filters)

    expect(httpService.get).toHaveBeenCalledWith('/bookstore/books', {
      params: {
        page: 1,
        pageSize: 24,
        sortBy: 'updateTime',
        tagMode: 'and'
      }
    })
  })

  it('should include tags in params when present', async () => {
    const mockResponse = {
      data: {
        books: [],
        total: 0
      }
    }
    vi.mocked(httpService.get).mockResolvedValue(mockResponse)

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

    await browseService.getBooks(filters)

    const call = vi.mocked(httpService.get).mock.calls[0]
    expect(call[1].params.tags).toEqual(['热血', '穿越'])
  })

  it('should call getCategories', async () => {
    const mockCategories = [
      { _id: '1', name: '玄幻' },
      { _id: '2', name: '都市' }
    ]
    vi.mocked(httpService.get).mockResolvedValue({ data: mockCategories })

    const result = await browseService.getCategories()

    expect(httpService.get).toHaveBeenCalledWith('/bookstore/categories/tree')
    expect(result.data).toEqual(mockCategories)
  })

  it('should call getYears', async () => {
    const mockYears = ['2024', '2023', '2022']
    vi.mocked(httpService.get).mockResolvedValue({ data: mockYears })

    const result = await browseService.getYears()

    expect(httpService.get).toHaveBeenCalledWith('/bookstore/books/years')
    expect(result.data).toEqual(mockYears)
  })

  it('should call getTags', async () => {
    const mockTags = ['热血', '穿越', '系统']
    vi.mocked(httpService.get).mockResolvedValue({ data: mockTags })

    const result = await browseService.getTags('fantasy')

    expect(httpService.get).toHaveBeenCalledWith('/bookstore/tags', { params: { categoryId: 'fantasy' } })
    expect(result.data).toEqual(mockTags)
  })
})
