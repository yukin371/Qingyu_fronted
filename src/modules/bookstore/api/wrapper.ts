/**
 * Bookstore API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as bookstoreAPI from '@/modules/bookstore/api'
 * const books = await bookstoreAPI.getBookList({ page: 1, size: 20 })
 */

import { getApi } from './generated/bookstore'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import type {
  Banner,
  BookBrief,
  BookDetail,
  BookStatistics,
  Category,
  Chapter,
  HomepageData,
  RankingItem,
  SearchFilter,
  SearchResult,
} from '@/modules/bookstore/types'

// 获取生成的API对象
const api = getApi()

// ==================== Banners 相关 API ====================

/**
 * 获取轮播图列表
 */
export const getBanners = api.getApiV1BookstoreBanners

/**
 * 增加轮播图点击次数
 */
export const incrementBannerClick = api.postApiV1BookstoreBannersIdClick

// ==================== Books 相关 API ====================

/**
 * 获取书籍列表
 */
export const getBookList = api.getApiV1BookstoreBooks

/**
 * 获取书籍详情
 * 兼容旧API: getBookDetail(id)
 */
export async function getBookDetail(id: string): Promise<APIResponse<BookDetail>> {
  return api.getApiV1BookstoreBooksIdDetail(id) as any
}

/**
 * 创建书籍
 */
export const createBook = api.postApiV1BookstoreBooks

/**
 * 更新书籍
 */
export const updateBook = api.putApiV1BookstoreBooksId

/**
 * 删除书籍
 */
export const deleteBook = api.deleteApiV1BookstoreBooksId

/**
 * 搜索书籍
 */
export const searchBooks = api.getApiV1BookstoreBooksSearch

/**
 * 按书名搜索
 */
export const searchByTitle = api.getApiV1BookstoreBooksSearchTitle

/**
 * 按作者搜索
 */
export const searchByAuthor = api.getApiV1BookstoreBooksSearchAuthor

/**
 * 按状态获取书籍
 */
export const getBooksByStatus = api.getApiV1BookstoreBooksStatus

/**
 * 按标签获取书籍
 */
export const getBooksByTags = api.getApiV1BookstoreBooksTags

/**
 * 获取推荐书籍
 */
export const getRecommendedBooks = api.getApiV1BookstoreBooksRecommended

/**
 * 获取精选书籍
 */
export const getFeaturedBooks = api.getApiV1BookstoreBooksFeatured

/**
 * 获取热门书籍
 */
export const getPopularBooks = api.getApiV1BookstoreBooksPopular

/**
 * 获取最新书籍
 */
export const getLatestBooks = api.getApiV1BookstoreBooksLatest

/**
 * 获取相似书籍
 */
export const getSimilarBooks = api.getApiV1BookstoreBooksIdSimilar

/**
 * 增加书籍浏览次数
 */
export const incrementBookView = api.postApiV1BookstoreBooksIdView

/**
 * 获取书籍统计信息
 */
export const getBookStatistics = api.getApiV1BookstoreBooksIdStatistics

/**
 * 点赞书籍
 */
export const likeBook = api.postApiV1BookstoreBooksIdLike

/**
 * 取消点赞书籍
 */
export const unlikeBook = api.postApiV1BookstoreBooksIdUnlike

/**
 * 获取书籍评分分布
 */
export const getBookRatingDistribution = api.getApiV1BookstoreBooksIdRatingDistribution

/**
 * 获取书籍评论列表
 */
export const getBookReviews = api.getApiV1BookstoreBooksIdRatings

/**
 * 为书籍评分
 */
export const rateBook = api.postApiV1BookstoreBooksIdRating

/**
 * 更新书籍评分
 */
export const updateBookRating = api.putApiV1BookstoreBooksIdRating

/**
 * 删除书籍评分
 */
export const deleteBookRating = api.deleteApiV1BookstoreBooksIdRating

/**
 * 获取书籍平均评分
 */
export const getBookAverageRating = api.getApiV1BookstoreBooksIdAverageRating

/**
 * 获取书籍章节列表
 */
export const getBookChapters = api.getApiV1BookstoreBooksIdChapters

/**
 * 获取书籍第一章
 */
export const getBookFirstChapter = api.getApiV1BookstoreBooksIdChaptersFirst

