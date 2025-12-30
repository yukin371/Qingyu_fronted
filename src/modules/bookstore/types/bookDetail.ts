// ==========================================
// Book Detail (书籍详情)
// ==========================================

import type { ID, ISODate } from './core'
import type { BookStatus } from './book'

// 对应 Go 中的 BookDetail 结构体
// 注意：此处 JSON tag 为 snake_case，与列表 Book 结构不同
export interface BookDetail {
  id?: ID
  title: string
  subtitle: string
  author: string
  author_id: ID
  description: string
  introduction: string
  cover_url: string // 注意与 Book 中的 cover 区分

  // 网络小说特有字段
  serialized_at: ISODate
  completed_at?: ISODate

  categories: string[]
  category_ids: ID[] // 注意与 Book 中的 categoryIds 区分
  tags: string[]
  status: BookStatus
  word_count: number
  chapter_count: number
  price: number
  is_free: boolean

  // 统计数据
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  collect_count: number
  rating: number
  rating_count: number

  // 最新章节信息
  last_chapter_title: string
  last_chapter_at: ISODate

  created_at: ISODate
  updated_at: ISODate
}
