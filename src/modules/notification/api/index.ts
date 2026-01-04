/**
 * 通知系统 API
 */
import { http } from '@/core/http'
import type {
  NotificationMessage,
  NotificationQuery,
  NotificationStats,
  NotificationSettings
} from '@/types/notification'

/**
 * 获取通知列表
 */
export function getNotifications(params?: NotificationQuery) {
  return http.get<{
    code: number
    message: string
    data: {
      list: NotificationMessage[]
      total: number
      page: number
      size: number
    }
  }>('/api/v1/notifications', { params })
}

/**
 * 获取通知统计
 */
export function getNotificationStats() {
  return http.get<{
    code: number
    message: string
    data: NotificationStats
  }>('/api/v1/notifications/stats')
}

/**
 * 标记单个通知为已读
 */
export function markAsRead(notificationId: string) {
  return http.put<{
    code: number
    message: string
    data: { success: boolean }
  }>(`/api/v1/notifications/${notificationId}/read`)
}

/**
 * 批量标记为已读
 */
export function markMultipleAsRead(notificationIds: string[]) {
  return http.put<{
    code: number
    message: string
    data: { success: boolean; affected: number }
  }>('/api/v1/notifications/batch-read', {
    ids: notificationIds
  })
}

/**
 * 全部标记为已读
 */
export function markAllAsRead(type?: string) {
  return http.put<{
    code: number
    message: string
    data: { success: boolean; affected: number }
  }>('/api/v1/notifications/read-all', {
    type
  })
}

/**
 * 删除通知
 */
export function deleteNotification(notificationId: string) {
  return http.delete<{
    code: number
    message: string
    data: { success: boolean }
  }>(`/api/v1/notifications/${notificationId}`)
}

/**
 * 批量删除通知
 */
export function deleteMultipleNotifications(notificationIds: string[]) {
  return http.delete<{
    code: number
    message: string
    data: { success: boolean; affected: number }
  }>('/api/v1/notifications/batch', {
    data: { ids: notificationIds }
  })
}

/**
 * 清空所有通知
 */
export function clearAllNotifications(type?: string) {
  return http.delete<{
    code: number
    message: string
    data: { success: boolean; affected: number }
  }>('/api/v1/notifications/clear', {
    params: { type }
  })
}

/**
 * 获取通知设置
 */
export function getNotificationSettings() {
  return http.get<{
    code: number
    message: string
    data: NotificationSettings
  }>('/api/v1/notifications/settings')
}

/**
 * 更新通知设置
 */
export function updateNotificationSettings(settings: Partial<NotificationSettings>) {
  return http.put<{
    code: number
    message: string
    data: NotificationSettings
  }>('/api/v1/notifications/settings', settings)
}

/**
 * WebSocket 端点（用于连接）
 */
export function getWebSocketEndpoint(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = import.meta.env.VITE_WS_HOST || window.location.host
  const path = '/api/v1/notifications/ws'

  return `${protocol}//${host}${path}`
}
