/**
 * QyProgress 组件类型定义
 */

/**
 * 进度条类型
 */
export type ProgressType = 'line' | 'circle' | 'dashboard'

/**
 * 进度条状态
 */
export type ProgressStatus = 'success' | 'exception' | 'warning' | 'active'

/**
 * QyProgress 组件 Props
 */
export interface QyProgressProps {
  /**
   * 百分比 (0-100)
   */
  percentage?: number

  /**
   * 进度条类型
   * @default 'line'
   */
  type?: ProgressType

  /**
   * 进度条状态
   */
  status?: ProgressStatus

  /**
   * 是否显示进度条文字
   * @default true for line, false for circle/dashboard
   */
  showText?: boolean

  /**
   * 进度条宽度（仅 type=line 有效）
   * @default '100%'
   */
  strokeWidth?: number | string

  /**
   * 线性进度条文字位置
   * @default 'right'
   */
  textInside?: boolean

  /**
   * 进度条颜色
   */
  color?: string

  /**
   * 环形进度条画布宽度（type=circle/dashboard 时有效）
   * @default 126
   */
  width?: number

  /**
   * 是否展示仪表盘类型进度条（type=circle 时有效）
   */
  dashboard?: boolean

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
 * QyProgress 组件 Emits
 */
export interface QyProgressEmits {}
