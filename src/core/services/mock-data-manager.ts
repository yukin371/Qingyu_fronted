/**
 * 统一 Mock 数据管理器
 *
 * 职责：
 * 1. 集中管理所有模块的 Mock 数据
 * 2. 根据请求 URL 返回对应的 Mock 数据
 * 3. 只在测试模式（?test=true）时使用
 * 4. 普通业务模式使用真实 API
 */

import { getBookCoverUrl } from '@/views/demo/mock-images'

// ==================== 类型定义 ====================

export interface MockResponse {
  code: number
  message: string
  data: any
  timestamp?: number
}

interface MockRequestOptions {
  params?: Record<string, any>
}

// ==================== 工具函数 ====================

/**
 * 检测当前是否处于测试模式
 */
export function isInTestMode(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('test') === 'true'
}

/**
 * 模拟网络延迟
 */
function mockDelay(): Promise<void> {
  const delay = 100 + Math.random() * 200
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 创建标准 Mock 响应
 */
function createMockResponse(data: any, code = 200, message = 'success'): MockResponse {
  return {
    code,
    message,
    data,
    timestamp: Date.now()
  }
}

const MOCK_CATEGORY_TREE = [
  {
    _id: 'cat-1',
    name: '科幻',
    slug: 'scifi',
    children: [
      { _id: 'cat-1-1', name: '星际科幻', slug: 'interstellar' },
      { _id: 'cat-1-2', name: '时空穿梭', slug: 'time-travel' }
    ]
  },
  {
    _id: 'cat-2',
    name: '奇幻',
    slug: 'fantasy',
    children: [
      { _id: 'cat-2-1', name: '东方玄幻', slug: 'eastern' },
      { _id: 'cat-2-2', name: '西方奇幻', slug: 'western' }
    ]
  },
  {
    _id: 'cat-3',
    name: '都市',
    slug: 'city',
    children: [
      { _id: 'cat-3-1', name: '都市生活', slug: 'life' },
      { _id: 'cat-3-2', name: '都市异能', slug: 'ability' }
    ]
  },
  {
    _id: 'cat-4',
    name: '仙侠',
    slug: 'xianxia',
    children: [
      { _id: 'cat-4-1', name: '古典仙侠', slug: 'classic' },
      { _id: 'cat-4-2', name: '现代修真', slug: 'modern' }
    ]
  },
  {
    _id: 'cat-5',
    name: '游戏',
    slug: 'game',
    children: [
      { _id: 'cat-5-1', name: '虚拟网游', slug: 'online' },
      { _id: 'cat-5-2', name: '游戏异界', slug: 'isekai' }
    ]
  }
] as const

const MOCK_LEAF_CATEGORIES = MOCK_CATEGORY_TREE.flatMap((item) => item.children)
const MOCK_BOOK_POOL_SIZE = 360
const MOCK_TAG_POOL = [
  '热血', '玄幻', '修仙', '都市', '科幻', '冒险', '机甲', '悬疑', '言情', '治愈'
]

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  'cat-1-1': ['科幻', '机甲', '冒险'],
  'cat-1-2': ['科幻', '悬疑', '冒险'],
  'cat-2-1': ['玄幻', '热血', '冒险'],
  'cat-2-2': ['玄幻', '言情', '冒险'],
  'cat-3-1': ['都市', '治愈', '言情'],
  'cat-3-2': ['都市', '热血', '悬疑'],
  'cat-4-1': ['修仙', '玄幻', '热血'],
  'cat-4-2': ['修仙', '都市', '悬疑'],
  'cat-5-1': ['冒险', '热血', '都市'],
  'cat-5-2': ['冒险', '玄幻', '科幻']
}

// ==================== 书城模块 Mock 数据 ====================

/**
 * 首页数据 Mock
 */
