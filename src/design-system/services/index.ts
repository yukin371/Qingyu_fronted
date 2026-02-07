/**
 * Qingyu 全局服务导出
 *
 * 提供 Element Plus 兼容的全局 API
 */

// Message 服务
export { default as message, useMessage } from '../feedback/Message/useMessage'

// MessageBox 服务
export { default as messageBox, useMessageBox } from '../feedback/MessageBox/useMessageBox'

// Notification 服务
export { default as notification, useNotification } from '../feedback/Notification/useNotification'

// 类型导出
export type { MessageOptions, MessageType, MessageHandler } from '../feedback/Message/types'
export type { MessageBoxOptions, MessageBoxType, MessageBoxAction, MessageBoxResult } from '../feedback/MessageBox/types'
export type { NotificationOptions, NotificationType, NotificationPosition, NotificationHandler } from '../feedback/Notification/types'

// Form 类型（从 element-plus 重新导出）
export type { FormInstance, FormRules, FormItemProp } from 'element-plus'

// 兼容 Element Plus 的别名导出
export { message as ElMessage, messageBox as ElMessageBox, notification as ElNotification }
