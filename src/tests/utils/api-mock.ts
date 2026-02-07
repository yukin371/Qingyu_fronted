/**
 * API Mock工具
 * 提供API测试的mock辅助函数
 */



/**
 * API响应结构
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

/**
 * 创建一个成功的API响应
 * @param data 响应数据
 */
export const createSuccessResponse = <T>(data: T): ApiResponse<T> => {
  return {
    code: 0,
    message: 'success',
    data,
    timestamp: Date.now(),
  }
}

/**
 * 创建一个失败的API响应
 * @param message 错误消息
 * @param code 错误代码 (默认-1)
 */
export const createErrorResponse = (message: string, code: number = -1): ApiResponse<never> => {
  return {
    code,
    message,
    data: null as any,
    timestamp: Date.now(),
  }
}

/**
 * Mock一个API函数
 * @param responseData 响应数据
 * @param delay 延迟毫秒数 (默认0)
 */
export const mockApiCall = <T>(
  responseData: ApiResponse<T>,
  delay: number = 0
): (() => Promise<ApiResponse<T>>) => {
  return vi.fn(async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    return responseData
  })
}

/**
 * Mock一个成功的API调用
 * @param data 响应数据
 * @param delay 延迟毫秒数 (默认0)
 */
export const mockSuccessApiCall = <T>(
  data: T,
  delay: number = 0
): (() => Promise<T>) => {
  return vi.fn(async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    return data
  })
}

/**
 * Mock一个失败的API调用
 * @param message 错误消息
 * @param code 错误代码 (默认-1)
 * @param delay 延迟毫秒数 (默认0)
 */
export const mockErrorApiCall = (
  message: string,
  code: number = -1,
  delay: number = 0
): (() => Promise<never>) => {
  return vi.fn(async () => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    const error: any = new Error(message)
    error.code = code
    throw error
  })
}

/**
 * Mock HTTP服务
 * @param mockConfig mock配置对象
 */
export const mockHttpService = <T extends Record<string, (...args: any[]) => Promise<any>>>(
  mockConfig: T
): T => {
  const mocked = {} as T

  for (const key in mockConfig) {
    if (typeof mockConfig[key] === 'function') {
      mocked[key] = vi.fn(mockConfig[key])
    } else {
      mocked[key] = mockConfig[key]
    }
  }

  return mocked
}

/**
 * 创建一个分页响应mock
 * @param items 数据项
 * @param total 总数 (可选, 默认items.length)
 * @param page 当前页 (默认1)
 * @param pageSize 每页大小 (默认10)
 */
export const createPaginatedResponse = <T>(
  items: T[],
  total?: number,
  page: number = 1,
  pageSize: number = 10
): { items: T[], total: number, page: number, pageSize: number, totalPages: number } => {
  const actualTotal = total ?? items.length
  const totalPages = Math.ceil(actualTotal / pageSize)

  return {
    items,
    total: actualTotal,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * 验证API调用
 * @param mockFn mock的API函数
 * @param expectedArgs 期望的调用参数
 */
export const expectApiCalledWith = (
  mockFn: ReturnType<typeof vi.fn>,
  ...expectedArgs: any[]
): void => {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs)
}

/**
 * 验证API调用次数
 * @param mockFn mock的API函数
 * @param times 期望调用次数
 */
export const expectApiCalledTimes = (
  mockFn: ReturnType<typeof vi.fn>,
  times: number
): void => {
  expect(mockFn).toHaveBeenCalledTimes(times)
}

/**
 * Mock路由器
 */
export const mockRouter = () => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  beforeEach: vi.fn(),
  beforeResolve: vi.fn(),
  afterEach: vi.fn(),
  resolve: vi.fn(() => ({ href: '/' })),
  addRoute: vi.fn(),
  removeRoute: vi.fn(),
  hasRoute: vi.fn(),
  getRoutes: vi.fn(() => []),
  getCurrentRoute: vi.fn(() => ({ path: '/' })),
  isReady: vi.fn(() => Promise.resolve()),
})

/**
 * Mock路由
 */
export const mockRoute = (overrides: Partial<any> = {}) => ({
  path: '/',
  name: undefined,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
  ...overrides,
})