function getHomepageData(): MockResponse {
  return createMockResponse({
    stats: {
      totalBooks: 125680,
      ongoingBooks: 32850,
      totalAuthors: 15620,
      todayUpdate: 2850
    },
    banners: [
      {
        id: 'banner-1',
        title: '2024年度精选作品',
        subtitle: '发现最好的故事',
        image: '/images/banners/banner-1.svg',
        link: '/bookstore/browse?featured=true',
        order: 1
      },
      {
        id: 'banner-2',
        title: '新人作家扶持计划',
        subtitle: '下一个大神就是你',
        image: '/images/banners/banner-2.svg',
        link: '/writer',
        order: 2
      },
      {
        id: 'banner-3',
        title: '阅读挑战活动',
        subtitle: '完成任务赢好礼',
        image: '/images/banners/banner-3.svg',
        link: '/reading-stats',
        order: 3
      }
    ],
    rankings: {
      realtime: generateRankingBooks('realtime'),
      weekly: generateRankingBooks('weekly'),
      monthly: generateRankingBooks('monthly'),
      newbie: generateRankingBooks('newbie')
    },
    recommendedBooks: generateRecommendedBooks(8),
    featuredBooks: generateFeaturedBooks(5),
    categories: generateCategories()
  })
}

/**
 * 公告数据 Mock
 */
function getAnnouncements(): MockResponse {
  return createMockResponse([
    {
      id: 'announce-1',
      content: '青羽书城全新升级，欢迎体验沉浸式阅读！',
      type: 'info',
      priority: 'high',
      createdAt: new Date().toISOString()
    }
  ])
}

// ==================== 书籍数据生成器 ====================

