/**
 * Tag 组件类型定义
 */

// Tag 变体
export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger'

// Tag 尺寸
export type TagSize = 'sm' | 'md' | 'lg'

// Tag Props 接口
export interface TagProps {
  /**
   * Tag 变体
   * @default 'default'
   */
  variant?: TagVariant

  /**
   * Tag 尺寸
   * @default 'md'
   */
  size?: TagSize

  /**
   * 是否可关闭
   * @default false
   */
  removable?: boolean

  /**
   * 图标名称（前缀图标）
   */
  icon?: string

  /**
   * 自定义类名
   */
  class?: any

  /**
   * 关闭事件
   */
  onClose?: () => void

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Tag 组件默认属性
export const tagDefaults: Partial<TagProps> = {
  variant: 'default',
  size: 'md',
  removable: false,
}
