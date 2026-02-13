/**
 * 业务模块 Mock 数据
 *
 * 用于在 ?test=true 模式下为业务页面提供模拟数据
 * 这些数据模拟真实的 API 响应，用于样式验证和功能测试
 */

// 导入图片配置
import {
  getBookCoverUrl,
  getUserAvatarUrl,
  getBannerUrl,
  BOOK_COVERS,
  USER_AVATARS,
  BANNER_IMAGES,
} from './mock-images'

// ==================== 类型定义 ====================

export interface Book {
  _id: string
  id: string
  title: string
  author: string
  authorId: string
  cover: string
  coverUrl: string
  categoryName: string
  categoryId: string
  status: 'serializing' | 'completed' | 'paused'
  rating: number
  ratingCount: number
  viewCount: number
  favoriteCount: number
  wordCount: number
  chapterCount: number
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  bookId: string
  title: string
  wordCount: number
  isVip: boolean
  price: number
  publishTime: string
}

export interface Comment {
  id: string
  userId: string
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
    level: number
  }
  content: string
  rating: number
  likeCount: number
  replyCount: number
  createdAt: string
}

export interface Project {
  id: string
  projectId: string
  authorId: string
  title: string
  summary: string
  coverUrl: string
  status: 'draft' | 'serializing' | 'completed' | 'suspended'
  category: string
  tags: string[]
  visibility: 'public' | 'private'
  statistics: {
    totalWords: number
    chapterCount: number
    documentCount: number
    lastUpdateAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  authorId: string
  author: {
    id: string
    username: string
    nickname: string
    avatar: string
  }
  title: string
  content: string
  tags: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
}

// ==================== 书城模块数据 ====================

/**
 * 首页 Banner 数据
 */
export const homepageBanners = [
  {
    id: 'banner-1',
    title: '2024年度精选作品',
    subtitle: '发现最好的故事',
    image: BANNER_IMAGES.home.main,
    link: '/bookstore/browse?featured=true',
    order: 1,
  },
  {
    id: 'banner-2',
    title: '新人作家扶持计划',
    subtitle: '下一个大神就是你',
    image: BANNER_IMAGES.home.new,
    link: '/writer',
    order: 2,
  },
  {
    id: 'banner-3',
    title: '阅读挑战活动',
    subtitle: '完成任务赢好礼',
    image: BANNER_IMAGES.home.activity,
    link: '/reading-stats',
    order: 3,
  },
]

/**
 * 首页统计数据
 */
export const homepageStats = {
  totalBooks: 125680,
  ongoingBooks: 32850,
  totalAuthors: 15620,
  todayUpdate: 2850,
}

/**
 * 推荐书籍列表
 */
export const recommendedBooks: Book[] = [
  {
    _id: 'book-1',
    id: 'book-1',
    title: '星河骑士',
    author: '猫妖大人',
    authorId: 'author-1',
    cover: BOOK_COVERS.scifi['星河骑士'] || getBookCoverUrl('book-1', '科幻'),
    coverUrl: BOOK_COVERS.scifi['星河骑士'] || getBookCoverUrl('book-1', '科幻'),
    categoryName: '科幻',
    categoryId: 'cat-1',
    status: 'serializing',
    rating: 4.5,
    ratingCount: 12345,
    viewCount: 568900,
    favoriteCount: 12340,
    wordCount: 580000,
    chapterCount: 156,
    description:
      '在遥远的未来，人类已经征服了星辰大海。一位年轻的骑士，为了寻找失落的星际文明，踏上了一段惊心动魄的冒险旅程...',
    tags: ['科幻', '冒险', '热血', '机甲'],
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-02-08T15:30:00Z',
  },
  {
    _id: 'book-2',
    id: 'book-2',
    title: '青羽物语',
    author: '樱花飘落',
    authorId: 'author-2',
    cover: BOOK_COVERS.fantasy['青羽物语'] || getBookCoverUrl('book-2', '奇幻'),
    coverUrl: BOOK_COVERS.fantasy['青羽物语'] || getBookCoverUrl('book-2', '奇幻'),
    categoryName: '奇幻',
    categoryId: 'cat-2',
    status: 'completed',
    rating: 4.8,
    ratingCount: 23456,
    viewCount: 890120,
    favoriteCount: 34560,
    wordCount: 1200000,
    chapterCount: 365,
    description:
      '一个关于成长、友情和冒险的温馨故事。在青羽大陆上，每个孩子出生时都会获得一片羽毛，这片羽毛将指引他们找到自己的命运...',
    tags: ['奇幻', '治愈', '日常', '冒险'],
    createdAt: '2022-03-20T08:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    _id: 'book-3',
    id: 'book-3',
    title: '剑道独尊',
    author: '墨客',
    authorId: 'author-3',
    cover: BOOK_COVERS.martial['剑道独尊'] || getBookCoverUrl('book-3', '武侠'),
    coverUrl: BOOK_COVERS.martial['剑道独尊'] || getBookCoverUrl('book-3', '武侠'),
    categoryName: '武侠',
    categoryId: 'cat-3',
    status: 'serializing',
    rating: 4.3,
    ratingCount: 8765,
    viewCount: 234500,
    favoriteCount: 8760,
    wordCount: 890000,
    chapterCount: 234,
    description:
      '一把上古神剑，一位落魄少年，一段传奇的冒险之旅。少年剑客林风，为了寻找父母的下落，踏入了波澜壮阔的江湖...',
    tags: ['武侠', '修炼', '热血', '江湖'],
    createdAt: '2023-08-10T14:00:00Z',
    updatedAt: '2024-02-09T10:20:00Z',
  },
  {
    _id: 'book-4',
    id: 'book-4',
    title: '甜点日记',
    author: '糖豆豆',
    authorId: 'author-4',
    cover: BOOK_COVERS.city['甜点日记'] || getBookCoverUrl('book-4', '都市'),
    coverUrl: BOOK_COVERS.city['甜点日记'] || getBookCoverUrl('book-4', '都市'),
    categoryName: '都市',
    categoryId: 'cat-4',
    status: 'serializing',
    rating: 4.6,
    ratingCount: 15678,
    viewCount: 456780,
    favoriteCount: 18900,
    wordCount: 350000,
    chapterCount: 89,
    description:
      '一家温馨的甜品店，一段甜蜜的爱情。都市白领林小雨在偶然的机会下，继承了一家老字号甜品店，从此开始了她全新的人生...',
    tags: ['都市', '甜宠', '美食', '爱情'],
    createdAt: '2023-11-05T16:00:00Z',
    updatedAt: '2024-02-08T18:45:00Z',
  },
]

/**
 * 榜单数据
 */
export const rankings = {
  realtime: recommendedBooks.slice(0, 5),
  weekly: recommendedBooks.slice(1, 6).reverse(),
  monthly: recommendedBooks.slice(0, 5).reverse(),
  newbie: [
    {
      _id: 'book-5',
      id: 'book-5',
      title: '深海秘境',
      author: '海洋之子',
      authorId: 'author-5',
      cover: 'https://picsum.photos/300/400?random=14',
      coverUrl: 'https://picsum.photos/300/400?random=14',
      categoryName: '冒险',
      categoryId: 'cat-5',
      status: 'serializing',
      rating: 4.2,
      ratingCount: 2345,
      viewCount: 67890,
      favoriteCount: 3450,
      wordCount: 670000,
      chapterCount: 78,
      description: '探索深海中的未知世界，发现远古文明的秘密...',
      tags: ['冒险', '探索', '神秘'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-09T14:30:00Z',
    },
  ],
}

/**
 * 书籍章节列表
 */
export const bookChapters: Chapter[] = Array.from({ length: 50 }, (_, i) => ({
  id: `chapter-${i + 1}`,
  bookId: 'book-1',
  title: `第${i + 1}章 ${getChapterTitle(i)}`,
  wordCount: 3000 + Math.floor(Math.random() * 1000),
  isVip: i > 10,
  price: i > 10 ? 5 : 0,
  publishTime: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
}))

function getChapterTitle(index: number): string {
  const titles = [
    '初入江湖',
    '神秘剑客',
    '客栈风波',
    '深夜追击',
    '山洞奇遇',
    '秘籍出世',
    '第一剑',
    '险象环生',
    '绝处逢生',
    '再起波澜',
    '踏入京城',
    '公主招亲',
    '武试开始',
    '一鸣惊人',
    '决赛时刻',
    '真相大白',
    '新的征程',
    '江湖路远',
    '剑道大成',
    '宗师之境',
  ]
  return titles[index % titles.length]
}

// ==================== 创作中心数据 ====================

/**
 * 写作项目列表
 */
export const writerProjects: Project[] = [
  {
    id: 'project-1',
    projectId: 'project-1',
    authorId: 'user-current',
    title: '异界猫娘日常',
    summary: '讲述一只猫娘在异世界的日常生活，轻松、治愈、又带着一点点冒险的故事。',
    coverUrl: BOOK_COVERS.fantasy['异界猫娘日常'] || getBookCoverUrl('project-1', '奇幻'),
    status: 'serializing',
    category: '奇幻',
    tags: ['猫娘', '日常', '治愈', '轻小说'],
    visibility: 'public',
    statistics: {
      totalWords: 158000,
      chapterCount: 42,
      documentCount: 50,
      lastUpdateAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2024-02-09T13:20:00Z',
  },
  {
    id: 'project-2',
    projectId: 'project-2',
    authorId: 'user-current',
    title: '赛博侦探社',
    summary: '在赛博朋克的世界里，一家不起眼的侦探社接手了一个改变世界的案件...',
    coverUrl: BOOK_COVERS.scifi['赛博侦探社'] || getBookCoverUrl('project-2', '科幻'),
    status: 'draft',
    category: '科幻',
    tags: ['赛博朋克', '悬疑', '侦探'],
    visibility: 'private',
    statistics: {
      totalWords: 45000,
      chapterCount: 8,
      documentCount: 15,
      lastUpdateAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-02-08T16:45:00Z',
  },
  {
    id: 'project-3',
    projectId: 'project-3',
    authorId: 'user-current',
    title: '古剑传说',
    summary: '一把上古神剑，一位落魄少年，一段传奇的冒险之旅。',
    coverUrl: BOOK_COVERS.martial['古剑传说'] || getBookCoverUrl('project-3', '武侠'),
    status: 'completed',
    category: '武侠',
    tags: ['武侠', '冒险', '热血'],
    visibility: 'public',
    statistics: {
      totalWords: 520000,
      chapterCount: 156,
      documentCount: 180,
      lastUpdateAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: '2023-02-20T09:00:00Z',
    updatedAt: '2023-12-01T11:30:00Z',
  },
]

// ==================== 社区模块数据 ====================

/**
 * 社区帖子列表
 */
export const communityPosts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    author: {
      id: 'user-1',
      username: 'alice_wonder',
      nickname: '爱丽丝',
      avatar: USER_AVATARS['alice_wonder'] || getUserAvatarUrl('alice'),
    },
    title: '求推荐好看的科幻小说喵~',
    content: '最近书荒了，有没有什么好看的科幻小说推荐呀？最好是那种有独特世界观的，谢谢大家！',
    tags: ['求书', '科幻'],
    likeCount: 56,
    commentCount: 23,
    viewCount: 890,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    author: {
      id: 'user-2',
      username: 'bob_builder',
      nickname: '鲍勃',
      avatar: USER_AVATARS['bob_builder'] || getUserAvatarUrl('bob'),
    },
    title: '分享一下我的写作心得',
    content: '写了三年小说，总结了一些经验，希望对新人作者有帮助。主要关于人物塑造和情节安排...',
    tags: ['写作', '经验分享'],
    likeCount: 234,
    commentCount: 89,
    viewCount: 3456,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    author: {
      id: 'user-3',
      username: 'charlie_chef',
      nickname: '查理大厨',
      avatar: USER_AVATARS['charlie_chef'] || getUserAvatarUrl('charlie'),
    },
    title: '【活动】2024春节创作大赛开始报名啦！',
    content:
      '青羽平台2024年春节创作大赛正式启动！参赛就有机会获得丰厚奖励，欢迎大家踊跃报名参与...',
    tags: ['活动', '创作大赛'],
    likeCount: 567,
    commentCount: 145,
    viewCount: 8900,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

// ==================== 用户中心数据 ====================

/**
 * 用户个人信息
 */
export const userProfile = {
  id: 'user-current',
  username: 'demo_user',
  nickname: '演示用户',
  avatar: USER_AVATARS['demo_user'] || getUserAvatarUrl('demo_user'),
  email: 'demo@example.com',
  level: 5,
  experience: 2580,
  registrationDate: '2023-01-15T10:00:00Z',
  bio: '热爱阅读和写作的文艺青年',
  location: '上海',
  website: 'https://example.com',
}

/**
 * 用户书架
 */
export const userBookshelf = [
  {
    id: 'shelf-1',
    bookId: 'book-1',
    book: recommendedBooks[0],
    lastReadChapterId: 'chapter-50',
    lastReadChapterTitle: '第五十章：星际跃迁',
    progress: 65.5,
    addTime: '2023-12-01T10:00:00Z',
    updateTime: '2024-02-08T15:30:00Z',
  },
  {
    id: 'shelf-2',
    bookId: 'book-2',
    book: recommendedBooks[1],
    lastReadChapterId: 'chapter-120',
    lastReadChapterTitle: '第一百二十章：新的开始',
    progress: 100,
    addTime: '2023-06-15T14:00:00Z',
    updateTime: '2024-01-15T12:00:00Z',
  },
]

/**
 * 用户钱包信息
 */
export const userWallet = {
  userId: 'user-current',
  balance: 18250, // 182.5元
  frozenBalance: 500, // 5元
  totalIncome: 15000, // 150元
  totalExpense: 85000, // 850元
}

// ==================== 导出 ====================

export default {
  // 书城模块
  homepageBanners,
  homepageStats,
  recommendedBooks,
  rankings,
  bookChapters,

  // 创作中心
  writerProjects,

  // 社区模块
  communityPosts,

  // 用户中心
  userProfile,
  userBookshelf,
  userWallet,
}
