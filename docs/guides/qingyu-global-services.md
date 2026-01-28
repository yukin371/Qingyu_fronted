# Qingyu 全局服务使用文档

**版本**: 1.0.0
**更新日期**: 2026-01-25

---

## 📖 概述

Qingyu 设计系统提供了三个全局服务，用于替代 Element Plus 的 `ElMessage`、`ElMessageBox` 和 `ElNotification`。

**兼容性**: 这些服务完全兼容 Element Plus 的 API，可以直接替换使用。

---

## 🔔 Message 消息提示

### 基础用法

```typescript
import { message } from '@/design-system/services'

// 或者在组件中使用
import { useMessage } from '@/design-system/services'
const { message } = useMessage()

// 成功消息
message.success('操作成功！')

// 信息消息
message.info('这是一条提示信息')

// 警告消息
message.warning('请注意，这是一个警告')

// 错误消息
message.error('操作失败，请重试')
```

### 高级用法

```typescript
// 自定义选项
message.show({
  message: '这是一条自定义消息',
  type: 'success',
  duration: 5000,  // 持续时间（毫秒）
  showClose: true,  // 显示关闭按钮
  center: true,     // 居中显示
  offset: 100,      // 距离顶部的偏移量
  onClose: () => {  // 关闭回调
    console.log('消息已关闭')
  }
})

// 返回的 handler 可以手动关闭
const handler = message.success('这条消息可以通过代码关闭')

// 3秒后手动关闭
setTimeout(() => {
  handler.close()
}, 3000)
```

### 全局属性访问

在模板或其他地方可以通过全局属性访问：

```vue
<template>
  <button @click="$message.success('成功！')">
    点击成功
  </button>
</template>
```

---

## 📋 MessageBox 消息框

### 基础用法

```typescript
import { messageBox } from '@/design-system/services'

// 或者在组件中使用
import { useMessageBox } from '@/design-system/services'
const { messageBox } = useMessageBox()

// alert - 只有一个确认按钮
messageBox.alert('这是一条提示信息')

// confirm - 有确认和取消按钮
messageBox.confirm('确定要执行此操作吗？')

// prompt - 带输入框
messageBox.prompt('请输入您的邮箱', '邮箱验证')
```

### 高级用法

```typescript
// 带标题的消息框
messageBox.alert('操作成功！', '提示')

// 带自定义选项的消息框
messageBox.confirm('确定要删除这条记录吗？', '删除确认', {
  type: 'alert',
  confirmButtonText: '删除',
  cancelButtonText: '取消',
  showCancelButton: true,
  showIcon: true,
  center: true,
  beforeClose: (action, instance) => {
    if (action === 'confirm') {
      // 执行删除操作
      return true  // 返回 false 可以阻止关闭
    }
  }
})
.then(() => {
  // 点击确认按钮
  console.log('已确认')
})
.catch(() => {
  // 点击取消按钮
  console.log('已取消')
})

// Prompt 输入框
messageBox.prompt('请输入您的用户名', '用户名', {
  inputPlaceholder: '请输入用户名',
  inputPattern: /^[a-zA-Z0-9]{4,16}$/,
  inputErrorMessage: '用户名格式不正确'
})
.then(({ value }) => {
  console.log('输入的值:', value)
})
```

### TypeScript 类型

```typescript
import type { MessageBoxResult } from '@/design-system/services'

const result: MessageBoxResult = await messageBox.confirm('确定吗？')

if (result.action === 'confirm') {
  console.log('用户点击了确认')
} else if (result.action === 'cancel') {
  console.log('用户点击了取消')
}

// 对于 prompt，还可以获取输入的值
const promptResult = await messageBox.prompt('请输入内容')
console.log('用户输入:', promptResult.value)
```

### 全局属性访问

```vue
<template>
  <button @click="handleConfirm">
    显示确认框
  </button>
</template>

<script setup lang="ts">
const handleConfirm = async () => {
  try {
    await $MessageBox.confirm('确定要执行此操作吗？')
    console.log('已确认')
  } catch {
    console.log('已取消')
  }
}
</script>
```

---

## 📢 Notification 通知

### 基础用法

```typescript
import { notification } from '@/design-system/services'

// 或者在组件中使用
import { useNotification } from '@/design-system/services'
const { notification } = useNotification()

// 成功通知
notification.success('操作成功！')

// 信息通知
notification.info('您有一条新消息')

// 警告通知
notification.warning('请注意，磁盘空间不足')

// 错误通知
notification.error('连接失败，请检查网络')
```

