/**
 * 共享服务类型定义 (v1.3)
 * 基于 doc/api/frontend/共享服务API参考.md
 */

import type { APIResponse, PaginatedResponse } from './api'

// ==================== 钱包相关 ====================

/**
 * 钱包信息
 */
export interface WalletInfo {
  userId: string
  balance: number
  frozenBalance?: number
  frozenAmount?: number
  availableAmount?: number
  totalIncome?: number
  totalExpense?: number
  currency?: string
  updatedAt?: string
}

/**
 * 交易类型
 */
export type TransactionType = 'recharge' | 'consume' | 'transfer' | 'withdraw' | 'income' | 'refund'

/**
 * 交易状态
 */
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled'

/**
 * 交易记录
 */
export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  balance: number
  reason: string
  description?: string
  status: TransactionStatus
  relatedId?: string // 关联ID（如订单ID）
  createdAt: string
  updatedAt?: string
}

/**
 * 充值参数
 */
export interface RechargeParams {
  amount: number
  method: string // 支付方式
  channel?: string
}

/**
 * 消费参数
 */
export interface ConsumeParams {
  amount: number
  reason: string
  relatedId?: string
}

/**
 * 转账参数
 */
export interface TransferParams {
  toUserId: string
  targetUserId?: string
  amount: number
  reason?: string
}

/**
 * 转账请求（兼容）
 */
export interface TransferRequest {
  targetUserId: string
  amount: number
  reason?: string
}

/**
 * 提现申请
 */
export interface WithdrawRequest {
  id: string
  userId: string
  amount: number
  account: string
  accountType: string // 提现账户类型
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  createdAt: string
  processedAt?: string
  processedBy?: string
}

/**
 * 提现申请参数
 */
export interface WithdrawParams {
  amount: number
  account: string
  accountType: string
  verifyCode?: string
}

// ==================== 文件存储相关 ====================

/**
 * 文件分类
 */
export type FileCategory = 'avatar' | 'cover' | 'document' | 'image' | 'other'

/**
 * 文件信息
 */
export interface FileInfo {
  id?: string
  fileId: string
  filename: string
  originalName?: string
  size: number
  mimeType?: string
  contentType: string
  url: string
  path?: string
  category: FileCategory
  userId?: string
  uploadedAt: string
  uploadTime?: string
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  file: FileInfo
  url: string
}

/**
 * 文件上传参数
 */
export interface UploadParams {
  file: File
  path?: string
  category?: FileCategory
}

/**
 * 文件列表查询参数
 */
export interface FileListParams {
  category?: FileCategory
  page?: number
  page_size?: number
}

// ==================== 管理员审核相关 ====================

/**
 * 审核状态
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

/**
 * 审核项类型
 */
export type ReviewItemType = 'book' | 'chapter' | 'comment' | 'withdraw'

/**
 * 审核项
 */
export interface ReviewItem {
  id: string
  type: ReviewItemType
  targetId: string
  targetTitle?: string
  content?: string
  submitterId: string
  submitterName?: string
  status: ReviewStatus
  reviewerId?: string
  reviewerName?: string
  reason?: string
  createdAt: string
  reviewedAt?: string
}

/**
 * 审核参数
 */
export interface ReviewParams {
  status: 'approved' | 'rejected'
  reason?: string
}

// ==================== 系统设置相关 ====================

/**
 * 系统配置项
 */
export interface SystemConfig {
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  updatedAt?: string
}

/**
 * 通知消息
 */
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  isRead: boolean
  relatedId?: string
  createdAt: string
}

