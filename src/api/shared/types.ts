/**
 * 共享服务API类型定义
 */

// ==================== 通用类型 ====================

/**
 * API统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  timestamp?: number
  request_id?: string
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T = any> {
  code: number
  message: string
  data: T[]
  total: number
  page: number
  page_size: number
  timestamp?: number
  pagination?: {
    total: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number
  page_size?: number
}

// ==================== 认证服务类型 ====================

/**
 * 注册请求数据
 */
export interface RegisterRequest {
  username: string
  email: string
  password: string
}

/**
 * 登录请求数据
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 认证响应数据
 */
export interface AuthResponse {
  userId: string
  username: string
  token: string
  expiresAt?: string
  refreshToken?: string
}

/**
 * 权限列表
 */
export type PermissionList = string[]

/**
 * 角色信息
 */
export interface RoleInfo {
  roleId: string
  roleName: string
  displayName: string
  permissions: string[]
}

// ==================== 钱包服务类型 ====================

/**
 * 钱包余额信息
 */
export interface WalletBalance {
  balance: number
  frozenAmount: number
  availableAmount: number
}

/**
 * 完整钱包信息
 */
export interface WalletInfo {
  walletId: string
  userId: string
  balance: number
  frozenAmount: number
  availableAmount: number
  totalIncome: number
  totalExpense: number
  createdAt: string
  updatedAt: string
}

/**
 * 充值请求
 */
export interface RechargeRequest {
  amount: number
  method: 'alipay' | 'wechat' | 'bank'
}

/**
 * 消费请求
 */
export interface ConsumeRequest {
  amount: number
  reason: string
}

/**
 * 转账请求
 */
export interface TransferRequest {
  to_user_id: string
  amount: number
  reason?: string
}

/**
 * 交易记录
 */
export interface Transaction {
  transactionId: string
  type: 'recharge' | 'consume' | 'transfer' | 'withdraw'
  amount: number
  balance?: number
  description?: string
  reason?: string
  fromUserId?: string
  toUserId?: string
  createdAt: string
  status?: string
}

/**
 * 交易查询参数
 */
export interface TransactionQueryParams extends PaginationParams {
  type?: 'recharge' | 'consume' | 'transfer' | 'withdraw'
}

/**
 * 提现请求
 */
export interface WithdrawRequest {
  amount: number
  account: string
}

/**
 * 提现记录
 */
export interface WithdrawRecord {
  withdrawId: string
  amount: number
  account: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt?: string
  reason?: string
}

/**
 * 提现查询参数
 */
export interface WithdrawQueryParams extends PaginationParams {
  status?: 'pending' | 'approved' | 'rejected'
}

// ==================== 存储服务类型 ====================

/**
 * 文件信息
 */
export interface FileInfo {
  fileId: string
  filename: string
  size: number
  contentType: string
  url: string
  userId?: string
  category?: string
  path?: string
  createdAt: string
}

/**
 * 文件列表查询参数
 */
export interface FileListParams extends PaginationParams {
  category?: string
}

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  fileId: string
  filename: string
  size: number
  contentType: string
  url: string
  createdAt: string
}

/**
 * 文件URL响应
 */
export interface FileUrlResponse {
  url: string
}

// ==================== 管理员服务类型 ====================

/**
 * 待审核内容
 */
export interface PendingReview {
  reviewId: string
  contentId: string
  contentType: 'document' | 'book' | 'chapter' | 'comment'
  title?: string
  content?: string
  submittedBy: string
  submittedAt: string
  status?: 'pending' | 'approved' | 'rejected'
}

/**
 * 审核请求
 */
export interface ReviewRequest {
  content_id: string
  content_type: 'document' | 'book' | 'chapter' | 'comment'
  action: 'approve' | 'reject'
  reason?: string
}

/**
 * 提现审核请求
 */
export interface WithdrawReviewRequest {
  withdraw_id: string
  approved: boolean
  reason?: string
}

/**
 * 用户统计信息
 */
export interface UserStatistics {
  userId: string
  totalProjects?: number
  totalDocuments?: number
  totalBooks?: number
  totalChapters?: number
  totalWords?: number
  totalRevenue?: number
  totalReads?: number
  totalIncome?: number
  registeredAt: string
}

/**
 * 操作日志
 */
export interface OperationLog {
  logId: string
  adminId: string
  adminName: string
  operation: string
  targetType?: string
  targetId?: string
  target?: string
  details: string
  createdAt: string
}

/**
 * 操作日志查询参数
 */
export interface OperationLogParams extends PaginationParams {
  admin_id?: string
  operation?: string
  start_date?: string
  end_date?: string
}

/**
 * 待审核内容查询参数
 */
export interface PendingReviewParams {
  content_type?: 'document' | 'book' | 'chapter' | 'comment'
}

// ==================== 上传相关类型 ====================

/**
 * 上传进度
 */
export interface UploadProgress {
  fileId: string
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

