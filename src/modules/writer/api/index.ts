/**
 * 写作端 API 统一导出
 *
 * 导出所有写作端相关 API 模块
 *
 * @module writer/api
 */

// 项目管理 API
export * from './project'

// 文档管理 API
export * from './document'

// 角色管理 API
export * from './character'

// 地点管理 API
export * from './location'

// 时间线管理 API
export * from './timeline'

// 编辑器 API
export * from './editor'

// 统计数据 API
export * from './statistics'
export {
  getBookStats,
  getDailyStats,
  getSubscribersTrend,
  getChapterStats,
  getReaderActivity,
  getReadingHeatmap,
  compareBooks
} from './statistics'

// 收入统计 API
export * from './revenue'
export {
  getRevenueStats,
  getRevenueTrend,
  getRevenueSources,
  getChapterRevenueRanking,
  getWriterBooks,
  getRevenueRecords
} from './revenue'

// 导出功能 API
export * from './export'

// 发布管理 API
export * from './publish'
