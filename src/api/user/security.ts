/**
 * 用户安全功能API
 * 根据后端API需求文档 (Qingyu_backend/doc/api/frontend/用户安全功能API需求.md)
 * 注意：这些API后端尚未实现，需要后端开发
 */

import request from '@/utils/request'

/**
 * 发送手机验证码
 * POST /api/v1/users/verify/phone/send
 */
export function sendPhoneVerifyCode(phone: string, type: 'bind' | 'change' | 'unbind' = 'bind') {
  return request.post('/users/verify/phone/send', {
    phone,
    type
  })
}

/**
 * 绑定手机号
 * POST /api/v1/users/phone/bind
 */
export function bindPhone(data: {
  phone: string
  code: string
}) {
  return request.post('/users/phone/bind', data)
}

/**
 * 更换手机号
 * PUT /api/v1/users/phone/change
 */
export function changePhone(data: {
  newPhone: string
  code: string
  oldPhoneCode?: string
}) {
  return request.put('/users/phone/change', data)
}

/**
 * 解绑手机号
 * DELETE /api/v1/users/phone/unbind
 */
export function unbindPhone(code: string) {
  return request.delete('/users/phone/unbind', {
    data: { code }
  })
}

/**
 * 发送邮箱验证码
 * POST /api/v1/users/verify/email/send
 */
export function sendEmailVerifyCode(email: string, type: 'bind' | 'change' | 'unbind' | 'verify' = 'bind') {
  return request.post('/users/verify/email/send', {
    email,
    type
  })
}

/**
 * 绑定邮箱
 * POST /api/v1/users/email/bind
 */
export function bindEmail(data: {
  email: string
  code: string
}) {
  return request.post('/users/email/bind', data)
}

/**
 * 更换邮箱
 * PUT /api/v1/users/email/change
 */
export function changeEmail(data: {
  newEmail: string
  code: string
  oldEmailCode?: string
}) {
  return request.put('/users/email/change', data)
}

/**
 * 解绑邮箱
 * DELETE /api/v1/users/email/unbind
 */
export function unbindEmail(code: string) {
  return request.delete('/users/email/unbind', {
    data: { code }
  })
}

/**
 * 验证邮箱（发送验证邮件）
 * POST /api/v1/users/email/verify
 */
export function verifyEmail() {
  return request.post('/users/email/verify')
}

/**
 * 修改密码
 * PUT /api/v1/users/password/change
 */
export function changePassword(data: {
  oldPassword: string
  newPassword: string
}) {
  return request.put('/users/password/change', data)
}

/**
 * 发送密码重置验证码
 * POST /api/v1/users/password/reset/send
 */
export function sendPasswordResetCode(account: string) {
  return request.post('/users/password/reset/send', {
    account
  })
}

/**
 * 验证重置码
 * POST /api/v1/users/password/reset/verify
 */
export function verifyResetCode(account: string, code: string) {
  return request.post('/users/password/reset/verify', {
    account,
    code
  })
}

/**
 * 重置密码
 * POST /api/v1/users/password/reset
 */
export function resetPassword(data: {
  account: string
  code: string
  newPassword: string
}) {
  return request.post('/users/password/reset', data)
}

/**
 * 获取登录设备列表
 * GET /api/v1/users/devices
 */
export function getLoginDevices(params?: {
  page?: number
  size?: number
}) {
  return request.get('/users/devices', { params })
}

/**
 * 移除登录设备
 * DELETE /api/v1/users/devices/:deviceId
 */
export function removeDevice(deviceId: string) {
  return request.delete(`/users/devices/${deviceId}`)
}

/**
 * 注销账号
 * POST /api/v1/users/cancel
 */
export function cancelAccount(data: {
  password: string
  reason?: string
}) {
  return request.post('/users/cancel', data)
}

/**
 * 登录设备类型定义
 */
export interface LoginDevice {
  id: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'other'
  browser?: string
  os?: string
  ip: string
  location?: string
  lastActiveTime: string
  isCurrent: boolean
  createdAt: string
}

