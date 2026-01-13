/**
 * 管理员 API 统一导出
 *
 * 导出所有管理员相关 API 模块
 *
 * @module admin/api
 */

// 管理员 API
export * from './admin'
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
