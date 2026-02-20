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

// ==================== 内存状态管理（用于数据联动） ====================

/**
 * 待审核项
 */
interface PendingReviewItem {
  reviewId: string
  contentId: string
  contentType: 'chapter' | 'book' | 'comment'
  title: string
  submittedBy: string
  submittedAt: string
  content: string
  projectId?: string
  projectName?: string
  status: 'pending' | 'approved' | 'rejected'
}

/**
 * 已发布章节
 */
interface PublishedChapter {
  _id: string
  chapterNumber: number
  title: string
  wordCount: number
  isFree: boolean
  price: number
  publishTime: string
  stats: { views: number }
}

/**
 * Mock 内存状态
 * 用于实现"作者发布 → 管理员审核 → 读者阅读"的业务闭环
 */
interface MockState {
  pendingReviews: PendingReviewItem[]
  bookChapters: Map<string, PublishedChapter[]>
  reviewCounter: number
}

// 初始化内存状态
const mockState: MockState = {
  pendingReviews: [
    // 预设"云岚纪事"的待审章节
    {
      reviewId: 'review-yljs-4',
      contentId: 'chapter-yljs-4',
      contentType: 'chapter',
      title: '第四章：剑气纵横',
      submittedBy: '云岚作者',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      content: '晨曦微露，云岚峰顶云雾缭绕。林逸盘膝坐于悬崖之上，体内真气流转不息。自上次突破以来，他的修为已臻至筑基后期，距离结丹仅一步之遥...',
      projectId: 'project-yljs-1',
      projectName: '云岚纪事',
      status: 'pending'
    },
    {
      reviewId: 'review-yljs-5',
      contentId: 'chapter-yljs-5',
      contentType: 'chapter',
      title: '第五章：秘境开启',
      submittedBy: '云岚作者',
      submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      content: '掌门召集众弟子于大殿，宣布了一个震惊所有人的消息——青云秘境即将开启！这是每百年才开放一次的上古遗迹...',
      projectId: 'project-yljs-1',
      projectName: '云岚纪事',
      status: 'pending'
    }
  ],
  bookChapters: new Map([
    // 云岚纪事的初始章节（读者端可见）
    ['project-yljs-1', [
      { _id: 'chapter-yljs-1', chapterNumber: 1, title: '第一章：云岚初遇', wordCount: 3200, isFree: true, price: 0, publishTime: '2024-01-15T08:00:00Z', stats: { views: 1520 } },
      { _id: 'chapter-yljs-2', chapterNumber: 2, title: '第二章：入门修行', wordCount: 2800, isFree: true, price: 0, publishTime: '2024-01-18T08:00:00Z', stats: { views: 1230 } },
      { _id: 'chapter-yljs-3', chapterNumber: 3, title: '第三章：突破筑基', wordCount: 3500, isFree: true, price: 0, publishTime: '2024-01-22T08:00:00Z', stats: { views: 980 } }
    ]]
  ]),
  reviewCounter: 6
}

/**
 * 重置 Mock 状态（用于测试）
 */
export function resetMockState(): void {
  mockState.pendingReviews = [
    {
      reviewId: 'review-yljs-4',
      contentId: 'chapter-yljs-4',
      contentType: 'chapter',
      title: '第四章：剑气纵横',
      submittedBy: '云岚作者',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      content: '晨曦微露，云岚峰顶云雾缭绕...',
      projectId: 'project-yljs-1',
      projectName: '云岚纪事',
      status: 'pending'
    }
  ]
  mockState.bookChapters = new Map([
    ['project-yljs-1', [
      { _id: 'chapter-yljs-1', chapterNumber: 1, title: '第一章：云岚初遇', wordCount: 3200, isFree: true, price: 0, publishTime: '2024-01-15T08:00:00Z', stats: { views: 1520 } },
      { _id: 'chapter-yljs-2', chapterNumber: 2, title: '第二章：入门修行', wordCount: 2800, isFree: true, price: 0, publishTime: '2024-01-18T08:00:00Z', stats: { views: 1230 } },
      { _id: 'chapter-yljs-3', chapterNumber: 3, title: '第三章：突破筑基', wordCount: 3500, isFree: true, price: 0, publishTime: '2024-01-22T08:00:00Z', stats: { views: 980 } }
    ]]
  ])
  mockState.reviewCounter = 4
}

/**
 * 获取当前 Mock 状态（用于调试）
 */
export function getMockState(): Readonly<MockState> {
  return mockState
}

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

type MockLeafCategory = {
  _id: string
  name: string
  slug: string
}

const MOCK_LEAF_CATEGORIES: MockLeafCategory[] = MOCK_CATEGORY_TREE.flatMap(
  (item) => item.children as readonly MockLeafCategory[]
)
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

