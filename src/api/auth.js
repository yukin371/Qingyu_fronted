import request from '@/utils/request'

// 用户认证API接口
export const authAPI = {
  // 用户注册
  register(userData) {
    return request.post('/auth/register', userData)
  },

  // 用户登录
  login(credentials) {
    return request.post('/auth/login', credentials)
  },

  // 用户登出
  logout() {
    return request.post('/auth/logout')
  },

  // 刷新Token
  refreshToken(refreshToken) {
    return request.post('/auth/refresh', { refreshToken })
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/auth/user')
  },

  // 更新用户信息
  updateUserInfo(userInfo) {
    return request.put('/auth/user', userInfo)
  },

  // 修改密码
  changePassword(passwordData) {
    return request.put('/auth/password', passwordData)
  },

  // 发送验证码
  sendVerificationCode(email) {
    return request.post('/auth/verification-code', { email })
  },

  // 验证邮箱
  verifyEmail(verificationData) {
    return request.post('/auth/verify-email', verificationData)
  },

  // 重置密码
  resetPassword(resetData) {
    return request.post('/auth/reset-password', resetData)
  },

  // 检查用户名是否可用
  checkUsername(username) {
    return request.get('/auth/check-username', {
      params: { username }
    })
  },

  // 检查邮箱是否可用
  checkEmail(email) {
    return request.get('/auth/check-email', {
      params: { email }
    })
  }
}