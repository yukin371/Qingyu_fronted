/**
 * Admin Service
 * Business logic for admin operations
 */

import { adminAPI } from '../api/admin.api'
import type {
  DashboardStats,
  ReviewItem,
  WithdrawalRequest,
  UserManagementItem
} from '../types/admin.types'

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return await adminAPI.getDashboardStats()
  }

  /**
   * Get pending reviews
   */
  async getPendingReviews(page: number = 1, size: number = 20): Promise<ReviewItem[]> {
    return await adminAPI.getReviews('pending', page, size)
  }

  /**
   * Approve review
   */
  async approveReview(reviewId: string, feedback?: string): Promise<void> {
    await adminAPI.updateReviewStatus(reviewId, 'approved', feedback)
  }

  /**
   * Reject review
   */
  async rejectReview(reviewId: string, reason: string): Promise<void> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('拒绝原因至少需要5个字符')
    }
    await adminAPI.updateReviewStatus(reviewId, 'rejected', reason)
  }

  /**
   * Get pending withdrawals
   */
  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    return await adminAPI.getWithdrawals('pending')
  }

  /**
   * Approve withdrawal
   */
  async approveWithdrawal(withdrawalId: string): Promise<void> {
    await adminAPI.updateWithdrawalStatus(withdrawalId, 'approved')
  }

  /**
   * Reject withdrawal
   */
  async rejectWithdrawal(withdrawalId: string, reason: string): Promise<void> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('拒绝原因至少需要5个字符')
    }
    await adminAPI.updateWithdrawalStatus(withdrawalId, 'rejected', reason)
  }

  /**
   * Format review status
   */
  formatReviewStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝'
    }
    return statusMap[status] || status
  }

  /**
   * Format withdrawal status
   */
  formatWithdrawalStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      approved: '已批准',
      rejected: '已拒绝',
      completed: '已完成'
    }
    return statusMap[status] || status
  }
}

export const adminService = new AdminService()
export default adminService

