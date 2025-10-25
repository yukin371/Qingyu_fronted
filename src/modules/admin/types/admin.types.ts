/**
 * Admin Types
 */

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalBooks: number
  totalRevenue: number
  pendingReviews: number
  pendingWithdrawals: number
  todayStats?: {
    newUsers: number
    newBooks: number
    revenue: number
  }
}

/**
 * Review Item
 */
export interface ReviewItem {
  id: string
  type: 'book' | 'chapter' | 'comment'
  contentId: string
  title: string
  authorId: string
  authorName: string
  content?: string
  status: 'pending' | 'approved' | 'rejected'
  submitTime: number
  reviewTime?: number
  reviewerId?: string
  feedback?: string
}

/**
 * Withdrawal Request
 */
export interface WithdrawalRequest {
  id: string
  userId: string
  userName: string
  amount: number
  fee: number
  actualAmount: number
  account: string
  accountType: 'alipay' | 'bank'
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestTime: number
  processTime?: number
  processorId?: string
  reason?: string
}

/**
 * User Management Item
 */
export interface UserManagementItem {
  id: string
  username: string
  email?: string
  phone?: string
  roles: string[]
  status: 'active' | 'banned' | 'inactive'
  registerTime: number
  lastLoginTime?: number
  banReason?: string
  banUntil?: number
}

/**
 * Operation Log
 */
export interface OperationLog {
  id: string
  operatorId: string
  operatorName: string
  action: string
  target: string
  targetId: string
  details?: string
  result: 'success' | 'failure'
  timestamp: number
  ip?: string
}

export default {
  DashboardStats,
  ReviewItem,
  WithdrawalRequest,
  UserManagementItem,
  OperationLog
}

