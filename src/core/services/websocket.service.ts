/**
 * WebSocket 核心服务
 * 提供实时消息推送功能，支持自动重连、心跳保活、消息队列
 */
import { notification } from '@/design-system/services'
export interface WebSocketConfig {
  url: string
  heartbeatInterval?: number  // 心跳间隔（毫秒）
  reconnectInterval?: number  // 重连间隔（毫秒）
  maxReconnectAttempts?: number  // 最大重连次数
  onMessage?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error'

export class WebSocketService {
  private ws: WebSocket | null = null
  private config: Required<WebSocketConfig>
  private state: WebSocketState = 'disconnected'
  private heartbeatTimer: number | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private messageQueue: any[] = []
  private manuallyClosed = false

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      reconnectInterval: config.reconnectInterval ?? 3000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      onMessage: config.onMessage ?? (() => {}),
      onConnect: config.onConnect ?? (() => {}),
      onDisconnect: config.onDisconnect ?? (() => {}),
      onError: config.onError ?? (() => {})
    }
  }

  /**
   * 连接 WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      this.manuallyClosed = false
      this.state = 'connecting'

      try {
        // 获取 token 并添加到 URL
        const token = localStorage.getItem('token')
        const url = token
          ? `${this.config.url}?token=${token}`
          : this.config.url

        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log('[WebSocket] 连接成功')
          this.state = 'connected'
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.sendQueuedMessages()
          this.config.onConnect()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          console.error('[WebSocket] 连接错误:', error)
          this.state = 'error'
          this.config.onError(error)
          reject(error)
        }

        this.ws.onclose = (event) => {
          console.log('[WebSocket] 连接关闭:', event.code, event.reason)
          this.state = 'disconnected'
          this.stopHeartbeat()
          this.config.onDisconnect()

          // 如果不是手动关闭，尝试重连
          if (!this.manuallyClosed) {
            this.scheduleReconnect()
          }
        }
      } catch (error) {
        console.error('[WebSocket] 创建连接失败:', error)
        this.state = 'error'
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.manuallyClosed = true
    this.stopHeartbeat()
    this.clearReconnectTimer()

    if (this.ws) {
      this.ws.close(1000, '客户端主动关闭')
      this.ws = null
    }

    this.state = 'disconnected'
  }

  /**
   * 发送消息
   */
  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data)

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      // 连接未建立，将消息加入队列
      console.log('[WebSocket] 连接未建立，消息加入队列')
      this.messageQueue.push(data)

      // 尝试重新连接
      if (this.state === 'disconnected') {
        this.connect().catch(console.error)
      }
    }
  }

  /**
   * 获取连接状态
   */
  getState(): WebSocketState {
    return this.state
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)

      // 心跳响应，不处理
      if (message.type === 'pong') {
        return
      }

      // 触发消息回调
      this.config.onMessage(message)

      // 如果是通知消息，显示通知
      if (message.type === 'notification') {
        this.showNotification(message.data)
      }
    } catch (error) {
      console.error('[WebSocket] 解析消息失败:', error)
    }
  }

  /**
   * 显示桌面通知
   */
  private showNotification(data: {
    title: string
    content: string
    type?: string
  }): void {
    // 根据通知类型设置图标
    let type: 'success' | 'warning' | 'info' | 'error' = 'info'

    switch (data.type) {
      case 'comment':
      case 'like':
      case 'follow':
        type = 'success'
        break
      case 'system':
        type = 'warning'
        break
      case 'error':
        type = 'error'
        break
    }

    ElNotification({
      title: data.title,
      message: data.content,
      type,
      duration: 4000,
      position: 'top-right'
    })
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    // 清除现有定时器
    this.clearReconnectTimer()

    // 检查重连次数
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] 达到最大重连次数，停止重连')
      return
    }

    // 指数退避
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts)
    console.log(`[WebSocket] ${delay}ms 后尝试第 ${this.reconnectAttempts + 1} 次重连`)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      this.connect().catch(console.error)
    }, delay)
  }

  /**
   * 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 发送队列中的消息
   */
  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      this.ws.send(data)
    }
  }
}

/**
 * 创建 WebSocket 服务实例
 */
export function createWebSocketService(config: WebSocketConfig): WebSocketService {
  return new WebSocketService(config)
}
