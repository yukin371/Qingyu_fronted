/**
 * QyDivider 组件类型定义
 */

/**
 * 分割线方向
 */
export type DividerDirection = 'horizontal' | 'vertical'

/**
 * 分割线位置
 */
export type DividerContentPosition = 'left' | 'center' | 'right'

/**
 * QyDivider 组件 Props
 */
export interface QyDividerProps {
  /**
   * 方向
   * @default 'horizontal'
   */
  direction?: DividerDirection

  /**
   * 内容文本
   */
  content?: string

  /**
   * 内容位置
   * @default 'center'
   */
  contentPosition?: DividerContentPosition

  /**
   * 是否使用虚线样式
   * @default false
   */
  dashed?: boolean

  /**
   * 边框样式
   * @default 'solid'
   */
  borderStyle?: 'solid' | 'dashed' | 'dotted'

  /**
   * 自定义类名
   */
  class?: string

  /**
   * 自定义样式
   */
  style?: string | Record<string, string | number>
}

/**
 * QyDivider 组件 Emits
 */
export interface QyDividerEmits {}
