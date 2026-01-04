/**
 * 用户模块 API 统一导出
 *
 * 导出所有用户相关 API 模块
 *
 * @module user/api
 */

// 用户核心 API
export * from './user.api'
export { userAPI, getProfile, updateProfile, uploadAvatar, getBookshelf, getReadingHistory } from './user.api'

// 用户个人资料 API
export { getUserProfile, updateUserProfile, uploadAvatar as uploadProfileAvatar } from './profile'
// 从 profile 导出 changePassword 但重命名以避免冲突
export { changePassword as changeProfilePassword } from './profile'

// 用户安全功能 API - 导出所有函数，但将 changePassword 重命名
export {
  sendPhoneVerifyCode,
  bindPhone,
  changePhone,
  unbindPhone,
  sendEmailVerifyCode,
  bindEmail,
  changeEmail,
  unbindEmail,
  verifyEmail,
  changePassword as changePassword,  // 默认使用 security 的 changePassword
  sendPasswordResetCode,
  verifyResetCode,
  resetPassword,
  getLoginDevices,
  removeDevice,
  cancelAccount
} from './security'

// 为了向后兼容，导出 profile 的 changePassword 作为别名
export { changePassword as changeSecurityPassword } from './security'
