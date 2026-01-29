/**
 * Social API Wrapper
 * 将orval生成的工厂模式API转换为更易使用的格式
 *
 * 使用方式：
 * import * as socialAPI from '@/modules/social/api'
 * const booklists = await socialAPI.getBookLists({ page: 1, size: 20 })
 */

import { getApi } from './generated/social'
import type { APIResponse } from '@/types/api'

// 获取生成的API对象
const api = getApi()

// ==================== 类型定义 ====================

/**
 * 书单类型
 */
export interface Booklist {
  id: string
  creator_id: string
  creator_name?: string
  creator_avatar?: string
  name: string
  description: string
  cover_url?: string
  book_count: number
  follower_count: number
  is_public: boolean
  is_official: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

/**
 * 书单项目
 */
export interface BooklistItem {
  id: string
  booklist_id: string
  book_id: string
  book_title: string
  book_cover: string
  book_author: string
  note?: string
  order: number
  added_at: string
}

/**
 * 书单统计
 */
export interface BooklistStats {
  total_booklists: number
  public_booklists: number
  my_booklists: number
}

/**
 * 书评类型
 */
export type ReviewType = 'book' | 'chapter' | 'list'

/**
 * 书评状态
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'deleted'

/**
 * 书评
 */
export interface Review {
  id: string
  reviewer_id: string
  reviewer_name: string
  reviewer_avatar: string
  target_id: string
  target_type: ReviewType
  book_id?: string
  book_title?: string
  book_cover?: string
  chapter_id?: string
  chapter_title?: string
  title: string
  content: string
  rating: number
  like_count: number
  comment_count: number
  is_spoiler: boolean
  status: ReviewStatus
  created_at: string
  updated_at: string
}

/**
 * 书评评论
 */
export interface ReviewComment {
  id: string
  review_id: string
  commenter_id: string
  commenter_name: string
  commenter_avatar: string
  content: string
  like_count: number
  created_at: string
}

/**
 * 书评统计
 */
export interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    rating: number
    count: number
  }[]
}

/**
 * 用户关注信息
 */
export interface UserFollowInfo {
  user_id: string
  username: string
  avatar_url?: string
  bio?: string
  follower_count: number
  following_count: number
  is_following?: boolean
  is_followed_by?: boolean
  created_at?: string
}

/**
 * 关注统计
 */
export interface FollowStats {
  follower_count: number
  following_count: number
  mutual_count: number
}

/**
 * 提及
 */
export interface Mention {
  id: string
  from_user_id: string
  from_user_name: string
  from_user_avatar?: string
  to_user_id: string
  content: string
  is_read: boolean
  created_at: string
}

/**
 * 消息
 */
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  sender_avatar?: string
  content: string
  is_read: boolean
  created_at: string
}

/**
 * 会话
 */
export interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_avatar?: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  created_at: string
  updated_at: string
}

// ==================== 书单相关 API ====================

/**
 * 获取书单列表
 * 兼容旧API: getBooklists(params)
 */
export const getBookLists = api.getApiV1SocialBooklists

/**
 * 获取书单列表（别名，兼容旧API）
 */
export const getBooklists = getBookLists

/**
 * 创建书单
 * 兼容旧API: createBooklist(data)
 */
export const createBookList = api.postApiV1SocialBooklists

/**
 * 创建书单（别名，兼容旧API）
 */
export const createBooklist = createBookList

/**
 * 删除书单
 * 兼容旧API: deleteBooklist(id)
 */
export const deleteBookList = api.deleteApiV1SocialBooklistsId

/**
 * 删除书单（别名，兼容旧API）
 */
export const deleteBooklist = deleteBookList

/**
 * 获取书单详情
 * 兼容旧API: getBooklistDetail(id)
 */
export const getBookListDetail = api.getApiV1SocialBooklistsId

/**
 * 获取书单详情（别名，兼容旧API）
 */
export const getBooklistDetail = getBookListDetail

/**
 * 更新书单
 * 兼容旧API: updateBooklist(id, data)
 */
export const updateBookList = api.putApiV1SocialBooklistsId

/**
 * 更新书单（别名，兼容旧API）
 */
export const updateBooklist = updateBookList

/**
 * 获取书单中的书籍列表
 * 兼容旧API: getBooklistBooks(id)
 */
export const getBookListBooks = api.getApiV1SocialBooklistsIdBooks

/**
 * 复制书单
 */
export const forkBookList = api.postApiV1SocialBooklistsIdFork

/**
 * 点赞书单
 */
export const likeBookList = api.postApiV1SocialBooklistsIdLike

// ==================== 书评相关 API ====================

/**
 * 获取书评列表
 * 兼容旧API: getReviews(params)
 */
export const getReviews = api.getApiV1SocialReviews

/**
 * 创建书评
 * 兼容旧API: createReview(data)
 */
export const createReview = api.postApiV1SocialReviews

/**
 * 删除书评
 * 兼容旧API: deleteReview(id)
 */
export const deleteReview = api.deleteApiV1SocialReviewsId

/**
 * 获取书评详情
 * 兼容旧API: getReviewDetail(id)
 */
export const getReviewDetail = api.getApiV1SocialReviewsId

/**
 * 更新书评
 * 兼容旧API: updateReview(id, data)
 */
export const updateReview = api.putApiV1SocialReviewsId

