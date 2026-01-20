/**
 * Test Data Helper
 * 提供测试所需的模拟数据
 */

import { ActorRole, UserCredentials } from './actor-factory'

/**
 * 用户测试数据
 */
export const testUsers = {
  guest: {
    username: 'guest_user',
    email: 'guest@example.com',
    password: 'Guest123456'
  },
  reader: {
    username: 'test_reader',
    email: 'reader@example.com',
    password: 'Reader123456',
    role: ActorRole.READER
  },
  author: {
    username: 'test_author',
    email: 'author@example.com',
    password: 'Author123456',
    role: ActorRole.AUTHOR
  },
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin123456',
    role: ActorRole.ADMIN
  },
  vipMember: {
    username: 'vip_member',
    email: 'vip@example.com',
    password: 'Vip123456',
    role: ActorRole.VIP_MEMBER
  }
} as const

/**
 * 书籍测试数据
 */
export const testBooks = {
  novel: {
    id: 'test-book-001',
    title: '测试小说',
    author: '测试作者',
    introduction: '这是一本测试小说的简介',
    cover: 'https://example.com/covers/novel.jpg',
    categoryIds: ['cat-001'],
    categories: ['玄幻'],
    tags: ['修仙', '爽文'],
    status: 'serializing',
    wordCount: 100000,
    chapterCount: 50,
    price: 0,
    isFree: true,
    isRecommended: true,
    isFeatured: false,
    isHot: true
  },
  completedBook: {
    id: 'test-book-002',
    title: '已完结书籍',
    author: '著名作者',
    introduction: '这是一本已经完结的小说',
    cover: 'https://example.com/covers/completed.jpg',
    categoryIds: ['cat-002'],
    categories: ['都市'],
    tags: ['商战', '情感'],
    status: 'completed',
    wordCount: 500000,
    chapterCount: 200,
    price: 100,
    isFree: false,
    isRecommended: true,
    isFeatured: true,
    isHot: true
  },
  freeBook: {
    id: 'test-book-003',
    title: '免费书籍',
    author: '新人作者',
    introduction: '免费的精品小说',
    cover: 'https://example.com/covers/free.jpg',
    categoryIds: ['cat-003'],
    categories: ['科幻'],
    tags: ['星际', '未来'],
    status: 'serializing',
    wordCount: 50000,
    chapterCount: 20,
    price: 0,
    isFree: true,
    isRecommended: false,
    isFeatured: false,
    isHot: false
  }
} as const

/**
 * 章节测试数据
 */
export const testChapters = {
  chapter1: {
    id: 'chapter-001',
    bookId: 'test-book-001',
    title: '第一章：开始',
    content: '# 第一章内容\n\n这是第一章的详细内容...',
    wordCount: 2000,
    order: 1,
    isPublished: true,
    publishedAt: new Date().toISOString()
  },
  chapter2: {
    id: 'chapter-002',
    bookId: 'test-book-001',
    title: '第二章：发展',
    content: '# 第二章内容\n\n这是第二章的详细内容...',
    wordCount: 2500,
    order: 2,
    isPublished: true,
    publishedAt: new Date().toISOString()
  },
  draftChapter: {
    id: 'chapter-003',
    bookId: 'test-book-001',
    title: '第三章：草稿',
    content: '# 第三章草稿内容',
    wordCount: 1000,
    order: 3,
    isPublished: false,
    publishedAt: null
  }
} as const

/**
 * 评论测试数据
 */
export const testComments = {
  positive: {
    id: 'comment-001',
    bookId: 'test-book-001',
    userId: 'user-001',
    userName: '热心读者',
    content: '这本书太好看了，强烈推荐！',
    rating: 5,
    likeCount: 10,
    createdAt: new Date().toISOString()
  },
  neutral: {
    id: 'comment-002',
    bookId: 'test-book-001',
    userId: 'user-002',
    userName: '普通读者',
    content: '还可以，有一些地方需要改进',
    rating: 3,
    likeCount: 2,
    createdAt: new Date().toISOString()
  },
  negative: {
    id: 'comment-003',
    bookId: 'test-book-001',
    userId: 'user-003',
    userName: '挑剔读者',
    content: '不太喜欢这个风格',
    rating: 2,
    likeCount: 0,
    createdAt: new Date().toISOString()
  }
} as const

/**
 * 分类测试数据
 */
