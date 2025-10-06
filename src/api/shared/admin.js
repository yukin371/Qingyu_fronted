import request from '@/utils/request'

/**
 * 共享管理服务API
 */

// 获取待审核内容
export const getPendingReviews = (params) => {
  return request({
    url: '/shared/admin/reviews/pending',
    method: 'get',
    params
  })
}

// 审核内容
export const reviewContent = (data) => {
  return request({
    url: '/shared/admin/reviews',
    method: 'post',
    data
  })
}

// 审核提现
export const reviewWithdraw = (data) => {
  return request({
    url: '/shared/admin/withdraw/review',
    method: 'post',
    data
  })
}

// 获取用户统计
export const getUserStatistics = (userId) => {
  return request({
    url: `/shared/admin/users/${userId}/statistics`,
    method: 'get'
  })
}

// 获取操作日志
export const getOperationLogs = (params) => {
  return request({
    url: '/shared/admin/operation-logs',
    method: 'get',
    params
  })
}

