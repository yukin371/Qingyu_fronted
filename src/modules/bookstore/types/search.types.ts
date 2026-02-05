// ==========================================
// 搜索相关类型定义
// ==========================================

/**
 * 作者卡片信息
 */
export interface AuthorCard {
  id: string
  name: string
  avatar: string
  bio: string
  book_count: number
  total_words: number
  follower_count: number
}

/**
 * 搜索结果项类型
 */
export type SearchResultItem = AuthorCard

/**
 * 搜索类型
 */
export type SearchType = 'book' | 'author'

/**
 * 搜索状态
 */
export type SearchStatus = 'idle' | 'loading' | 'success' | 'error'
