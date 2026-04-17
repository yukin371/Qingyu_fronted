import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockRequestUse = vi.fn()

let requestInterceptor:
  | ((config: { headers?: Record<string, string> }) => {
      headers?: Record<string, string>
    })
  | null = null

const createLocalStorageMock = () => {
  const store = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
  }
}

vi.mock('axios', () => {
  mockCreate.mockImplementation(() => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    interceptors: {
      request: {
        use: mockRequestUse.mockImplementation((handler) => {
          requestInterceptor = handler
          return 0
        }),
      },
    },
  }))

  return {
    default: {
      create: mockCreate,
    },
    create: mockCreate,
  }
})

describe('quota admin api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.clear()
    requestInterceptor = null
  })

  it('应该解析仪表板 envelope 数据', async () => {
    const dashboard = {
      summary: {
        totalUsers: 100,
        activeUsers: 80,
        exhaustedUsers: 3,
        nearExhaustUsers: 8,
        suspendedUsers: 2,
        totalConsumption: 2048,
        avgConsumption: 25.6,
      },
      distribution: {
        byRole: { writer: 60, reader: 40 },
        byLevel: { normal: 70, vip_monthly: 30 },
        byService: { chat: 1200, rewrite: 848 },
        byStatus: { active: 80, suspended: 2 },
      },
      topConsumers: [],
      recentAlerts: [],
      trendData: [],
    }
    mockGet.mockResolvedValueOnce({
      data: {
        code: 0,
        message: 'ok',
        data: dashboard,
      },
    })

    const { getQuotaDashboard } = await import('../quota')
    const result = await getQuotaDashboard()

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/dashboard')
    expect(result).toEqual(dashboard)
  })

  it('应该解析分页用户列表数据', async () => {
    const items = [
      {
        userId: 'user-1',
        username: 'alice',
        role: 'writer',
        memberLevel: 'vip_monthly',
        dailyQuota: 10000,
        dailyUsed: 2300,
        usagePercent: 23,
        status: 'active',
      },
    ]
    mockGet.mockResolvedValueOnce({
      data: {
        code: 0,
        message: 'ok',
        data: items,
        total: 12,
        page: 2,
        size: 50,
      },
    })

    const { listQuotaUsers } = await import('../quota')
    const result = await listQuotaUsers({ page: 2, limit: 50, role: 'writer' })

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/users', {
      params: { page: 2, limit: 50, role: 'writer' },
    })
    expect(result).toEqual({
      items,
      total: 12,
      page: 2,
      size: 50,
    })
  })

  it('应该把对象形态的用户详情归一化为数组', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        code: 0,
        message: 'ok',
        data: {
          daily: {
            userId: 'user-1',
            quotaType: 'daily',
            totalQuota: 1000,
            usedQuota: 200,
            remainingQuota: 800,
            status: 'active',
          },
          monthly: {
            userId: 'user-1',
            quotaType: 'monthly',
            totalQuota: 10000,
            usedQuota: 1200,
            remainingQuota: 8800,
            status: 'active',
          },
        },
      },
    })

    const { getQuotaUserDetails } = await import('../quota')
    const result = await getQuotaUserDetails('user-1')

    expect(mockGet).toHaveBeenCalledWith('/admin/quota/users/user-1')
    expect(result).toEqual([
      {
        userId: 'user-1',
        quotaType: 'daily',
        totalQuota: 1000,
        usedQuota: 200,
        remainingQuota: 800,
        status: 'active',
      },
      {
        userId: 'user-1',
        quotaType: 'monthly',
        totalQuota: 10000,
        usedQuota: 1200,
        remainingQuota: 8800,
        status: 'active',
      },
    ])
  })

  it('应该在请求拦截器中注入 bearer token', async () => {
    localStorage.setItem('qingyu_token', JSON.stringify('token-123'))

    await import('../quota')

    expect(requestInterceptor).not.toBeNull()

    const config = { headers: {} as Record<string, string> }
    requestInterceptor?.(config)

    expect(config.headers.Authorization).toBe('Bearer token-123')
  })
})
