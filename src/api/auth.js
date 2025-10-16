import request from '@/utils/request'

/**
 * 用户认证API接口
 * 基于后端 API v1.0 - 更新接口路径以匹配实际后端
 */
export const authAPI = {
  /**
   * 用户注册
   * @param {Object} userData - 注册数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   */
  register(userData) {
    return request.post('/register', userData)
  },

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名或邮箱
   * @param {string} credentials.password - 密码
   */
  login(credentials) {
    return request.post('/login', credentials)
  },

  /**
   * 用户登出（客户端清除token）
   * 注意：当前后端未实现登出接口，仅清除本地状态
   */
  logout() {
    // 后端暂无登出接口，仅返回成功响应
    return Promise.resolve({ message: '登出成功' })
  },

  /**
   * 刷新Token
   * 注意：当前后端未实现token刷新，需要重新登录
   */
  refreshToken(refreshToken) {
    // 后端暂无刷新token接口
    return Promise.reject(new Error('Token刷新功能暂未实现，请重新登录'))
  },

  /**
   * 获取当前用户信息
   */
  getUserInfo() {
    return request.get('/users/profile')
  },

  /**
   * 更新用户信息
   * @param {Object} userInfo - 用户信息
   */
  updateUserInfo(userInfo) {
    return request.put('/users/profile', userInfo)
  },

  /**
   * 修改密码
   * @param {Object} passwordData - 密码数据
   * @param {string} passwordData.old_password - 旧密码
   * @param {string} passwordData.new_password - 新密码
   */
  changePassword(passwordData) {
    return request.put('/users/password', passwordData)
  },

  // 以下功能暂未实现，保留接口供后续扩展

  /**
   * 发送验证码（未实现）
   */
  sendVerificationCode(email) {
    return Promise.reject(new Error('验证码功能暂未实现'))
  },

  /**
   * 验证邮箱（未实现）
   */
  verifyEmail(verificationData) {
    return Promise.reject(new Error('邮箱验证功能暂未实现'))
  },

  /**
   * 重置密码（未实现）
   */
  resetPassword(resetData) {
    return Promise.reject(new Error('密码重置功能暂未实现'))
  },

  /**
   * 检查用户名是否可用（未实现）
   */
  checkUsername(username) {
    return Promise.reject(new Error('用户名检查功能暂未实现'))
  },

  /**
   * 检查邮箱是否可用（未实现）
   */
  checkEmail(email) {
    return Promise.reject(new Error('邮箱检查功能暂未实现'))
  }
}