const CATEGORY_TITLE_CORES: Record<string, string[]> = {
  'cat-1-1': ['星河骑士', '深空余烬', '银河哨兵', '天穹舰队', '零号跃迁', '黑域灯塔', '环轨遗民', '远星守望'],
  'cat-1-2': ['逆时旅者', '钟摆尽头', '昨日回声', '时间褶皱', '裂隙档案', '平行归途', '未来备忘录', '因果边界'],
  'cat-2-1': ['剑道独尊', '苍穹道印', '龙渊战歌', '九天神纹', '万象天书', '太古星宫', '灵墟剑主', '云荒圣域'],
  'cat-2-2': ['龙血誓约', '银月王庭', '风暴巫歌', '黎明远征', '圣辉边境', '黑森林秘闻', '群岛法典', '王城余火'],
  'cat-3-1': ['甜点日记', '雨巷旧梦', '烟火人间', '清晨地铁线', '微光咖啡馆', '日落便利店', '城市折页', '慢热心事'],
  'cat-3-2': ['赛博侦探社', '都市仙尊', '夜行异闻录', '霓虹档案局', '零度共振', '超感回路', '异能法则', '城市暗面'],
  'cat-4-1': ['青羽物语', '昆仑问道', '太乙山河', '剑开天门', '浮生道卷', '长生碑录', '灵霄古道', '青冥仙图'],
  'cat-4-2': ['现代修真录', '灵气复苏后', '校园炼气士', '都市问道录', '地铁飞剑客', '公司有剑仙', '晨会御剑术', '高楼渡劫记'],
  'cat-5-1': ['网游之神级牧师', '虚拟王座', '全服公告后', '神域开荒团', '终极副本线', '新手村传奇', '战术指挥官', '排行榜风云'],
  'cat-5-2': ['异界龙骑', '开局降临异界', '游戏异世录', '存档重启后', '王都任务簿', '勇者补完计划', '地下城边疆', '传送门彼岸']
}

const TITLE_SUFFIXES = [
  '黎明协议', '边境迷航', '灰烬纪元', '冰海坐标', '沉默法则',
  '终局序章', '回响之城', '裂隙之外', '最后一站', '雾港来信',
  '逆光远征', '失落航道', '风暴前夜', '白夜备忘', '群星见证'
]

