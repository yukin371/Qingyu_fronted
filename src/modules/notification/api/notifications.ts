/**
 * 通知系统 API
 */
import request from '../request'

// 通知类型
export type NotificationType = 'system' | 'comment' | 'like' | 'follow' | 'message' | 'achievement'

// 通知状态
export type NotificationStatus = 'unread' | 'read' | 'deleted'

// 通知优先级
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

// 通知渠道
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'push'

// 通知
export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  content: string
  data?: Record<string, any>
  priority: NotificationPriority
  channels: NotificationChannel[]
  status: NotificationStatus
  read_at?: string
  created_at: string
  expires_at?: string
}

// 通知偏好
export interface NotificationPreference {
  user_id: string
  channel_enabled: Record<NotificationChannel, boolean>
  type_enabled: Record<NotificationType, boolean>
  quiet_hours_start?: string
  quiet_hours_end?: string
}

// 通知统计
export interface NotificationStats {
  total: number
  unread: number
  by_type: Record<NotificationType, number>
}

/**
 * 获取通知列表
 */
export function getNotifications(params: {
  page?: number
  page_size?: number
  type?: NotificationType
  status?: NotificationStatus
}) {
  return request<{
    items: Notification[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/notifications',
    method: 'get',
    params
  })
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount() {
  return request<{ count: number }>({
    url: '/api/v1/notifications/unread-count',
    method: 'get'
  })
}

/**
 * 获取通知统计
 */
export function getNotificationStats() {
  return request<NotificationStats>({
    url: '/api/v1/notifications/stats',
    method: 'get'
  })
}

/**
 * 标记通知为已读
 */
export function markAsRead(notificationId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/notifications/${notificationId}/read`,
    method: 'post'
  })
}

/**
 * 批量标记为已读
 */
export function markMultipleAsRead(notificationIds: string[]) {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/batch-read',
    method: 'post',
    data: { notification_ids: notificationIds }
  })
}

/**
 * 标记所有通知为已读
 */
export function markAllAsRead() {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/read-all',
    method: 'post'
  })
}

/**
 * 删除通知
 */
export function deleteNotification(notificationId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/notifications/${notificationId}`,
    method: 'delete'
  })
}

/**
 * 批量删除通知
 */
export function deleteMultipleNotifications(notificationIds: string[]) {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/batch-delete',
    method: 'post',
    data: { notification_ids: notificationIds }
  })
}

/**
 * 清空所有已读通知
 */
export function clearReadNotifications() {
  return request<{ success: boolean; count: number }>({
    url: '/api/v1/notifications/clear-read',
    method: 'post'
  })
}

/**
 * 获取通知偏好设置
 */
export function getNotificationPreference() {
  return request<NotificationPreference>({
    url: '/api/v1/notifications/preferences',
    method: 'get'
  })
}

/**
 * 更新通知偏好设置
 */
export function updateNotificationPreference(data: Partial<NotificationPreference>) {
  return request<NotificationPreference>({
    url: '/api/v1/notifications/preferences',
    method: 'put',
    data
  })
}

/**
 * 重新发送通知
 */
export function resendNotification(notificationId: string, channels: NotificationChannel[]) {
  return request<{ success: boolean }>({
    url: `/api/v1/notifications/${notificationId}/resend`,
    method: 'post',
    data: { channels }
  })
}

/**
 * 获取WebSocket端点
 */
export function getWebSocketEndpoint() {
  return request<{ url: string }>({
    url: '/api/v1/notifications/ws-endpoint',
    method: 'get'
  })
}
