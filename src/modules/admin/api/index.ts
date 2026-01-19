/**
 * 管理员 API 统一导出
 *
 * 导出所有管理员相关 API 模块
 *
 * @module admin/api
 */

// 管理员 API
export * from './admin'

// 导出类型
export type { Announcement, Banner, ConfigGroup, UpdateConfigRequest } from '../types/admin.types'

// 导出所有函数作为 adminAPI 对象
export {
  getDashboardStats,
  getReviewList,
  getPendingReviews,
  reviewContent,
  getWithdrawalList,
  handleWithdrawal,
  reviewWithdraw,
  getUserList,
  updateUser,
  deleteUser,
  getOperationLogs,
  getConfigBackups,
  restoreConfigBackup,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from './admin'

// 创建 adminAPI 对象，包含所有 API 方法
import {
  getDashboardStats as _getDashboardStats,
  getReviewList as _getReviewList,
  getPendingReviews as _getPendingReviews,
  reviewContent as _reviewContent,
  getWithdrawalList as _getWithdrawalList,
  handleWithdrawal as _handleWithdrawal,
  reviewWithdraw as _reviewWithdraw,
  getUserList as _getUserList,
  updateUser as _updateUser,
  deleteUser as _deleteUser,
  getOperationLogs as _getOperationLogs,
  getConfigBackups as _getConfigBackups,
  restoreConfigBackup as _restoreConfigBackup,
  getBanners as _getBanners,
  createBanner as _createBanner,
  updateBanner as _updateBanner,
  deleteBanner as _deleteBanner
} from './admin'

export const adminAPI = {
  getDashboardStats: _getDashboardStats,
  getReviewList: _getReviewList,
  getPendingReviews: _getPendingReviews,
  reviewContent: _reviewContent,
  getWithdrawalList: _getWithdrawalList,
  handleWithdrawal: _handleWithdrawal,
  reviewWithdraw: _reviewWithdraw,
  getUserList: _getUserList,
  updateUser: _updateUser,
  deleteUser: _deleteUser,
  getOperationLogs: _getOperationLogs,
  getConfigBackups: _getConfigBackups,
  restoreConfigBackup: _restoreConfigBackup,
  getBanners: _getBanners,
  createBanner: _createBanner,
  updateBanner: _updateBanner,
  deleteBanner: _deleteBanner
}
