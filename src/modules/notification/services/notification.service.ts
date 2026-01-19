/**
 * 通知服务
 * 整合 WebSocket 和轮询降级方案
 */
import { WebSocketService, createWebSocketService } from '@/core/services/websocket.service'
import { PollingService, createPollingService } from '@/core/services/polling.service'
import { httpService } from '@/core/services/http.service'
import { getWebSocketEndpoint } from '../api'
import type { NotificationMessage, NotificationQuery, NotificationStats } from '@/types/notification'

export type ConnectionMode = 'websocket' | 'polling'

export class NotificationService {
  private wsService: WebSocketService | null = null
  private pollingService: PollingService | null = null
  private currentMode: ConnectionMode = 'websocket'
  private messageHandlers: Set<(message: NotificationMessage) => void> = new Set()

  /**
   * 初始化通知系统
   */
  async initialize(): Promise<void> {
    // 尝试使用 WebSocket
    try {
      await this.initializeWebSocket()
      console.log('[NotificationService] WebSocket 模式初始化成功')
    } catch (error) {
      console.warn('[NotificationService] WebSocket 初始化失败，切换到轮询模式')
      this.initializePolling()
    }
  }

  /**
   * 初始化 WebSocket
   */
  private async initializeWebSocket(): Promise<void> {
    const wsEndpoint = await getWebSocketEndpoint()
    const url = typeof wsEndpoint === 'string' ? wsEndpoint : (wsEndpoint as any)?.url || ''

    this.wsService = createWebSocketService({
      url: url,
      heartbeatInterval: 30000,
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      onMessage: (data) => {
        this.handleMessage(data)
      },
      onConnect: () => {
        console.log('[NotificationService] WebSocket 已连接')
        this.currentMode = 'websocket'
      },
      onDisconnect: () => {
        console.log('[NotificationService] WebSocket 断开，尝试切换到轮询')
        this.fallbackToPolling()
      },
      onError: (error) => {
        console.error('[NotificationService] WebSocket 错误:', error)
      }
    })

    await this.wsService.connect()
  }

  /**
   * 初始化轮询
   */
  private initializePolling(): void {
    this.pollingService = createPollingService({
      axios: httpService,
      endpoint: '/api/v1/notifications/polling',
      interval: 30000,
      minInterval: 10000,
      maxInterval: 120000,
      adaptive: true,
      onMessage: (messages: NotificationMessage[]) => {
        messages.forEach(msg => this.notifyHandlers(msg))
      },
      onError: (error) => {
        console.error('[NotificationService] 轮询错误:', error)
      }
    })

    this.pollingService.start()
    this.currentMode = 'polling'
  }

  /**
   * 降级到轮询
   */
  private fallbackToPolling(): void {
    if (this.currentMode === 'websocket') {
      this.currentMode = 'polling'

      // 关闭 WebSocket
      if (this.wsService) {
        this.wsService.disconnect()
      }

      // 启动轮询
      this.initializePolling()
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: any): void {
    if (data.type === 'notification' && data.data) {
      const message: NotificationMessage = data.data
      this.notifyHandlers(message)
    }
  }

  /**
   * 通知所有消息处理器
   */
  private notifyHandlers(message: NotificationMessage): void {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('[NotificationService] 消息处理错误:', error)
      }
    })
  }

  /**
   * 订阅消息
   */
  onMessage(handler: (message: NotificationMessage) => void): () => void {
    this.messageHandlers.add(handler)

    // 返回取消订阅函数
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  /**
   * 获取通知列表
   */
  async getNotifications(params?: NotificationQuery): Promise<{
    list: NotificationMessage[]
    total: number
    page: number
    size: number
  }> {
    const { data } = await httpService.get<{
      code: number
      message: string
      data: {
        list: NotificationMessage[]
        total: number
        page: number
        size: number
      }
    }>('/api/v1/notifications', { params })

    return data
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(): Promise<NotificationStats> {
    const { data } = await httpService.get<{
      code: number
      message: string
      data: NotificationStats
    }>('/api/v1/notifications/stats')

    return data
  }

  /**
   * 标记已读
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const { data } = await httpService.put<{
      code: number
      message: string
      data: { success: boolean }
    }>(`/api/v1/notifications/${notificationId}/read`)

    return data.success
  }

  /**
   * 全部标记为已读
   */
  async markAllAsRead(type?: string): Promise<{ success: boolean; affected: number }> {
    const { data } = await httpService.put<{
      code: number
      message: string
      data: { success: boolean; affected: number }
    }>('/api/v1/notifications/read-all', { type })

    return data
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const { data } = await httpService.delete<{
      code: number
      message: string
      data: { success: boolean }
    }>(`/api/v1/notifications/${notificationId}`)

    return data.success
  }

  /**
   * 获取当前连接模式
   */
  getConnectionMode(): ConnectionMode {
    return this.currentMode
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    if (this.currentMode === 'websocket') {
      return this.wsService?.isConnected() ?? false
    }
    return this.pollingService?.isRunning() ?? false
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.wsService) {
      this.wsService.disconnect()
    }

    if (this.pollingService) {
      this.pollingService.stop()
    }

    this.messageHandlers.clear()
    this.currentMode = 'websocket'
  }
}

// 单例实例
let notificationServiceInstance: NotificationService | null = null

/**
 * 获取通知服务实例
 */
export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService()
  }
  return notificationServiceInstance
}

/**
 * 初始化通知服务
 */
export async function initNotificationService(): Promise<NotificationService> {
  const service = getNotificationService()
  await service.initialize()
  return service
}
