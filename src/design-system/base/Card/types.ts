/**
 * Card 组件类型定义
 */

// Card 变体
export type CardVariant = 'default' | 'bordered' | 'elevated'

// Card Props 接口
export interface CardProps {
  /**
   * Card 变体
   * - default: 默认样式，无额外装饰
   * - bordered: 带边框样式
   * - elevated: 带阴影样式
   * @default 'default'
   */
  variant?: CardVariant

  /**
   * 是否支持 hover 效果
   * @default false
   */
  hoverable?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Card 组件默认属性
export const cardDefaults: Partial<CardProps> = {
  variant: 'default',
  hoverable: false,
}