export const testCategories = {
  fantasy: {
    id: 'cat-001',
    name: '玄幻',
    description: '玄幻魔法类小说',
    icon: 'fantasy-icon',
    parentId: null,
    order: 1
  },
  urban: {
    id: 'cat-002',
    name: '都市',
    description: '都市生活类小说',
    icon: 'urban-icon',
    parentId: null,
    order: 2
  },
  scifi: {
    id: 'cat-003',
    name: '科幻',
    description: '科幻未来类小说',
    icon: 'scifi-icon',
    parentId: null,
    order: 3
  },
  xianxia: {
    id: 'cat-004',
    name: '修仙',
    description: '修仙类小说',
    icon: 'xianxia-icon',
    parentId: 'cat-001',
    order: 1
  }
} as const

/**
 * 项目测试数据（作者）
 */
export const testProjects = {
  newProject: {
    id: 'project-001',
    title: '新书项目',
    description: '这是一个新书项目的简介',
    genre: '玄幻',
    status: 'draft',
    wordCount: 0,
    chapterCount: 0,
    createdAt: new Date().toISOString()
  },
  ongoingProject: {
    id: 'project-002',
    title: '连载项目',
    description: '正在连载的项目',
    genre: '都市',
    status: 'ongoing',
    wordCount: 50000,
    chapterCount: 20,
    createdAt: new Date().toISOString()
  }
} as const

/**
 * API响应测试数据
 */
export const apiResponses = {
  success: {
    code: 200,
    message: '成功',
    data: {},
    request_id: 'test-request-001'
  },
  created: {
    code: 201,
    message: '创建成功',
    data: {},
    request_id: 'test-request-002'
  },
  unauthorized: {
    code: 401,
    message: '未授权',
    data: null,
    request_id: 'test-request-003'
  },
  forbidden: {
    code: 403,
    message: '无权限',
    data: null,
    request_id: 'test-request-004'
  },
  notFound: {
    code: 404,
    message: '资源不存在',
    data: null,
    request_id: 'test-request-005'
  },
  serverError: {
    code: 500,
    message: '服务器错误',
    data: null,
    request_id: 'test-request-006'
  }
} as const

/**
 * 测试数据生成器
 */
export class TestDataGenerator {
  /**
   * 生成随机用户名
   */
  static randomUsername(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  /**
   * 生成随机邮箱
   */
  static randomEmail(): string {
    return `user_${Date.now()}@example.com`
  }

  /**
   * 生成随机密码
   */
  static randomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return password
  }

  /**
   * 生成随机书籍ID
   */
  static randomBookId(): string {
    return `book_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  /**
   * 生成随机数字
   */
  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成随机文本
   */
  static randomText(wordCount: number = 10): string {
    const words = [
      '测试', '数据', '生成', '随机', '内容',
      '示例', '文本', '字段', '值', '对象'
    ]
    let text = ''
    for (let i = 0; i < wordCount; i++) {
      text += words[Math.floor(Math.random() * words.length)]
      if (i < wordCount - 1) text += ' '
    }
    return text
  }

  /**
   * 创建用户凭据
   */
  static createUserCredentials(overrides?: Partial<UserCredentials>): UserCredentials {
    return {
      username: this.randomUsername(),
      email: this.randomEmail(),
      password: this.randomPassword(),
      ...overrides
    }
  }

  /**
   * 创建书籍数据
   */
  static createBookData(overrides?: Partial<typeof testBooks.novel>): typeof testBooks.novel {
    return {
      ...testBooks.novel,
      id: this.randomBookId(),
      ...overrides
    }
  }

  /**
   * 创建章节数据
   */
  static createChapterData(overrides?: Partial<typeof testChapters.chapter1>): typeof testChapters.chapter1 {
    return {
      ...testChapters.chapter1,
      id: `chapter_${Date.now()}`,
      ...overrides
    }
  }

  /**
   * 生成日期范围
   */
  static dateRange(daysAgo: number): { start: string; end: string } {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - daysAgo)
    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }
}

/**
 * 书架测试数据
 */
export const testBookshelves = {
  default: {
    name: '我的书架',
    description: '收藏我喜欢的书籍'
  },
  favorites: {
    name: '最爱收藏',
    description: '我最喜欢的小说'
  },
  toRead: {
    name: '待看书单',
    description: '计划阅读的书籍'
  }
} as const

/**
 * 测试fixtures导出
 */
export const testFixtures = {
  users: testUsers,
  books: testBooks,
  chapters: testChapters,
  comments: testComments,
  categories: testCategories,
  projects: testProjects,
  bookshelves: testBookshelves,
  bookshelf: testBookshelves.default, // 添加默认书架
  apiResponses: apiResponses,
  generator: TestDataGenerator
}
