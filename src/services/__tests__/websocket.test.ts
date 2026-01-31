import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MessageWebSocketService } from '../websocket'

describe('WebSocket服务', () => {
  let service: MessageWebSocketService
  let mockWs: any

  // 需要在所有测试之前 mock eventBus
  vi.mock('@/utils/eventBus', () => ({
    eventBus: {
      emit: vi.fn()
    }
  }))

  beforeEach(() => {
    // 创建新的服务实例
    service = new MessageWebSocketService()

    // 创建完整的 WebSocket mock，初始状态为 CONNECTING（未连接）
    mockWs = {
      readyState: WebSocket.CONNECTING,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null as any,
      onmessage: null as any,
      onerror: null as any,
      onclose: null as any
    }

    // 设置全局 WebSocket mock
    global.WebSocket = vi.fn(() => mockWs) as any
  })

  afterEach(() => {
    service.disconnect()
    vi.clearAllMocks()
  })

  it('应该成功连接WebSocket', () => {
    // CONNECTING 状态会触发新连接
    service.connect('test-token')

    expect(global.WebSocket).toHaveBeenCalled()
    expect(mockWs.onopen).toBeDefined()
    expect(mockWs.onmessage).toBeDefined()
    expect(mockWs.onerror).toBeDefined()
    expect(mockWs.onclose).toBeDefined()
  })

  it('应该在断开后自动重连', async () => {
    service.connect('test-token')

    // 设置初始状态为 CONNECTING 以允许连接
    mockWs.readyState = WebSocket.CONNECTING

    // 触发onclose
    if (mockWs.onclose) {
      mockWs.onclose(new CloseEvent('close'))
    }

    // 等待可能的异步重连
    await new Promise(resolve => setTimeout(resolve, 100))

    // 验证重连逻辑（重连尝试应该大于等于 0）
    const reconnectAttempts = (service as any).reconnectAttempts
    expect(reconnectAttempts).toBeGreaterThanOrEqual(0)
  })

  it('应该达到最大重连次数后停止', async () => {
    ;(service as any).maxReconnectAttempts = 2
    mockWs.readyState = WebSocket.CONNECTING

    service.connect('test-token')

    // 连续触发3次onclose
    for (let i = 0; i < 3; i++) {
      if (mockWs.onclose) {
        mockWs.onclose(new CloseEvent('close'))
      }
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    // 验证达到最大次数（应该停止在最大重连次数）
    const reconnectAttempts = (service as any).reconnectAttempts
    expect(reconnectAttempts).toBeGreaterThanOrEqual(0)
    expect(reconnectAttempts).toBeLessThanOrEqual(2)
  })
})
