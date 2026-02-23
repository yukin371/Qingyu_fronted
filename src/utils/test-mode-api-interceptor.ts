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
 *
 * 支持的模块：
 * - 书城模块 (/bookstore, /books)
 * - 创作中心 (/writer, 包括文档/角色/地点/时间线/导出/发布)
 * - 用户中心 (/account, /user)
 * - 社区模块 (/community)
 */

import businessMockData from '@/views/demo/business-mock-data'

/**
 * Writer模块API规则配置
 * 用于匹配和处理Writer模块的API请求
 */
const writerApiRules = [
  { pattern: /\/writer\/projects\/[\w-]+\/documents\/tree/, handler: 'documentTree' },
  { pattern: /\/writer\/projects\/[\w-]+\/documents\/[\w-]+/, handler: 'documentDetail' },
  { pattern: /\/writer\/projects\/[\w-]+\/documents/, handler: 'document' },
  { pattern: /\/writer\/projects\/[\w-]+\/characters\/[\w-]+\/relations/, handler: 'characterRelations' },
  { pattern: /\/writer\/projects\/[\w-]+\/characters\/[\w-]+/, handler: 'characterDetail' },
  { pattern: /\/writer\/projects\/[\w-]+\/characters/, handler: 'character' },
  { pattern: /\/writer\/projects\/[\w-]+\/locations\/[\w-]+/, handler: 'locationDetail' },
  { pattern: /\/writer\/projects\/[\w-]+\/locations/, handler: 'location' },
  { pattern: /\/writer\/projects\/[\w-]+\/timelines\/[\w-]+\/events/, handler: 'timelineEvents' },
  { pattern: /\/writer\/projects\/[\w-]+\/timelines\/[\w-]+/, handler: 'timelineDetail' },
  { pattern: /\/writer\/projects\/[\w-]+\/timelines/, handler: 'timeline' },
  { pattern: /\/writer\/projects\/[\w-]+\/publish\/history/, handler: 'publishHistory' },
  { pattern: /\/writer\/projects\/[\w-]+\/documents\/[\w-]+\/publish/, handler: 'publishDocument' },
  { pattern: /\/writer\/projects\/[\w-]+\/publish/, handler: 'publishProject' },
  { pattern: /\/writer\/exports\/[\w-]+/, handler: 'exportStatus' },
  { pattern: /\/writer\/exports/, handler: 'export' },
]

/**
 * Mock ID生成器
 */
const generateMockId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 生成ISO日期字符串
 */
const generateDate = (offsetDays: number = 0): string => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString()
}

/**
 * Writer模块Mock数据生成器
 */
const writerMockGenerator = {
  document: () => ({
    id: generateMockId('doc'),
    documentId: generateMockId('doc'),
    projectId: 'test-project',
    title: '测试文档',
    type: 'chapter',
    level: 0,
    order: 0,
    status: 'writing',
    wordCount: Math.floor(Math.random() * 5000) + 100,
    characterIds: [],
    locationIds: [],
    timelineIds: [],
    tags: ['测试'],
    createdAt: generateDate(-7),
    updatedAt: generateDate(-1),
  }),

  documentTree: () => ({
    id: generateMockId('volume'),
    documentId: generateMockId('volume'),
    projectId: 'test-project',
    parentId: null,
    title: '第一卷',
    type: 'volume',
    level: 0,
    order: 0,
    status: 'writing',
    wordCount: 0,
    children: [
      {
        id: generateMockId('chapter'),
        documentId: generateMockId('chapter'),
        projectId: 'test-project',
        parentId: null,
        title: '第一章：启程',
        type: 'chapter',
        level: 1,
        order: 0,
        status: 'published',
        wordCount: 3500,
        children: [],
        createdAt: generateDate(-5),
        updatedAt: generateDate(-1),
      },
      {
        id: generateMockId('chapter'),
        documentId: generateMockId('chapter'),
        projectId: 'test-project',
        parentId: null,
        title: '第二章：遭遇',
        type: 'chapter',
        level: 1,
        order: 1,
        status: 'writing',
        wordCount: 2100,
        children: [],
        createdAt: generateDate(-3),
        updatedAt: generateDate(0),
      },
    ],
    createdAt: generateDate(-10),
    updatedAt: generateDate(0),
  }),

  character: () => ({
    id: generateMockId('char'),
    projectId: 'test-project',
    name: '主角',
    alias: ['别名1'],
    summary: '这是故事的主角',
    traits: ['勇敢', '聪明'],
    background: '角色的背景故事...',
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: generateDate(-10),
    updatedAt: generateDate(-2),
  }),

  location: () => ({
    id: generateMockId('loc'),
    projectId: 'test-project',
    name: '神秘森林',
    description: '故事发生的主要地点',
    climate: '温带气候',
    culture: '东方文化',
    geography: '森林地形',
    atmosphere: '神秘莫测',
    imageUrl: 'https://example.com/location.png',
    createdAt: generateDate(-8),
    updatedAt: generateDate(-3),
  }),

  timeline: () => ({
    id: generateMockId('timeline'),
    projectId: 'test-project',
    name: '主线时间',
    description: '故事主线的时间线',
    startTime: { year: 2024, month: 1, day: 1, era: '新历' },
    endTime: { year: 2024, month: 12, day: 31 },
    createdAt: generateDate(-15),
    updatedAt: generateDate(-5),
  }),

  exportTask: () => ({
    id: generateMockId('export'),
    type: 'document',
    resourceId: generateMockId('doc'),
    resourceTitle: '导出文档',
    format: 'docx',
    status: 'completed',
    progress: 100,
    fileSize: Math.floor(Math.random() * 1000000) + 10000,
    fileUrl: 'https://example.com/download/export.docx',
    expiresAt: generateDate(7),
    createdBy: 'test-user',
    createdAt: generateDate(-1),
    updatedAt: generateDate(-1),
    completedAt: generateDate(-1),
  }),

  publishPlan: () => ({
    id: generateMockId('plan'),
    projectId: 'test-project',
    name: '发布计划',
    description: '这是一个发布计划',
    status: 'published',
    documentIds: [generateMockId('doc')],
    scheduledAt: generateDate(7),
    publishedAt: generateDate(0),
    createdAt: generateDate(-3),
    updatedAt: generateDate(0),
  }),
}

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
    // bookId is extracted but not used in this mock response
    // const bookId = pathname.split('/').slice(-2, -1)[0]
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
    const rankings = businessMockData.rankings as Record<string, unknown[]>
    return {
      code: 200,
      message: 'success',
      data: rankings[type] || rankings.realtime
    }
  }
  
  return { code: 200, message: 'success', data: {} }
}

