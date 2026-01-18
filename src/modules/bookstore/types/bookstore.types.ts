/**
 * Bookstore Types (consolidated from src/types/bookstore.ts)
 */

export type RankingType = 'realtime' | 'weekly' | 'monthly' | 'newbie'

export type BookStatus = 'serializing' | 'completed' | 'paused'

/**
 * Book Brief Information
 */
export interface BookBrief {
  id: string
  title: string
  author: string
  authorId?: string
  cover?: string
  category?: string
  categoryId?: string
  description?: string
  tags?: string[]
  wordCount?: number
  chapterCount?: number
  status?: BookStatus
  rating?: number
  viewCount?: number
  favoriteCount?: number
  updateTime?: number
  latestChapter?: string
}

/**
 * Book Detail Information
 */
export interface Book extends BookBrief {
  introduction?: string
  authorIntro?: string
  publishTime?: number
  lastUpdateTime?: number
  isPaid?: boolean
  price?: number
  chapters?: Chapter[]
  relatedBooks?: BookBrief[]
}

/**
 * Chapter Information
 */
export interface Chapter {
  id: string
  bookId: string
  title: string
  chapterNumber: number
  wordCount?: number
  isPaid?: boolean
  price?: number
  publishTime?: number
  isLocked?: boolean
}

/**
 * Banner Information
 */
export interface Banner {
  id: string
  title: string
  image: string
  link?: string
  bookId?: string
  type?: 'book' | 'event' | 'external'
  order?: number
  startTime?: number
  endTime?: number
}

/**
 * Ranking Item
 */
export interface RankingItem {
  rank: number
  book: BookBrief
  score?: number
  change?: number
  badge?: string
}

/**
 * Category Information
 */
export interface Category {
  id: string
  name: string
  description?: string
  parentId?: string
  order?: number
  bookCount?: number
  icon?: string
}

/**
 * Category Tree Node
 */
export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[]
}

/**
 * Search Filter
 */
export interface SearchFilter {
  category?: string
  status?: BookStatus
  word_count_min?: number
  word_count_max?: number
  rating_min?: number
  sort_by?: 'popularity' | 'rating' | 'update_time' | 'word_count'
  order?: 'asc' | 'desc'
}

/**
 * Search Parameters
 */
export interface SearchParams extends SearchFilter {
  keyword?: string
  page?: number
  size?: number
}

/**
 * Search Result
 */
export interface SearchResult {
  books: BookBrief[]
  total: number
  page: number
  size: number
  totalPages?: number
  filters?: SearchFilter
}

/**
 * Homepage Data
 */
export interface HomepageData {
  banners: Banner[]
  rankings: {
    realtime: RankingItem[]
    weekly: RankingItem[]
    monthly: RankingItem[]
    newbie: RankingItem[]
  }
  recommendedBooks: BookBrief[]
  featuredBooks: BookBrief[]
  categories: Category[]
  newReleases?: BookBrief[]
  popularTags?: string[]
}