/**
 * 点赞书评
 */
export const likeReview = api.postApiV1SocialReviewsIdLike

// ==================== 关注相关 API ====================

/**
 * 获取关注列表
 * 兼容旧API: getFollowingList(params)
 */
export const getFollowingAuthors = api.getApiV1SocialFollowingAuthors

/**
 * 获取用户关注列表（别名，兼容旧API）
 */
export const getFollowingList = getFollowingAuthors

/**
 * 关注用户
 * 兼容旧API: followUser(userId)
 */
export async function followUser(userId: string): Promise<APIResponse<{ success: boolean }>> {
  return api.postApiV1SocialFollowUserId(userId) as any
}

/**
 * 取消关注用户
 * 兼容旧API: unfollowUser(userId)
 */
export async function unfollowUser(userId: string): Promise<APIResponse<{ success: boolean }>> {
  return api.deleteApiV1SocialFollowUserId(userId) as any
}

/**
 * 检查关注状态
 * 兼容旧API: checkFollowStatus(userId)
 */
export const getFollowStatus = api.getApiV1SocialFollowUserIdStatus

/**
 * 检查关注状态（别名，兼容旧API）
 */
export const checkFollowStatus = getFollowStatus

/**
 * 获取用户粉丝列表
 * 兼容旧API: getFollowersList(params)
 */
export const getFollowers = api.getApiV1SocialUsersUserIdFollowers

/**
 * 获取用户粉丝列表（别名，兼容旧API）
 */
export const getFollowersList = (userId: string, params?: any) => getFollowers(userId, params)

/**
 * 获取用户关注列表
 * 兼容旧API: getFollowingList(params)
 */
export const getFollowing = api.getApiV1SocialUsersUserIdFollowing

/**
 * 获取用户关注列表（别名，兼容旧API）
 */
export const getUserFollowing = (userId: string, params?: any) => getFollowing(userId, params)

/**
 * 获取用户关注统计
 */
export const getUserFollowStats = api.getApiV1SocialUsersUserIdFollowStats

/**
 * 获取用户关注状态
 */
export const getUserFollowStatus = api.getApiV1SocialUsersUserIdFollowStatus

/**
 * 取消关注用户
 */
export const userUnfollow = api.deleteApiV1SocialUsersUserIdUnfollow

/**
 * 关注作者
 */
export const followAuthor = api.postApiV1SocialAuthorsAuthorIdFollow

/**
 * 取消关注作者
 */
export const unfollowAuthor = api.deleteApiV1SocialAuthorsAuthorIdUnfollow

// ==================== 提及相关 API ====================

/**
 * 获取提及列表
 */
export const getMentions = api.getApiV1SocialMentions

/**
 * 创建提及
 */
export const createMention = api.postApiV1SocialMentions

/**
 * 标记提及为已读
 */
export const markMentionAsRead = api.putApiV1SocialMentionsIdRead

// ==================== 消息相关 API ====================

/**
 * 发送消息
 */
export const sendMessage = api.postApiV1SocialMessages

/**
 * 获取会话消息
 */
export const getConversationMessages = api.getApiV1SocialMessagesConversationId

/**
 * 删除消息
 */
export const deleteMessage = api.deleteApiV1SocialMessagesId

/**
 * 标记消息为已读
 */
export const markMessageAsRead = api.putApiV1SocialMessagesIdRead

/**
 * 获取会话列表
 */
export const getConversations = api.getApiV1SocialMessagesConversations

/**
 * 创建会话
 */
export const createConversation = api.postApiV1SocialMessagesConversations

/**
 * 获取会话消息
 */
export const getConversationMessagesList = api.getApiV1SocialMessagesConversationsConversationIdMessages

/**
 * 发送会话消息
 */
export const sendConversationMessage = api.postApiV1SocialMessagesConversationsConversationIdMessages

/**
 * 标记会话为已读
 */
export const markConversationAsRead = api.postApiV1SocialMessagesConversationsConversationIdRead

// ==================== 其他便捷方法 ====================

/**
 * 导出原始getApi函数（高级用法）
 * 可以传入自定义axios实例
 */
export { getApi }

/**
 * 默认导出
 */
export default {
  // 书单相关
  getBookLists,
  getBooklists,
  createBookList,
  createBooklist,
  deleteBookList,
  deleteBooklist,
  getBookListDetail,
  getBooklistDetail,
  updateBookList,
  updateBooklist,
  getBookListBooks,
  forkBookList,
  likeBookList,
  // 书评相关
  getReviews,
  createReview,
  deleteReview,
  getReviewDetail,
  updateReview,
  likeReview,
  // 关注相关
  getFollowingAuthors,
  getFollowingList,
  followUser,
  unfollowUser,
  getFollowStatus,
  checkFollowStatus,
  getFollowers,
  getFollowersList,
  getFollowing,
  getUserFollowing,
  getUserFollowStats,
  getUserFollowStatus,
  userUnfollow,
  followAuthor,
  unfollowAuthor,
  // 提及相关
  getMentions,
  createMention,
  markMentionAsRead,
  // 消息相关
  sendMessage,
  getConversationMessages,
  deleteMessage,
  markMessageAsRead,
  getConversations,
  createConversation,
  getConversationMessagesList,
  sendConversationMessage,
  markConversationAsRead,
  // 工具函数
  getApi,
}
