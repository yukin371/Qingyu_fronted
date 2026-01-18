/**
 * 阅读器相关类型定义
 */

// ============ 章节相关 ============

/**
 * 章节信息
 */
export interface Chapter {
  id: string
  bookId: string
  title: string
  chapterNumber: number
  wordCount: number
  isFree: boolean
  price?: number
  publishedAt: string
  updatedAt: string

  // 导航信息
  prevChapterId?: string
  nextChapterId?: string
}

/**
 * 章节内容
 */
export interface ChapterContent {
  id: string
  chapterId: string
  content: string
  wordCount: number

  // 章节元信息
  chapter?: Chapter
}

// ============ 阅读设置 ============

/**
 * 阅读设置
 */
export interface ReaderSettings {
  userId: string

  // 字体设置
  fontSize: number // 字号 (px)
  fontFamily: string // 字体
  lineHeight: number // 行高
  letterSpacing: number // 字间距

  // 主题设置
  theme: 'light' | 'dark' | 'sepia' | 'green' | 'blue'
  backgroundColor?: string
  textColor?: string

  // 阅读设置
  pageMode: 'scroll' | 'page' // 翻页模式
  pageWidth?: number // 页面宽度 (px)
  autoSave: boolean // 自动保存进度

  // 其他设置
  enableAnimation: boolean // 翻页动画
  showProgress: boolean // 显示进度条

  updatedAt: string
}

// ============ 阅读历史 ============

/**
 * 阅读历史
 */
export interface ReadingHistory {
  id: string
  userId: string
  bookId: string
  chapterId: string
  progress: number // 阅读进度 (0-100)
  readDuration: number // 阅读时长（秒）
  lastReadAt: string
  createdAt: string

  // 关联信息
  book?: {
    id: string
    title: string
    author: string
    coverUrl: string
  }
  chapter?: {
    id: string
    title: string
    chapterNumber: number
  }
}

/**
 * 阅读统计
 */
export interface ReadingStats {
  totalBooks: number // 总阅读书籍数
  totalChapters: number // 总阅读章节数
  totalDuration: number // 总阅读时长（秒）
  todayDuration: number // 今日阅读时长（秒）
  weekDuration: number // 本周阅读时长（秒）
  monthDuration: number // 本月阅读时长（秒）
  averageDailyDuration: number // 日均阅读时长（秒）
}

/**
 * 阅读进度
 */
export interface ReadingProgress {
  bookId: string
  chapterId: string
  chapterNumber: number
  progress: number // 章节内阅读进度 (0-100)
  updatedAt: string
}

// ============ 评论相关 ============

/**
 * 评论
 */
export interface Comment {
  id: string
  userId: string
  bookId?: string
  chapterId?: string
  parentId?: string // 父评论ID
  content: string
  likeCount: number
  replyCount: number
  isLiked?: boolean // 当前用户是否已点赞
  createdAt: string
  updatedAt: string

  // 用户信息
  user?: {
    id: string
    username: string
    nickname?: string
    avatar?: string
  }

  // 回复列表
  replies?: Comment[]
}

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  bookId?: string
  chapterId?: string
  parentId?: string
  content: string
}