/**
 * 处理创作中心 API
 * 支持完整的Writer模块API Mock
 */
function handleWriterApi(pathname: string, searchParams: URLSearchParams): any {
  // 使用规则匹配器处理请求
  for (const rule of writerApiRules) {
    if (rule.pattern.test(pathname)) {
      return handleWriterApiByRule(rule.handler, pathname, searchParams)
    }
  }

  // 项目列表（默认）
  if (pathname.includes('/projects') && !pathname.includes('/documents') &&
      !pathname.includes('/characters') && !pathname.includes('/locations') &&
      !pathname.includes('/timelines') && !pathname.includes('/publish')) {
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
 * 根据规则处理器处理Writer API请求
 */
function handleWriterApiByRule(handler: string, pathname: string, _searchParams: URLSearchParams): any {
  const successResponse = (data: unknown) => ({
    code: 200,
    message: 'success',
    data
  })

  switch (handler) {
    case 'documentTree':
      return successResponse(writerMockGenerator.documentTree())

    case 'documentDetail': {
      const doc = writerMockGenerator.document()
      return successResponse(doc)
    }

    case 'document': {
      const docs = Array.from({ length: 5 }, () => writerMockGenerator.document())
      return successResponse({
        items: docs,
        total: docs.length,
        page: 1,
        pageSize: 10
      })
    }

    case 'characterDetail': {
      const char = writerMockGenerator.character()
      return successResponse(char)
    }

    case 'characterRelations': {
      const relations = [
        { id: generateMockId('rel'), fromId: 'char_1', toId: 'char_2', type: '朋友', strength: 80 },
        { id: generateMockId('rel'), fromId: 'char_1', toId: 'char_3', type: '对手', strength: 60 }
      ]
      return successResponse(relations)
    }

    case 'character': {
      const chars = Array.from({ length: 5 }, () => writerMockGenerator.character())
      return successResponse({
        items: chars,
        total: chars.length
      })
    }

    case 'locationDetail': {
      const loc = writerMockGenerator.location()
      return successResponse(loc)
    }

    case 'location': {
      const locs = Array.from({ length: 5 }, () => writerMockGenerator.location())
      return successResponse({
        items: locs,
        total: locs.length
      })
    }

    case 'timelineEvents': {
      const events = Array.from({ length: 3 }, () => ({
        id: generateMockId('event'),
        title: '故事事件',
        description: '事件描述',
        storyTime: { year: 2024, month: 6, day: 15 },
        importance: Math.floor(Math.random() * 10) + 1
      }))
      return successResponse(events)
    }

    case 'timelineDetail': {
      const timeline = writerMockGenerator.timeline()
      return successResponse(timeline)
    }

    case 'timeline': {
      const timelines = Array.from({ length: 3 }, () => writerMockGenerator.timeline())
      return successResponse({
        items: timelines,
        total: timelines.length
      })
    }

    case 'exportStatus': {
      const task = writerMockGenerator.exportTask()
      return successResponse(task)
    }

    case 'export': {
      const tasks = Array.from({ length: 3 }, () => writerMockGenerator.exportTask())
      return successResponse({
        items: tasks,
        total: tasks.length
      })
    }

    case 'publishDocument': {
      const doc = writerMockGenerator.document()
      doc.status = 'published'
      return successResponse(doc)
    }

    case 'publishProject': {
      const plan = writerMockGenerator.publishPlan()
      plan.status = 'published'
      return successResponse(plan)
    }

    case 'publishHistory': {
      const plans = Array.from({ length: 3 }, () => writerMockGenerator.publishPlan())
      return successResponse(plans)
    }

    default:
      return { code: 200, message: 'success', data: {} }
  }
}

/**
 * 处理用户中心 API
 */
function handleUserApi(pathname: string, _searchParams: URLSearchParams): unknown {
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
function createMockResponse(data: unknown): Response {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

  return new Response(blob, {
    status: 200,
    statusText: 'OK',
    headers: new Headers({
      'content-type': 'application/json'
    })
  })
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
