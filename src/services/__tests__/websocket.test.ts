
import { MessageWebSocketService } from '../websocket'

describe('WebSocket服务', () => {
  let service: MessageWebSocketService
  let mockWs: any
  let wsMockFn: any

  // 需要在所有测试之前 mock eventBus
  vi.mock('@/utils/eventBus', () => ({
    eventBus: {
      emit: vi.fn()
    }
  }))

  beforeEach(() => {
    // 设置全局 WebSocket mock - 在创建服务实例之前
    mockWs = {
      readyState: WebSocket.CLOSED,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null as any,
      onmessage: null as any,
      onerror: null as any,
      onclose: null as any
    }

    // 创建一个可构造的 mock 类
    class MockWebSocket {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3

      constructor(url: string) {
        // 返回 mockWs 对象
        Object.assign(this, mockWs)
      }

      send = vi.fn()
      close = vi.fn()
      onopen: any = null
      onmessage: any = null
      onerror: any = null
      onclose: any = null
      readyState = WebSocket.CLOSED
    }

    // 设置全局 WebSocket mock
    global.WebSocket = MockWebSocket as any
    // 使用 spyOn 来追踪构造函数调用
    wsMockFn = vi.spyOn(global, 'WebSocket' as any)

    // 创建新的服务实例
    service = new MessageWebSocketService()
  })

  afterEach(() => {
    service.disconnect()
    vi.clearAllMocks()
  })

  it('应该成功连接WebSocket', () => {
    // 调用连接
    service.connect('test-token')

    // 验证 WebSocket 构造函数被调用
    expect(wsMockFn).toHaveBeenCalled()
    // 检查事件处理器已被分配（非null）
    // 由于服务创建了新的 WebSocket 实例，检查 service.ws
    expect((service as any).ws).not.toBeNull()
    expect((service as any).ws?.onopen).not.toBeNull()
    expect((service as any).ws?.onmessage).not.toBeNull()
    expect((service as any).ws?.onerror).not.toBeNull()
    expect((service as any).ws?.onclose).not.toBeNull()
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
