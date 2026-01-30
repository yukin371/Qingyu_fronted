import { describe, it, expect, vi } from 'vitest'
import { getRatingStats, getUserRating, submitRating } from '../rating'

// Mock request模块
vi.mock('@/modules/social/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('评分服务', () => {
  it('应该获取评分统计', async () => {
    const mockStats = {
      targetType: 'book',
      targetId: 'book-123',
      averageRating: 4.5,
      totalRatings: 100,
      distribution: {
        1: 5,
        2: 10,
        3: 15,
        4: 30,
        5: 40
      }
    }

    const request = (await import('@/modules/social/api/request')).default
    vi.mocked(request.get).mockResolvedValue(mockStats)

    const stats = await getRatingStats('book', 'book-123')
    expect(stats).toBeDefined()
    expect(stats.averageRating).toBeGreaterThanOrEqual(0)
    expect(stats.totalRatings).toBeGreaterThanOrEqual(0)
  })

  it('应该获取用户评分', async () => {
    const mockUserRating = {
      targetType: 'book',
      targetId: 'book-123',
      rating: 5,
      createdAt: '2026-01-30T00:00:00Z'
    }

    const request = (await import('@/modules/social/api/request')).default
    vi.mocked(request.get).mockResolvedValue(mockUserRating)

    const rating = await getUserRating('book', 'book-123')
    expect(rating).toBeDefined()
  })

  it('应该提交评分', async () => {
    const request = (await import('@/modules/social/api/request')).default
    vi.mocked(request.post).mockResolvedValue({ success: true })

    await submitRating('book', 'book-123', 5)
    expect(request.post).toHaveBeenCalled()
  })
})
