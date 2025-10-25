/**
 * Admin API
 */

import { httpService } from '@/core/services/http.service'
import type {
  DashboardStats,
  ReviewItem,
  WithdrawalRequest,
  UserManagementItem,
  OperationLog
} from '../types/admin.types'
import type { APIResponse } from '@/core/types/api.types'

export const adminAPI = {
  /**
   * Get dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return httpService.get<APIResponse<DashboardStats>>('/admin/dashboard/stats')
  },

  /**
   * Get reviews
   */
  async getReviews(
    status?: string,
    page: number = 1,
    size: number = 20
  ): Promise<ReviewItem[]> {
    return httpService.get<APIResponse<ReviewItem[]>>('/admin/reviews', {
      params: { status, page, size }
    } as any)
  },

  /**
   * Update review status
   */
  async updateReviewStatus(
    reviewId: string,
    status: 'approved' | 'rejected',
    feedback?: string
  ): Promise<void> {
    return httpService.put(`/admin/reviews/${reviewId}`, { status, feedback })
  },

  /**
   * Get withdrawals
   */
  async getWithdrawals(
    status?: string,
    page: number = 1,
    size: number = 20
  ): Promise<WithdrawalRequest[]> {
    return httpService.get<APIResponse<WithdrawalRequest[]>>('/admin/withdrawals', {
      params: { status, page, size }
    } as any)
  },

  /**
   * Update withdrawal status
   */
  async updateWithdrawalStatus(
    withdrawalId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    return httpService.put(`/admin/withdrawals/${withdrawalId}`, { status, reason })
  },

  /**
   * Get users
   */
  async getUsers(page: number = 1, size: number = 20): Promise<UserManagementItem[]> {
    return httpService.get<APIResponse<UserManagementItem[]>>('/admin/users', {
      params: { page, size }
    } as any)
  },

  /**
   * Ban user
   */
  async banUser(userId: string, reason: string, duration?: number): Promise<void> {
    return httpService.post(`/admin/users/${userId}/ban`, { reason, duration })
  },

  /**
   * Unban user
   */
  async unbanUser(userId: string): Promise<void> {
    return httpService.post(`/admin/users/${userId}/unban`)
  },

  /**
   * Get operation logs
   */
  async getOperationLogs(page: number = 1, size: number = 20): Promise<OperationLog[]> {
    return httpService.get<APIResponse<OperationLog[]>>('/admin/logs', {
      params: { page, size }
    } as any)
  }
}

export default adminAPI

