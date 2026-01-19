/**
 * Admin Service
 * Business logic for admin operations
 */

import * as adminAPI from '@/modules/admin/api'
import type {
  DashboardStats,
  ReviewItem,
  WithdrawalRequest
} from '../types/admin.types'
import type { APIResponse } from '@/core/types/api.types'

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await adminAPI.getDashboardStats()
    return response.data as DashboardStats
  }

  /**
   * Get pending reviews
   */
  async getPendingReviews(page: number = 1, size: number = 20): Promise<ReviewItem[]> {
    const response = await adminAPI.getReviewList({ status: 'pending', page, pageSize: size })
    return (response.data as any)?.items || response.data || []
  }

  /**
   * Approve review
   */
  async approveReview(reviewId: string, feedback?: string): Promise<void> {
    await adminAPI.reviewContent(reviewId, { status: 'approved', reason: feedback })
  }

  /**
   * Reject review
   */
  async rejectReview(reviewId: string, reason: string): Promise<void> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('拒绝原因至少需要5个字符')
    }
    await adminAPI.reviewContent(reviewId, { status: 'rejected', reason })
  }

  /**
   * Get pending withdrawals
   */
  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    const response = await adminAPI.getWithdrawalList({ status: 'pending' })
    return (response.data as any)?.items || response.data || []
  }

  /**
   * Approve withdrawal
   */
  async approveWithdrawal(withdrawalId: string): Promise<void> {
    await adminAPI.reviewWithdraw(withdrawalId, { status: 'approved' })
  }

  /**
   * Reject withdrawal
   */
  async rejectWithdrawal(withdrawalId: string, reason: string): Promise<void> {
    if (!reason || reason.trim().length < 5) {
      throw new Error('拒绝原因至少需要5个字符')
    }
    await adminAPI.reviewWithdraw(withdrawalId, { status: 'rejected', reason })
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

