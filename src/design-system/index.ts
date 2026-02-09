/**
 * Qingyu Design System
 * 统一导出设计令牌和组件
 */

// 设计令牌（主题、颜色、间距等）
export * from './tokens'

// === 新的Tailwind v4组件库 (Qy前缀，包含向后兼容别名) ===
export * from './components'

// === 向后兼容：导出原有组件 (排除与Qy组件冲突的) ===

// Base Components - 只导出Qy组件库中没有的
export * from './base/Empty'      // QyEmpty已存在但可能不同
export * from './base/Divider'   // Qy组件库中没有Divider
export * from './base/Skeleton'  // Qy组件库中没有Skeleton

// Form Components - 只导出Qy组件库中没有的
export * from './form/DatePicker'   // Qy组件库中没有DatePicker
export * from './form/Upload'       // Qy组件库中没有Upload

// Layout Components
export * from './layout'

// Navigation Components - 只导出Qy组件库中没有的
export * from './navigation/Breadcrumb'  // Qy组件库中没有Breadcrumb

// Feedback Components - 只导出Qy组件库中没有的
export * from './feedback/Alert'        // Qy组件库中没有Alert
export * from './feedback/Dialog'      // Qy组件库中没有Dialog/Modal
export * from './feedback/Message'     // Qy组件库中没有Message
export * from './feedback/Notification' // Qy组件库中没有Notification
export * from './feedback/Popover'     // Qy组件库中没有Popover
export * from './feedback/Progress'    // Qy组件库中没有Progress
export * from './feedback/Spinner'     // Qy组件库中没有Spinner
export * from './feedback/Tooltip'     // Qy组件库中没有Tooltip

// Data Display Components - 只导出Qy组件库中没有的
export * from './data/Collapse'   // Qy组件库中没有Collapse
export * from './data/Tabs'       // Qy组件库中没有Tabs
export * from './data/Table'      // Qy组件库中没有Table
export * from './data/Tree'       // Qy组件库中没有Tree
export * from './data/Pagination' // Qy组件库中没有Pagination
export * from './data/List'       // Qy组件库中没有List

// Other Components
export * from './other/Drawer'
export * from './other/ConfigProvider'
export { default as ThemeSwitcher } from './other/ThemeSwitcher.vue'

// Services
export * from './services'