### 高级用法

```typescript
// 带标题的通知
notification.success('操作成功！', {
  title: '成功',
  duration: 0,  // 不自动关闭
})

// 完整选项
notification.show({
  title: '新消息',
  message: '您收到了一条新消息，请查收',
  type: 'info',
  position: 'top-right',  // top-left, top-right, bottom-left, bottom-right
  duration: 4500,
  showClose: true,
  onClick: () => {
    console.log('通知被点击')
  },
  onClose: () => {
    console.log('通知已关闭')
  }
})

// 配置全局选项
notification.config({
  position: 'top-right',
  duration: 3000,
  maxCount: 5,  // 最大同时显示数量
})

// 关闭所有通知
notification.closeAll()

// 返回的 handler 可以手动关闭
const handler = notification.success('这条通知可以通过代码关闭')

// 手动关闭
handler.close()
```

### 全局属性访问

```vue
<template>
  <button @click="$notify.success('通知内容')">
    显示通知
  </button>
</template>
```

---

## 🔄 从 Element Plus 迁移

### 方式一：直接替换导入

**Element Plus**:
```typescript
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

ElMessage.success('成功')
ElMessageBox.confirm('确定吗？')
ElNotification.success('通知')
```

**Qingyu**:
```typescript
import { message, messageBox, notification } from '@/design-system/services'

message.success('成功')
messageBox.confirm('确定吗？')
notification.success('通知')
```

### 方式二：使用兼容层

如果你想让迁移更平滑，可以使用兼容层：

```typescript
import { ElMessage, ElMessageBox, ElNotification } from '@/utils/element-plus-compat'

// API 完全相同，无需修改其他代码
ElMessage.success('成功')
```

### 方式三：使用全局属性

在组件中可以直接使用全局属性，无需导入：

```vue
<template>
  <div>
    <button @click="$message.success('成功')">成功</button>
    <button @click="$MessageBox.confirm('确定？')">确认</button>
    <button @click="$notify.success('通知')">通知</button>
  </div>
</template>
```

---

## 📝 API 参考

### Message API

| 方法 | 说明 | 类型 |
|------|------|------|
| `show(options)` | 显示消息 | `(options: MessageOptions) => MessageHandler` |
| `success(message, options?)` | 成功消息 | `(message: string) => MessageHandler` |
| `info(message, options?)` | 信息消息 | `(message: string) => MessageHandler` |
| `warning(message, options?)` | 警告消息 | `(message: string) => MessageHandler` |
| `error(message, options?)` | 错误消息 | `(message: string) => MessageHandler` |

### MessageBox API

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `alert(message, title?, options?)` | 提示框 | `Promise<MessageBoxResult>` |
| `confirm(message, title?, options?)` | 确认框 | `Promise<MessageBoxResult>` |
| `prompt(message, title?, options?)` | 输入框 | `Promise<MessageBoxResult>` |

### Notification API

| 方法 | 说明 | 类型 |
|------|------|------|
| `show(options)` | 显示通知 | `(options: NotificationOptions) => NotificationHandler` |
| `success(message, options?)` | 成功通知 | `(message: string) => NotificationHandler` |
| `info(message, options?)` | 信息通知 | `(message: string) => NotificationHandler` |
| `warning(message, options?)` | 警告通知 | `(message: string) => NotificationHandler` |
| `error(message, options?)` | 错误通知 | `(message: string) => NotificationHandler` |
| `closeAll()` | 关闭所有通知 | `() => void` |
| `config(options)` | 配置全局选项 | `(options: NotificationConfig) => void` |

---

## 🎨 样式定制

所有服务组件都支持通过 CSS 变量进行样式定制：

```css
:root {
  /* Message 样式 */
  --message-success-bg: #f0fdf4;
  --message-success-border: #22c55e;
  --message-success-text: #166534;

  /* Notification 样式 */
  --notification-width: 320px;
  --notification-border-radius: 8px;
}
```

---

## 🔧 TypeScript 支持

所有 API 都有完整的 TypeScript 类型定义：

```typescript
import type {
  MessageOptions,
  MessageHandler,
  MessageBoxOptions,
  MessageBoxResult,
  NotificationOptions,
  NotificationHandler
} from '@/design-system/services'
```

---

## 📚 相关文档

- [Message 组件文档](../design-system/feedback/Message/README.md)
- [Notification 组件文档](../design-system/feedback/Notification/README.md)
- [Dialog 组件文档](../design-system/feedback/Dialog/README.md)

---

**最后更新**: 2026-01-25