function generateBook(index: number, type: 'recommended' | 'featured' | 'ranking' = 'recommended') {
  const statuses = ['serializing', 'completed', 'paused']
  const titles = [
    '星河骑士', '青羽物语', '剑道独尊', '甜点日记', '赛博侦探社',
    '异界龙骑', '时光信使', '都市仙尊', '网游之神级牧师', '商途无双'
  ]
  const authors = ['猫妖大人', '樱花飘落', '墨客', '糖豆豆', '龙傲天', '时光旅人']
  const title = titles[index % titles.length]
  const category = MOCK_LEAF_CATEGORIES[index % MOCK_LEAF_CATEGORIES.length]
  const categoryTags = CATEGORY_TAG_MAP[category._id] || ['冒险', '热血', '科幻']
  const baseTag = categoryTags[index % categoryTags.length]
  const secondaryTag = categoryTags[(index + 1) % categoryTags.length]
  const extraTag = MOCK_TAG_POOL[index % MOCK_TAG_POOL.length]

  return {
    _id: `book-${index + 1}`,
    id: `book-${index + 1}`,
    title,
    author: authors[index % authors.length],
    authorId: `author-${index + 1}`,
    cover: getBookCoverUrl(`book-${index + 1}`, category.name),
    coverUrl: getBookCoverUrl(`book-${index + 1}`, category.name),
    categoryName: category.name,
    categoryId: category._id,
    status: statuses[index % statuses.length],
    rating: 4 + Math.random(),
    ratingCount: Math.floor(Math.random() * 20000) + 1000,
    viewCount: Math.floor(Math.random() * 500000) + 10000,
    favoriteCount: Math.floor(Math.random() * 10000) + 500,
    wordCount: Math.floor(Math.random() * 1000000) + 50000,
    chapterCount: Math.floor(Math.random() * 300) + 20,
    description: `这是一本关于${title}的精彩故事，讲述了主人公在${category.name}世界中的冒险经历...`,
    tags: [baseTag, secondaryTag, extraTag].filter((tag, idx, arr) => arr.indexOf(tag) === idx),
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

function generateRecommendedBooks(count: number) {
  return Array.from({ length: count }, (_, i) => generateBook(i, 'recommended'))
}

function generateFeaturedBooks(count: number) {
  return Array.from({ length: count }, (_, i) => generateBook(i + 10, 'featured'))
}

function generateRankingBooks(type: string) {
  const books = generateRecommendedBooks(10)
  return books.map((book, index) => ({
    ...book,
    rank: index + 1,
    rankingType: type,
    trend: Math.floor(Math.random() * 100) - 50
  }))
}

function generateCategories() {
  return JSON.parse(JSON.stringify(MOCK_CATEGORY_TREE))
}

function filterAndPaginateBooks(
  source: ReturnType<typeof generateRecommendedBooks>,
  params: Record<string, any>,
  parsedUrl: URL
) {
  const q = String(params.q || params.keyword || parsedUrl.searchParams.get('q') || '').trim().toLowerCase()
  const categoryId = String(
    params.categoryId ||
    params.category ||
    parsedUrl.searchParams.get('categoryId') ||
    parsedUrl.searchParams.get('category') ||
    ''
  ).trim()
  const status = String(params.status || parsedUrl.searchParams.get('status') || '').trim()
  const rawTags = params.tags || parsedUrl.searchParams.get('tags') || []
  const tags = Array.isArray(rawTags)
    ? rawTags.map(String)
    : String(rawTags).split(',').map(t => t.trim()).filter(Boolean)
  const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
  const size = Number(
    params.size ||
    params.pageSize ||
    parsedUrl.searchParams.get('size') ||
    parsedUrl.searchParams.get('pageSize') ||
    12
  )

  const filteredBooks = source.filter((book) => {
    const keywordMatched = !q ||
      book.title.toLowerCase().includes(q) ||
      String(book.author || '').toLowerCase().includes(q)
    const categoryMatched = !categoryId ||
      book.categoryId === categoryId ||
      book.categoryId.startsWith(`${categoryId}-`)
    const statusMatched = !status || book.status === status
    const tagsMatched = tags.length === 0 || tags.every(tag => book.tags.includes(tag))
    return keywordMatched && categoryMatched && statusMatched && tagsMatched
  })

  const start = Math.max(0, (page - 1) * size)
  const list = filteredBooks.slice(start, start + size)

  return {
    list,
    total: filteredBooks.length,
    page,
    size,
    hasNext: start + size < filteredBooks.length
  }
}

// ==================== 创作中心 Mock 数据 ====================

function getWriterProjects(): MockResponse {
  return createMockResponse({
    list: [
      {
        id: 'project-1',
        projectId: 'project-1',
        title: '异界猫娘日常',
        summary: '讲述一只猫娘在异世界的日常生活喵~',
        coverUrl: getBookCoverUrl('project-1', '奇幻'),
        status: 'serializing',
        category: '奇幻',
        tags: ['猫娘', '日常', '治愈'],
        statistics: {
          totalWords: 158000,
          chapterCount: 42,
          lastUpdateAt: new Date().toISOString()
        }
      }
    ],
    total: 1
  })
}

function getWriterRevenueStats(): MockResponse {
  return createMockResponse({
    totalRevenue: 12580.50,
    todayRevenue: 235.80,
    availableBalance: 8650.30,
    totalWithdrawn: 3930.20
  })
}

// ==================== 用户中心 Mock 数据 ====================

function getUserProfile(): MockResponse {
  return createMockResponse({
    _id: 'user-current',
    nickname: '测试用户',
    avatar: '/images/avatars/avatar-demo.svg',
    bio: '这是测试模式下的模拟用户',
    stats: {
      bookCount: 2,
      followerCount: 128,
      followingCount: 56,
      wordCount: 1000000
    }
  })
}

// ==================== 社区模块 Mock 数据 ====================

function getCommunityPosts(): MockResponse {
  return createMockResponse({
    list: [
      {
        _id: 'post-1',
        title: '求推荐好看的科幻小说喵~',
        content: '最近书荒了，有没有什么好看的科幻小说推荐呀？',
        author: {
          _id: 'user-1',
          nickname: '爱丽丝',
          avatar: 'https://picsum.photos/seed/user1/100/100'
        },
        stats: {
          views: 890,
          likes: 56,
          comments: 23
        },
        createdAt: new Date().toISOString()
      }
    ],
    total: 1
  })
}

// ==================== Mock 数据路由 ====================

/**
 * 根据 URL 获取对应的 Mock 数据
 */
export async function getMockDataForRequest(
  url: string | undefined,
  options: MockRequestOptions = {}
): Promise<MockResponse> {
  if (!url) return createMockResponse({})

  console.log('[MockDataManager] 获取 Mock 数据:', url)

  // ==================== 书城模块 ====================

  // 首页数据
  if (url.includes('/bookstore/homepage') || url === '/api/v1/bookstore') {
    return getHomepageData()
  }

  // 公告
  if (url.includes('/announcements')) {
    return getAnnouncements()
  }

  // 榜单
  if (url.includes('/bookstore/rankings/')) {
    const rankingType = url.split('/bookstore/rankings/')[1]?.split('?')[0]
    const normalizedType = ['realtime', 'weekly', 'monthly', 'newbie'].includes(rankingType)
      ? rankingType
      : 'realtime'
    return createMockResponse(generateRankingBooks(normalizedType))
  }

  // 书籍列表
  if (url.includes('/bookstore/books/recommended')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
    const size = Number(params.size || parsedUrl.searchParams.get('size') || 12)
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const start = Math.max(0, (page - 1) * size)
    const list = allBooks.slice(start, start + size)
    return createMockResponse({
      list,
      total: allBooks.length,
      pagination: {
        page,
        pageSize: size,
        total: allBooks.length,
        has_next: start + size < allBooks.length
      }
    })
  }

  if (url.includes('/bookstore/books/featured')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
    const size = Number(params.size || parsedUrl.searchParams.get('size') || 12)
    const allBooks = generateFeaturedBooks(80)
    const start = Math.max(0, (page - 1) * size)
    const list = allBooks.slice(start, start + size)
    return createMockResponse({
      list,
      total: allBooks.length,
      pagination: {
        page,
        pageSize: size,
        total: allBooks.length,
        has_next: start + size < allBooks.length
      }
    })
  }

  if (url.includes('/bookstore/books/search')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const result = filterAndPaginateBooks(allBooks, params, parsedUrl)

    return createMockResponse({
      books: result.list,
      total: result.total,
      page: result.page,
      size: result.size,
      pagination: {
        page: result.page,
        pageSize: result.size,
        total: result.total,
        has_next: result.hasNext
      }
    })
  }

  if (url.includes('/bookstore/books') && !url.includes('/books/')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const result = filterAndPaginateBooks(allBooks, params, parsedUrl)

    return createMockResponse({
      list: result.list,
      total: result.total,
      pagination: {
        page: result.page,
        pageSize: result.size,
        total: result.total,
        has_next: result.hasNext
      }
    })
  }

  // 书籍详情
  if (url.match(/\/bookstore\/books\/[^/]+(\/detail)?$/)) {
    return createMockResponse(generateBook(0))
  }

  // 章节列表
  if (url.includes('/chapters') && url.includes('/books/')) {
    return createMockResponse({
      list: Array.from({ length: 50 }, (_, i) => ({
        _id: `chapter-${i + 1}`,
        chapterNumber: i + 1,
        title: `第${i + 1}章`,
        wordCount: Math.floor(Math.random() * 2000) + 1500,
        isFree: i < 10,
        price: i >= 10 ? Math.floor(Math.random() * 10) + 5 : 0,
        publishTime: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString()
      })),
      total: 50
    })
  }

  // 分类树
  if (url.includes('/categories/tree')) {
    return createMockResponse(generateCategories())
  }

  // 标签列表
  if (url.includes('/bookstore/tags') && !url.includes('/books/tags')) {
    const allBooks = generateRecommendedBooks(MOCK_BOOK_POOL_SIZE)
    const tagCounter = new Map<string, number>()

    for (const book of allBooks) {
      for (const tag of book.tags || []) {
        tagCounter.set(tag, (tagCounter.get(tag) || 0) + 1)
      }
    }

    const tagList = Array.from(tagCounter.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        _id: `tag-${idx + 1}`,
        name,
        count
      }))

    return createMockResponse(tagList)
  }

  // 年份列表
  if (url.includes('/books/years')) {
    const currentYear = new Date().getFullYear()
    return createMockResponse(
      Array.from({ length: 10 }, (_, i) => (currentYear - i).toString())
    )
  }

  // ==================== 创作中心 ====================

  // 写作项目列表
  if (url.includes('/writer/projects')) {
    return getWriterProjects()
  }

  // 收入统计
  if (url.includes('/writer/revenue/stats')) {
    return getWriterRevenueStats()
  }

  // 收入趋势
  if (url.includes('/writer/revenue/trend')) {
    const days = 30
    return createMockResponse(
      Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString(),
        revenue: Math.floor(Math.random() * 500) + 100
      }))
    )
  }

  // 收入来源
  if (url.includes('/writer/revenue/sources')) {
    return createMockResponse([
      { type: 'subscription', label: '订阅收入', amount: 8580 },
      { type: 'tip', label: '打赏收入', amount: 2850 },
      { type: 'ad', label: '广告收入', amount: 1150 }
    ])
  }

  // 章节收入排行
  if (url.includes('/revenue/chapters')) {
    return createMockResponse({
      list: Array.from({ length: 10 }, (_, i) => ({
        id: `chapter-revenue-${i + 1}`,
        chapterTitle: `第${i + 1}章`,
        views: Math.floor(Math.random() * 10000) + 1000,
        revenue: Math.floor(Math.random() * 500) + 100
      })),
      total: 10
    })
  }

  // ==================== 用户中心 ====================

  // 用户信息
  if (url.includes('/user/profile') || url === '/api/v1/user') {
    return getUserProfile()
  }

  // ==================== 社区模块 ====================

  // 帖子列表
  if (url.includes('/community/posts') || url === '/api/v1/community') {
    return getCommunityPosts()
  }

  // ==================== 钱包模块 ====================

  // 钱包余额
  if (url.includes('/wallet') && !url.includes('withdraw')) {
    return createMockResponse({
      balance: 8650.30,
      totalRevenue: 12580.50,
      totalWithdrawn: 3930.20
    })
  }

  // 提现记录
  if (url.includes('/withdraw-requests')) {
    return createMockResponse({
      list: [
        {
          id: 'withdraw-1',
          amount: 1000,
          status: 'completed',
          method: 'alipay',
          createdAt: '2024-01-20T10:30:00Z',
          processedAt: '2024-01-21T14:20:00Z',
          remark: '提现成功'
        },
        {
          id: 'withdraw-2',
          amount: 2000,
          status: 'pending',
          method: 'wechat',
          createdAt: '2024-01-25T09:15:00Z',
          processedAt: null,
          remark: '待审核'
        }
      ],
      total: 2
    })
  }

  // ==================== 默认响应 ====================

  console.warn('[MockDataManager] 未匹配的 URL:', url)
  return createMockResponse({})
}

/**
 * 处理 Mock 数据请求（供 HTTP Service 调用）
 */
export async function handleMockRequest(url: string | undefined, options: MockRequestOptions = {}) {
  await mockDelay()
  return await getMockDataForRequest(url, options)
}

/**
 * Mock 数据管理器配置
 */
export const mockDataManagerConfig = {
  // 是否启用 Mock 数据（自动检测 URL 参数）
  enabled: isInTestMode(),

  // 是否记录所有 Mock 请求
  logRequests: true,

  // 模拟延迟范围（毫秒）
  minDelay: 100,
  maxDelay: 300
}