function buildMockBookTitle(index: number, categoryId: string): string {
  const categoryIndex = index % MOCK_LEAF_CATEGORIES.length
  const round = Math.floor(index / MOCK_LEAF_CATEGORIES.length)
  const cores = CATEGORY_TITLE_CORES[categoryId] || ['未知书名']
  const core = cores[round % cores.length]
  const suffix = TITLE_SUFFIXES[(round * 3 + categoryIndex) % TITLE_SUFFIXES.length]

  return `${core}·${suffix}`
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

function generateBook(index: number, _type: 'recommended' | 'featured' | 'ranking' = 'recommended') {
  const statuses = ['serializing', 'completed', 'paused']
  const authors = ['猫妖大人', '樱花飘落', '墨客', '糖豆豆', '龙傲天', '时光旅人']
  const category = MOCK_LEAF_CATEGORIES[index % MOCK_LEAF_CATEGORIES.length]
  const title = buildMockBookTitle(index, category._id)
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
  const yunlanProject = {
    id: 'project-yljs-1',
    projectId: 'project-yljs-1',
    title: '云岚纪事',
    summary: '仙侠长篇，当前已编辑 3 章。',
    coverImage: getBookCoverUrl('project-yljs-1', '仙侠'),
    coverUrl: getBookCoverUrl('project-yljs-1', '仙侠'),
    status: 'serializing',
    category: '仙侠',
    tags: ['仙侠', '成长', '冒险'],
    totalWords: 9800,
    chapterCount: 3,
    lastUpdateTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    statistics: {
      totalWords: 9800,
      chapterCount: 3,
      lastUpdateAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    }
  }

  return createMockResponse({
    projects: [yunlanProject],
    list: [yunlanProject],
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

  // ==================== Admin 管理员模块 ====================

  // 用户管理列表
  if (url.includes('/admin/users') && !url.includes('/users/')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
    const pageSize = Number(params.pageSize || parsedUrl.searchParams.get('pageSize') || 10)
    const keyword = String(params.keyword || parsedUrl.searchParams.get('keyword') || '').toLowerCase()
    const role = String(params.role || parsedUrl.searchParams.get('role') || '')
    const status = String(params.status || parsedUrl.searchParams.get('status') || '')

    // 生成用户列表
    const allUsers = Array.from({ length: 50 }, (_, i) => {
      const roles = ['user', 'author', 'admin']
      const statuses = ['active', 'inactive', 'banned']
      const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '云岚作者', '星辰写手']
      return {
        user_id: `user-${i + 1}`,
        username: `user_${i + 1}`,
        email: `user${i + 1}@example.com`,
        nickname: names[i % names.length],
        role: roles[i % roles.length],
        status: statuses[i % 3],
        email_verified: i % 3 === 0,
        phone_verified: i % 5 === 0,
        avatar: `https://picsum.photos/seed/avatar${i + 1}/100/100`,
        created_at: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        last_login_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    })

    // 筛选
    let filteredUsers = allUsers.filter(user => {
      const keywordMatch = !keyword ||
        user.username.toLowerCase().includes(keyword) ||
        user.nickname.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      const roleMatch = !role || user.role === role
      const statusMatch = !status || user.status === status
      return keywordMatch && roleMatch && statusMatch
    })

    const start = Math.max(0, (page - 1) * pageSize)
    const list = filteredUsers.slice(start, start + pageSize)

    return createMockResponse({
      items: list,
      total: filteredUsers.length,
      page,
      pageSize
    })
  }

  // 待审核内容列表（使用内存状态）
  if (url.includes('/admin/audit/pending')) {
    const parsedUrl = new URL(url, window.location.origin)
    const params = options.params || {}
    const page = Number(params.page || parsedUrl.searchParams.get('page') || 1)
    const pageSize = Number(params.pageSize || parsedUrl.searchParams.get('pageSize') || 20)
    const contentType = String(params.contentType || parsedUrl.searchParams.get('contentType') || '')

    // 从内存状态获取待审核列表
    let filteredReviews = mockState.pendingReviews.filter(r => r.status === 'pending')
    if (contentType) {
      filteredReviews = filteredReviews.filter(r => r.contentType === contentType)
    }

    const start = Math.max(0, (page - 1) * pageSize)
    const list = filteredReviews.slice(start, start + pageSize)

    return createMockResponse({
      items: list,
      total: filteredReviews.length,
      page,
      pageSize
    })
  }

  // 审核统计数据
  if (url.includes('/admin/audit/statistics')) {
    const pending = mockState.pendingReviews.filter(r => r.status === 'pending').length
    return createMockResponse({
      pending,
      approved: 5,
      rejected: 2,
      highRisk: 0
    })
  }

  // 审核内容（批准/拒绝）- 联动核心逻辑
  if (url.includes('/admin/audit/') && url.includes('/review')) {
    const auditId = url.match(/\/admin\/audit\/([^/]+)\/review/)?.[1]
    const body = options.params as { approved?: boolean; reason?: string } | undefined

    if (auditId && body) {
      const reviewIndex = mockState.pendingReviews.findIndex(r => r.reviewId === auditId)

      if (reviewIndex !== -1) {
        const review = mockState.pendingReviews[reviewIndex]

        if (body.approved) {
          // 审核通过：从待审核队列移除，添加到书籍章节列表
          review.status = 'approved'

          if (review.projectId && review.contentType === 'chapter') {
            const chapters = mockState.bookChapters.get(review.projectId) || []
            const newChapterNumber = chapters.length + 1

            chapters.push({
              _id: review.contentId,
              chapterNumber: newChapterNumber,
              title: review.title,
              wordCount: Math.floor(Math.random() * 2000) + 2000,
              isFree: newChapterNumber <= 5,
              price: newChapterNumber > 5 ? 5 : 0,
              publishTime: new Date().toISOString(),
              stats: { views: 0 }
            })

            mockState.bookChapters.set(review.projectId, chapters)
            console.log(`[Mock联动] 审核通过: "${review.title}" 已发布到读者端，章节号: ${newChapterNumber}`)
          }

          // 从待审核队列移除
          mockState.pendingReviews.splice(reviewIndex, 1)
        } else {
          // 审核拒绝：从待审核队列移除
          review.status = 'rejected'
          mockState.pendingReviews.splice(reviewIndex, 1)
          console.log(`[Mock联动] 审核拒绝: "${review.title}"`)
        }
      }
    }

    return createMockResponse({ success: true })
  }

  // ==================== 创作中心联动（发布章节到审核队列） ====================

  // 发布章节 - 写入待审核队列
  if (url.includes('/writer/project/') && url.includes('/publish')) {
    const projectId = url.match(/\/writer\/project\/([^/]+)\/publish/)?.[1]
    const body = options.params as { title?: string; content?: string } | undefined

    if (projectId && body?.title) {
      mockState.reviewCounter++
      const newReview: PendingReviewItem = {
        reviewId: `review-new-${mockState.reviewCounter}`,
        contentId: `chapter-new-${mockState.reviewCounter}`,
        contentType: 'chapter',
        title: body.title,
        submittedBy: '当前作者',
        submittedAt: new Date().toISOString(),
        content: body.content || '章节内容...',
        projectId,
        projectName: '云岚纪事',
        status: 'pending'
      }

      mockState.pendingReviews.unshift(newReview)
      console.log(`[Mock联动] 新章节已提交审核: "${body.title}"`)
    }

    return createMockResponse({
      success: true,
      message: '章节已提交审核，请等待管理员审批'
    })
  }

  // 获取书籍章节列表（读者端）- 使用内存状态
  if (url.includes('/bookstore/books/') && url.includes('/chapters')) {
    const bookId = url.match(/\/bookstore\/books\/([^/]+)\/chapters/)?.[1]

    // 先检查内存状态中是否有该书籍的章节
    if (bookId && mockState.bookChapters.has(bookId)) {
      const chapters = mockState.bookChapters.get(bookId) || []
      console.log(`[Mock联动] 读者端获取章节列表: 书籍 ${bookId}, 共 ${chapters.length} 章`)
      return createMockResponse({
        list: chapters,
        total: chapters.length
      })
    }

    // 默认章节列表
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
