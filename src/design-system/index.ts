/**
 * 设计系统统一导出
 *
 * 提供设计令牌和组件的集中访问点
 */

// 设计令牌
export * from './tokens'

// 基础组件
export * from './base'

// 布局组件
export * from './layout'

// 数据展示组件
export * from './data'

// 表单组件
export * from './form'

// 反馈组件
export * from './feedback'

// 导航组件
export * from './navigation'

// 其他组件
export * from './other'

// 工具函数
export * from './utils/cn'

// 默认导出（用于兼容 import Icon from '@/design-system'）
export { default as Icon } from './base/Icon/Icon.vue'