/**
 * 获取书籍最后一章
 */
export const getBookLastChapter = api.getApiV1BookstoreBooksIdChaptersLast

/**
 * 获取书籍免费章节
 */
export const getBookFreeChapters = api.getApiV1BookstoreBooksIdChaptersFree

/**
 * 获取书籍付费章节
 */
export const getBookPaidChapters = api.getApiV1BookstoreBooksIdChaptersPaid

/**
 * 获取书籍已发布章节
 */
export const getBookPublishedChapters = api.getApiV1BookstoreBooksIdChaptersPublished

/**
 * 获取书籍章节统计
 */
export const getBookChapterStatistics = api.getApiV1BookstoreBooksIdChaptersStatistics

/**
 * 获取书籍试读章节
 */
export const getBookTrialChapters = api.getApiV1BookstoreBooksIdTrialChapters

/**
 * 获取书籍VIP章节
 */
export const getBookVipChapters = api.getApiV1BookstoreBooksIdVipChapters

/**
 * 按分类获取书籍
 */
export const getBooksByCategory = api.getApiV1BookstoreBooksCategory

// ==================== Categories 相关 API ====================

/**
 * 获取所有分类（树形结构）
 */
export async function getAllCategories(): Promise<APIResponse<Category[]>> {
  return api.getApiV1BookstoreCategoriesTree() as any
}

/**
 * 获取分类列表（别名）
 */
export const getCategories = getAllCategories

/**
 * 获取分类树
 */
export const getCategoryTree = api.getApiV1BookstoreCategoriesTree

/**
 * 获取分类详情
 */
export const getCategoryDetail = api.getApiV1BookstoreCategoriesId

/**
 * 获取分类下的书籍
 */
export const getBooksByCategoryWithPagination = api.getApiV1BookstoreCategoriesIdBooks

// ==================== Chapters 相关 API ====================

/**
 * 获取章节详情
 */
export const getChapterDetail = api.getApiV1BookstoreChaptersId

/**
 * 获取章节内容
 */
export const getChapterContent = api.getApiV1BookstoreChaptersIdContent

/**
 * 获取下一章
 */
export const getNextChapter = api.getApiV1BookstoreChaptersIdNext

/**
 * 获取上一章
 */
export const getPreviousChapter = api.getApiV1BookstoreChaptersIdPrevious

/**
 * 获取章节价格
 */
export const getChapterPrice = api.getApiV1BookstoreChaptersIdPrice

/**
 * 搜索章节
 */
export const searchChapters = api.getApiV1BookstoreChaptersSearch

/**
 * 创建章节
 */
export const createChapter = api.postApiV1BookstoreChapters

/**
 * 更新章节
 */
export const updateChapter = api.putApiV1BookstoreChaptersId

/**
 * 删除章节
 */
export const deleteChapter = api.deleteApiV1BookstoreChaptersId

/**
 * 获取章节访问权限
 */
export const getChapterAccess = api.getApiV1BookstoreChaptersIdAccess

// ==================== Homepage 相关 API ====================

/**
 * 获取首页数据
 */
export const getHomepage = api.getApiV1BookstoreHomepage

// ==================== Rankings 相关 API ====================

/**
 * 获取实时榜单
 */
export const getRealtimeRanking = api.getApiV1BookstoreRankingsRealtime

/**
 * 获取周榜
 */
export const getWeeklyRanking = api.getApiV1BookstoreRankingsWeekly

/**
 * 获取月榜
 */
export const getMonthlyRanking = api.getApiV1BookstoreRankingsMonthly

/**
 * 获取新人榜
 */
export const getNewbieRanking = api.getApiV1BookstoreRankingsNewbie

/**
 * 按类型获取榜单
 */
export const getRankingByType = api.getApiV1BookstoreRankingsType

// ==================== 其他便捷方法 ====================

/**
 * 获取指定书籍的指定章节
 */
export const getBookChapterByNumber = api.getApiV1BookstoreBooksIdChaptersChapterNum

/**
 * 获取指定书籍的指定章节（通过ID）
 */
export const getBookChapterById = api.getApiV1BookstoreBooksIdChaptersChapterId

/**
 * 获取用户对指定书籍的评分
 */
export const getUserBookRating = api.getApiV1BookstoreRatingsUserId

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }
