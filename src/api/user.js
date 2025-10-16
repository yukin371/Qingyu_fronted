import request from '@/utils/request'

/**
 * 用户管理API接口
 * 基于后端 API v1.0
 */
export const userAPI = {
  // ==================== 公开接口 ====================

  /**
   * 用户注册
   * @param {Object} userData - 注册信息
   * @param {string} userData.username - 用户名 (3-50字符)
   * @param {string} userData.email - 邮箱地址
   * @param {string} userData.password - 密码 (最少6字符)
   * @returns {Promise} 注册响应 (包含token)
   */
  register(userData) {
    return request.post('/register', userData)
  },

  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名或邮箱
   * @param {string} credentials.password - 密码
   * @returns {Promise} 登录响应 (包含token)
   */
  login(credentials) {
    return request.post('/login', credentials)
  },

  // ==================== 用户接口（需要认证）====================

  /**
   * 获取当前用户信息
   * @returns {Promise} 用户详细信息
   */
  getProfile() {
    return request.get('/users/profile')
  },

  /**
   * 更新当前用户信息
   * @param {Object} userInfo - 更新的用户信息
   * @param {string} [userInfo.nickname] - 昵称 (最多50字符)
   * @param {string} [userInfo.bio] - 个人简介 (最多500字符)
   * @param {string} [userInfo.avatar] - 头像URL
   * @param {string} [userInfo.phone] - 手机号 (E.164格式)
   * @returns {Promise} 更新响应
   */
  updateProfile(userInfo) {
    return request.put('/users/profile', userInfo)
  },

  /**
   * 修改密码
   * @param {Object} passwordData - 密码信息
   * @param {string} passwordData.old_password - 当前密码
   * @param {string} passwordData.new_password - 新密码 (最少6字符)
   * @returns {Promise} 修改响应
   */
  changePassword(passwordData) {
    return request.put('/users/password', passwordData)
  },

  // ==================== 管理员接口 ====================

  /**
   * 获取用户列表（管理员）
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.page_size=10] - 每页数量
   * @param {string} [params.username] - 用户名筛选
   * @param {string} [params.email] - 邮箱筛选
   * @param {string} [params.role] - 角色筛选 (user/author/admin)
   * @param {string} [params.status] - 状态筛选 (active/inactive/banned/deleted)
   * @returns {Promise} 用户列表（分页）
   */
  getUserList(params) {
    return request.get('/admin/users', { params })
  },

  /**
   * 获取指定用户信息（管理员）
   * @param {string} userId - 用户ID
   * @returns {Promise} 用户详细信息
   */
  getUser(userId) {
    return request.get(`/admin/users/${userId}`)
  },

  /**
   * 更新用户信息（管理员）
   * @param {string} userId - 用户ID
   * @param {Object} userData - 更新的用户信息
   * @param {string} [userData.nickname] - 昵称
   * @param {string} [userData.bio] - 个人简介
   * @param {string} [userData.avatar] - 头像URL
   * @param {string} [userData.phone] - 手机号
   * @param {string} [userData.role] - 用户角色 (user/author/admin)
   * @param {string} [userData.status] - 用户状态 (active/inactive/banned/deleted)
   * @param {boolean} [userData.email_verified] - 邮箱验证状态
   * @param {boolean} [userData.phone_verified] - 手机验证状态
   * @returns {Promise} 更新响应
   */
  updateUser(userId, userData) {
    return request.put(`/admin/users/${userId}`, userData)
  },

  /**
   * 删除用户（管理员）
   * @param {string} userId - 用户ID
   * @returns {Promise} 删除响应
   */
  deleteUser(userId) {
    return request.delete(`/admin/users/${userId}`)
  },

  // ==================== 辅助方法 ====================

  /**
   * 批量操作用户（管理员）
   * @param {Object} data - 批量操作数据
   * @param {string[]} data.user_ids - 用户ID列表
   * @param {string} data.action - 操作类型 (activate/deactivate/ban/delete)
   * @returns {Promise} 操作响应
   */
  batchOperation(data) {
    return request.post('/admin/users/batch', data)
  },

  /**
   * 导出用户数据（管理员）
   * @param {Object} params - 导出参数
   * @returns {Promise} 导出文件
   */
  exportUsers(params) {
    return request.get('/admin/users/export', {
      params,
      responseType: 'blob'
    })
  }
}

export default userAPI

