import request from '@/utils/request'

/**
 * 数据统计API
 */

export interface BookStats {
  bookId: string
  totalReads: number
  totalSubscribers: number
  totalComments: number
  totalLikes: number
  averageRating: number
  revenue: number
}

export interface ChapterStats {
  chapterId: string
  reads: number
  likes: number
  comments: number
  avgReadTime: number
  completionRate: number
}

export interface DailyStats {
  date: string
  reads: number
  subscribers: number
  revenue: number
  newComments: number
}

export interface Heatmap {
  chapterId: string
  chapterTitle: string
  segments: Array<{
    position: number
    intensity: number
  }>
}

export interface Revenue {
  date: string
  amount: number
  source: string
}

export interface TopChapter {
  chapterId: string
  title: string
  reads: number
  likes: number
  completionRate: number
}

export interface DropOffPoint {
  chapterId: string
  chapterTitle: string
  position: number
  dropOffRate: number
}

export interface Retention {
  day: number
  retentionRate: number
  userCount: number
}

/**
 * 获取作品统计
 */
export async function getBookStats(bookId: string) {
  return request.get<BookStats>(`/writer/books/${bookId}/stats`)
}

/**
 * 获取章节统计
 */
export async function getChapterStats(chapterId: string) {
  return request.get<ChapterStats>(`/writer/chapters/${chapterId}/stats`)
}

/**
 * 获取阅读热力图
 */
export async function getReadingHeatmap(bookId: string) {
  return request.get<Heatmap[]>(`/writer/books/${bookId}/heatmap`)
}

/**
 * 获取收入统计
 */
export async function getRevenue(bookId: string, startDate?: string, endDate?: string) {
  return request.get<Revenue[]>(`/writer/books/${bookId}/revenue`, {
    params: { start_date: startDate, end_date: endDate }
  })
}

/**
 * 获取热门章节
 */
export async function getTopChapters(bookId: string) {
  return request.get<TopChapter[]>(`/writer/books/${bookId}/top-chapters`)
}

/**
 * 获取每日统计
 */
export async function getDailyStats(bookId: string, days = 7) {
  return request.get<DailyStats[]>(`/writer/books/${bookId}/daily-stats`, {
    params: { days }
  })
}

/**
 * 获取跳出点分析
 */
export async function getDropOffPoints(bookId: string) {
  return request.get<DropOffPoint[]>(`/writer/books/${bookId}/drop-off-points`)
}

/**
 * 获取留存率
 */
export async function getRetention(bookId: string, days = 7) {
  return request.get<Retention[]>(`/writer/books/${bookId}/retention`, {
    params: { days }
  })
}

