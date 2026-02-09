/**
 * 测试模式 API 拦截器
 * 
 * 在 ?test=true 模式下拦截所有 API 请求并返回 Mock 数据
 * 确保开发和测试过程中不依赖后端服务
 * 
 * 功能：
 * 1. 拦截 axios 和 fetch 请求
 * 2. 检测 URL 中的 test 参数
 * 3. 返回对应的 mock 数据
 * 4. 模拟真实的 API 响应格式
 */

import businessMockData from '@/views/demo/business-mock-data'

// 是否启用测试模式
let isTestMode = false

// API 拦截器存储
let axiosInterceptor: number | null = null
let originalFetch: typeof fetch | null = null

/**
 * 初始化测试模式 API 拦截器
 */
export function initTestModeApiInterceptor() {
  checkTestMode()
  
  // 监听 URL 变化
  window.addEventListener('popstate', checkTestMode)
  
  // 监听 pushState 和 replaceState
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState
  
  history.pushState = function(...args) {
    originalPushState.apply(this, args)
    checkTestMode()
  }
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args)
    checkTestMode()
  }
  
  // 初始检查
  checkTestMode()
}

/**
 * 检查当前是否处于测试模式
 */
function checkTestMode() {
  const url = new URL(window.location.href)
  const wasTestMode = isTestMode
  isTestMode = url.searchParams.get('test') === 'true'
  
  // 测试模式状态变化时更新拦截器
  if (wasTestMode !== isTestMode) {
    if (isTestMode) {
      enableInterceptors()
      console.log('[TestMode API] 测试模式已启用，API 请求将被拦截')
    } else {
      disableInterceptors()
      console.log('[TestMode API] 测试模式已禁用，恢复正常 API')
    }
  }
}

/**
 * 启用拦截器
 */
function enableInterceptors() {
  // 拦截 fetch
  if (!originalFetch) {
    originalFetch = window.fetch
    window.fetch = testModeFetch as any
  }
  
  // 拦截 axios（如果存在）
  if (typeof window !== 'undefined' && (window as any).axios) {
    const axios = (window as any).axios
    if (axios && axios.interceptors) {
      axiosInterceptor = axios.interceptors.request.use(
        (config: any) => {
          const url = config.url || ''
          if (shouldInterceptRequest(url)) {
            return handleMockRequest(config)
          }
          return config
        },
        (error: any) => Promise.reject(error)
      )
    }
  }
}

/**
 * 禁用拦截器
 */
function disableInterceptors() {
  // 恢复 fetch
  if (originalFetch) {
    window.fetch = originalFetch
    originalFetch = null
  }
  
  // 移除 axios 拦截器
  if (axiosInterceptor !== null) {
    const axios = (window as any).axios
    if (axios && axios.interceptors) {
      axios.interceptors.request.eject(axiosInterceptor)
    }
    axiosInterceptor = null
  }
}

/**
 * 判断是否应该拦截请求
 */
function shouldInterceptRequest(url: string): boolean {
  if (!isTestMode) return false
  
  // 只拦截 API 请求
  return url.startsWith('/api/') || url.includes('/api/v1/')
}

/**
 * 测试模式 fetch 拦截器
 */
async function testModeFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  
  if (shouldInterceptRequest(url)) {
    console.log('[TestMode API] 拦截 fetch 请求:', url)
    const mockData = getMockDataForUrl(url)
    
    // 模拟网络延迟
    await delay(100 + Math.random() * 200)
    
    // 返回模拟响应
    return createMockResponse(mockData)
  }
  
  // 非测试模式或非 API 请求，使用原始 fetch
  return originalFetch!(input, init)
}

/**
 * 处理 mock 请求（axios）
 */
async function handleMockRequest(config: any) {
  const url = config.url || ''
  console.log('[TestMode API] 拦截 axios 请求:', url)
  
  const mockData = getMockDataForUrl(url)
  
  // 模拟网络延迟
  await delay(100 + Math.random() * 200)
  
  // 返回模拟响应
  return {
    data: mockData,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
  }
}

/**
 * 根据 URL 获取对应的 mock 数据
 */
function getMockDataForUrl(url: string): any {
  // 解析 URL
  const urlObj = new URL(url, window.location.origin)
  const pathname = urlObj.pathname
  const searchParams = urlObj.searchParams
  
  console.log('[TestMode API] 获取 Mock 数据:', pathname, searchParams.toString())
  
  // 书城模块
  if (pathname.includes('/bookstore')) {
    return handleBookstoreApi(pathname, searchParams)
  }
  
  // 创作中心
  if (pathname.includes('/writer')) {
    return handleWriterApi(pathname, searchParams)
  }
  
  // 用户中心
  if (pathname.includes('/account') || pathname.includes('/user')) {
    return handleUserApi(pathname, searchParams)
  }
  
  // 社区模块
  if (pathname.includes('/community')) {
    return handleCommunityApi(pathname, searchParams)
  }
  
  // 默认返回空数据
  return { code: 200, message: 'success', data: {} }
}

/**
 * 处理书城模块 API
 */
