import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MessageWebSocketService } from '../websocket'

describe('WebSocket服务', () => {
  let service: MessageWebSocketService

  beforeEach(() => {
    service = new MessageWebSocketService()
  })

  afterEach(() => {
    service.disconnect()
  })

  it('应该成功连接WebSocket', () => {
    const mockWs = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn()
    }

    global.WebSocket = vi.fn(() => mockWs) as any

    service.connect('test-token')

    expect(mockWs.onopen).toBeDefined()
    expect(mockWs.onmessage).toBeDefined()
    expect(mockWs.onerror).toBeDefined()
    expect(mockWs.onclose).toBeDefined()
  })

  it('应该在断开后自动重连', () => {
    const mockWs = {
      readyState: WebSocket.CLOSED,
      send: vi.fn(),
      close: vi.fn()
    }

    global.WebSocket = vi.fn(() => mockWs) as any

    service.connect('test-token')

    // 触发onclose
    mockWs.onclose?.(new CloseEvent('close'))

    // 验证重连逻辑
    expect(service['reconnectAttempts']).toBeGreaterThan(0)
  })

  it('应该达到最大重连次数后停止', () => {
    service['maxReconnectAttempts'] = 2

    const mockWs = {
      readyState: WebSocket.CLOSED,
      send: vi.fn(),
      close: vi.fn()
    }

    global.WebSocket = vi.fn(() => mockWs) as any

    // 连续触发3次onclose
    for (let i = 0; i < 3; i++) {
      mockWs.onclose?.(new CloseEvent('close'))
    }

    // 验证达到最大次数
    expect(service['reconnectAttempts']).toBe(2)
  })
})
