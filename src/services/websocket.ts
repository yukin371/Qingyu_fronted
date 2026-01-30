import { eventBus } from '@/utils/eventBus'
import { API_PATHS } from '@/config/apiPaths'

export type WebSocketMessage = {
  type: string
  data: any
  timestamp: number
}

export class MessageWebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isConnected = false
  private isManualClose = false

  /**
   * 连接WebSocket服务
   * @param token 用户认证token
   * @param url WebSocket服务器地址（默认：从环境变量读取）
   */
  connect(token: string, url?: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] 已经连接')
      return
    }

    this.isManualClose = false

    // 使用API路径配置
    const wsPath = API_PATHS.WEBSOCKET.MESSAGING  // /ws/messages
    // 从环境变量读取WebSocket服务器地址
    const wsBaseUrl = url || import.meta.env.VITE_WS_URL || 'ws://localhost:3000'
    const wsUrl = `${wsBaseUrl}${wsPath}?token=${token}`

    console.log('[WebSocket] 正在连接:', wsUrl)

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('[WebSocket] 消息服务已连接')
        this.isConnected = true
        this.reconnectAttempts = 0
        eventBus.emit('websocket:connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          eventBus.emit('websocket:message', message)
        } catch (error) {
          console.error('[WebSocket] 消息解析失败:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('[WebSocket] 错误:', error)
        eventBus.emit('websocket:error', error)

        // 如果是连接错误且未达到最大重连次数,触发降级
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[WebSocket] 达到最大重连次数,建议切换到轮询模式')
          eventBus.emit('websocket:fallback-required')
        }
      }

      this.ws.onclose = (event) => {
        console.log('[WebSocket] 连接已关闭', event.code, event.reason)
        this.isConnected = false
        eventBus.emit('websocket:disconnected')

        // 只有非手动关闭的情况下才尝试重连
        if (!this.isManualClose) {
          this.reconnect()
        }
      }
    } catch (error) {
      console.error('[WebSocket] 连接失败:', error)
      eventBus.emit('websocket:connection-failed', error)

      // 连接失败时尝试重连
      if (!this.isManualClose) {
        this.reconnect()
      }
    }
  }

  /**
   * 自动重连
   */
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] 达到最大重连次数，停止重连')
      eventBus.emit('websocket:max-reconnect-reached')
      return
    }

    this.reconnectAttempts++
    const delay = 3000 * this.reconnectAttempts

    console.log(`[WebSocket] ${delay}ms后尝试第${this.reconnectAttempts}次重连`)

    this.reconnectTimer = setTimeout(() => {
      // 需要从用户store获取token
      const token = localStorage.getItem('token') || ''
      if (token) {
        this.connect(token)
      }
    }, delay)
  }

  /**
   * 发送消息
   */
  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('[WebSocket] 未连接，无法发送消息')
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.isManualClose = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.ws?.close()
    this.ws = null
    this.isConnected = false
  }

  /**
   * 获取连接状态
   */
  getConnectionState() {
    return this.isConnected
  }
}

// 导出单例
export const messageWebSocket = new MessageWebSocketService()