function handleBookstoreApi(pathname: string, searchParams: URLSearchParams): any {
  // 首页数据
  if (pathname === '/api/v1/bookstore/home' || pathname === '/api/v1/home') {
    return {
      code: 200,
      message: 'success',
      data: {
        banners: businessMockData.homepageBanners,
        stats: businessMockData.homepageStats,
        recommended: businessMockData.recommendedBooks.slice(0, 8),
        rankings: businessMockData.rankings
      }
    }
  }
  
  // 书籍列表
  if (pathname.includes('/books')) {
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: businessMockData.recommendedBooks.slice(0, pageSize),
        total: businessMockData.recommendedBooks.length,
        page,
        pageSize,
        hasMore: page * pageSize < businessMockData.recommendedBooks.length
      }
    }
  }
  
  // 书籍详情
  if (pathname.includes('/book/') && !pathname.includes('/stats')) {
    const bookId = pathname.split('/').pop()
    const book = businessMockData.recommendedBooks.find(b => b.id === bookId) || businessMockData.recommendedBooks[0]
    
    return {
      code: 200,
      message: 'success',
      data: {
        ...book,
        chapters: businessMockData.bookChapters.slice(0, 10)
      }
    }
  }
  
  // 章节列表
  if (pathname.includes('/chapters')) {
    const bookId = pathname.split('/').slice(-2, -1)[0]
    const page = parseInt(searchParams.get('page') || '1')
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: businessMockData.bookChapters.slice(0, 20),
        total: businessMockData.bookChapters.length,
        page,
        pageSize: 20
      }
    }
  }
  
  // 榜单
  if (pathname.includes('/rankings')) {
    const type = searchParams.get('type') || 'realtime'
    return {
      code: 200,
      message: 'success',
      data: businessMockData.rankings[type] || businessMockData.rankings.realtime
    }
  }
  
  return { code: 200, message: 'success', data: {} }
}

/**
 * 处理创作中心 API
 */
function handleWriterApi(pathname: string, searchParams: URLSearchParams): any {
  // 项目列表
  if (pathname.includes('/projects') || pathname.includes('/books')) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: businessMockData.writerProjects,
        total: businessMockData.writerProjects.length
      }
    }
  }
  
  // 项目详情
  if (pathname.includes('/stats') || pathname.includes('/detail')) {
    // 处理统计数据请求
    if (pathname.includes('reader-activity')) {
      return {
        code: 200,
        message: 'success',
        data: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 100) + 20
          }))
        }
      }
    }
    
    if (pathname.includes('reading-heatmap')) {
      return {
        code: 200,
        message: 'success',
        data: {
          heatmap: Array.from({ length: 7 }, () => 
            Array.from({ length: 24 }, () => Math.floor(Math.random() * 50))
          )
        }
      }
    }
    
    if (pathname.includes('subscribers')) {
      const days = parseInt(searchParams.get('days') || '30')
      return {
        code: 200,
        message: 'success',
        data: {
          subscribers: Array.from({ length: days }, (_, i) => ({
            date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 20) + 5
          }))
        }
      }
    }
    
    // 默认项目数据
    const project = businessMockData.writerProjects[0]
    return {
      code: 200,
      message: 'success',
      data: {
        project,
        stats: {
          readerActivity: { daily: [] },
          readingHeatmap: { heatmap: [] },
          subscribers: { subscribers: [] }
        }
      }
    }
  }
  
  return { code: 200, message: 'success', data: {} }
}

/**
 * 处理用户中心 API
 */
function handleUserApi(pathname: string, searchParams: URLSearchParams): any {
  // 个人信息
  if (pathname.includes('/profile')) {
    return {
      code: 200,
      message: 'success',
      data: businessMockData.userProfile
    }
  }
  
  // 书架
  if (pathname.includes('/bookshelf')) {
    return {
      code: 200,
      message: 'success',
      data: businessMockData.userBookshelf
    }
  }
  
  // 钱包
  if (pathname.includes('/wallet')) {
    return {
      code: 200,
      message: 'success',
      data: businessMockData.userWallet
    }
  }
  
  return { code: 200, message: 'success', data: {} }
}

/**
 * 处理社区模块 API
 */
function handleCommunityApi(pathname: string, searchParams: URLSearchParams): any {
  // 帖子列表
  if (pathname.includes('/posts')) {
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: businessMockData.communityPosts,
        total: businessMockData.communityPosts.length,
        page,
        pageSize,
        hasMore: false
      }
    }
  }
  
  return { code: 200, message: 'success', data: {} }
}

/**
 * 创建模拟响应
 */
function createMockResponse(data: any): Response {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'content-type': 'application/json'
    }),
    url: window.location.href,
    cloned: function() { return createMockResponse(data) },
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => blob,
    arrayBuffer: async () => await blob.arrayBuffer()
  } as Response
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 导出测试模式状态
 */
export function getIsTestMode(): boolean {
  return isTestMode
}

/**
 * 手动设置测试模式
 */
export function setIsTestMode(enabled: boolean): void {
  isTestMode = enabled
  if (enabled) {
    enableInterceptors()
  } else {
    disableInterceptors()
  }
}

// 导出初始化函数
export default initTestModeApiInterceptor
