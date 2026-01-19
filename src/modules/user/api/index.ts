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
export * from './profile'
export { getUserProfile, updateUserProfile, changePassword as changeProfilePassword, uploadAvatar as uploadProfileAvatar } from './profile'

// 用户安全功能 API
export * from './security'
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
  changePasswordSecure as changeSecurityPassword,
  sendPasswordResetCode,
  verifyResetCode,
  resetPassword,
  getLoginDevices,
  removeDevice,
  cancelAccount
} from './security'
