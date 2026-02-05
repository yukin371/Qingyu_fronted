# WebSocket实现备份

**备份日期**: 2026-02-05
**备份原因**: 统一WebSocket服务前的备份

## 概述

项目中存在两套独立的WebSocket实现，分别用于消息系统和通知系统。本文档记录了两套实现的关键差异和功能特性，以便统一重构时保留必要功能。

---

## 原有实现文件

### 1. `src/services/websocket.ts` - 消息系统WebSocket

**类名**: `MessageWebSocketService`
**导出单例**: `messageWebSocket`
**WebSocket路径**: `/ws/messages`

**主要使用位置**:
- `MessageView.vue` - 消息视图组件

**关键特性**:

#### 连接配置
- 从环境变量 `VITE_WS_URL` 读取WebSocket服务器地址（默认: `ws://localhost:3000`）
- 通过URL参数传递token: `?token=${token}`
- 使用API路径配置: `API_PATHS.WEBSOCKET.MESSAGING`

#### 重连策略
- **最大重连次数**: 5次
- **重连延迟**: 指数退避 `3000ms * reconnectAttempts`
  - 第1次: 3000ms
  - 第2次: 6000ms
  - 第3次: 9000ms
  - 第4次: 12000ms
  - 第5次: 15000ms

#### 事件总线集成
- `websocket:connected` - 连接成功时触发
- `websocket:disconnected` - 连接关闭时触发
- `websocket:message` - 收到消息时触发
- `websocket:error` - 连接错误时触发
- `websocket:connection-failed` - 连接失败时触发
- `websocket:max-reconnect-reached` - 达到最大重连次数时触发
- `websocket:fallback-required` - 建议切换到轮询模式时触发

#### 消息格式
```typescript
export type WebSocketMessage = {
  type: string
  data: any
  timestamp: number
}
```

#### 状态管理
- `isConnected` - 连接状态布尔值
- `isManualClose` - 是否手动关闭标记

#### 主要方法
- `connect(token: string, url?: string)` - 连接WebSocket
- `send(message: any)` - 发送消息
- `disconnect()` - 断开连接
- `getConnectionState()` - 获取连接状态

---

### 2. `src/core/services/websocket.service.ts` - 通知系统WebSocket

**类名**: `WebSocketService`
**工厂函数**: `createWebSocketService(config: WebSocketConfig)`
**WebSocket路径**: `/ws/notifications`（通过config.url传入）

**主要使用位置**:
- `notification.service.ts` - 通知服务

**关键特性**:

#### 连接配置
```typescript
export interface WebSocketConfig {
  url: string
  heartbeatInterval?: number    // 默认: 30000ms
  reconnectInterval?: number    // 默认: 3000ms
  maxReconnectAttempts?: number // 默认: 10次
  onMessage?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}
```

#### 状态管理
```typescript
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error'
```

#### 重连策略
- **最大重连次数**: 10次（默认）
- **重连延迟**: 指数退避 `reconnectInterval * 2^reconnectAttempts`
  - 第1次: 3000ms
  - 第2次: 6000ms
  - 第3次: 12000ms
  - 第4次: 24000ms
  - 第5次: 48000ms
  - ...（指数增长）

#### 心跳机制
- 默认心跳间隔: 30000ms
- 心跳消息格式: `{ type: 'ping' }`
- 响应消息格式: `{ type: 'pong' }`（不触发回调）

#### 消息队列
- 连接未建立时，消息自动加入队列
- 连接成功后，自动发送队列中的消息

#### 桌面通知
支持ElNotification集成：
- `comment` / `like` / `follow` → success类型
- `system` → warning类型
- `error` → error类型
- 位置: top-right
- 持续时间: 4000ms

#### 消息处理
```typescript
// 通知消息格式
{
  type: 'notification',
  data: {
    title: string
    content: string
    type?: string  // comment, like, follow, system, error
  }
}
```

#### 主要方法
- `connect(): Promise<void>` - 连接WebSocket（返回Promise）
- `disconnect(): void` - 断开连接
- `send(data: any): void` - 发送消息
- `getState(): WebSocketState` - 获取连接状态
- `isConnected(): boolean` - 检查是否已连接

---

## 关键差异对比

| 特性 | MessageWebSocketService | WebSocketService |
|------|------------------------|------------------|
| **用途** | 消息系统 | 通知系统 |
| **路径** | `/ws/messages` | `/ws/notifications` |
| **导出方式** | 单例 `messageWebSocket` | 工厂函数 `createWebSocketService` |
| **最大重连次数** | 5次 | 10次（可配置） |
| **重连策略** | `3000ms * attempts` | `interval * 2^attempts` |
| **心跳机制** | ❌ 无 | ✅ 支持（可配置） |
| **消息队列** | ❌ 无 | ✅ 支持 |
| **事件总线** | ✅ 完整集成 | ❌ 无（使用回调） |
| **桌面通知** | ❌ 无 | ✅ ElNotification集成 |
| **连接状态** | `boolean` | `enum WebSocketState` |
| **降级支持** | ✅ 触发`fallback-required`事件 | ❌ 无 |
| **Promise API** | ❌ 无 | ✅ connect返回Promise |

---

## 需要保留的功能

### 必须保留

1. **两种消息类型区分**
   - 消息系统消息 (`/ws/messages`)
   - 通知系统消息 (`/ws/notifications`)

2. **不同的重连策略**
   - 消息系统: 5次，线性增长
   - 通知系统: 10次，指数增长

3. **事件总线集成**
   - 兼容现有的事件监听代码
   - 保留所有现有事件名称

4. **轮询降级支持**
   - 保留`websocket:fallback-required`事件触发机制
   - 在最大重连次数达到时通知

5. **心跳机制**
   - 从通知系统服务保留心跳功能
   - 支持可配置的心跳间隔

6. **消息队列**
   - 从通知系统服务保留消息队列功能
   - 连接恢复后自动发送队列消息

7. **桌面通知**
   - 保留ElNotification集成
   - 支持不同通知类型的样式区分

### 可选优化

1. **统一状态管理**
   - 使用更精确的状态枚举替代布尔值

2. **Promise API**
   - 为connect方法提供Promise支持

3. **配置灵活性**
   - 支持运行时配置所有参数

---

## 使用示例

### MessageWebSocketService 使用示例

```typescript
import { messageWebSocket } from '@/services/websocket'

// 连接
const token = localStorage.getItem('token')
messageWebSocket.connect(token)

// 监听事件
eventBus.on('websocket:message', (message) => {
  console.log('收到消息:', message)
})

// 断开连接
messageWebSocket.disconnect()
```

### WebSocketService 使用示例

```typescript
import { createWebSocketService } from '@/core/services/websocket.service'

// 创建实例
const wsService = createWebSocketService({
  url: 'ws://localhost:3000/ws/notifications',
  heartbeatInterval: 30000,
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  onMessage: (data) => {
    console.log('收到消息:', data)
  },
  onConnect: () => {
    console.log('已连接')
  }
})

// 连接
await wsService.connect()

// 发送消息
wsService.send({ type: 'ping' })

// 断开连接
wsService.disconnect()
```

---

## 迁移注意事项

1. **向后兼容**: 新实现需要提供与现有API兼容的接口
2. **事件名称**: 保持所有现有事件名称不变
3. **导入路径**: 确保现有导入路径继续工作
4. **类型定义**: 保留现有的TypeScript类型定义
5. **配置灵活性**: 支持两种服务的不同配置需求

---

**文档版本**: 1.0
**维护者**: Qingyu Team
**最后更新**: 2026-02-05
