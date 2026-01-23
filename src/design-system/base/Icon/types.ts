/**
 * Icon 组件类型定义
 */

// Icon 尺寸
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Icon 变体
export type IconVariant = 'solid' | 'outline'

// Icon 名称 - 支持的图标列表
export type IconName =
  // 导航类
  | 'home'
  | 'dashboard'
  | 'menu'
  | 'x-mark'
  // 用户相关
  | 'user'
  | 'users'
  | 'user-group'
  | 'user-circle'
  // 文件/文档
  | 'document'
  | 'document-text'
  | 'folder'
  | 'folder-open'
  // 操作类
  | 'plus'
  | 'minus'
  | 'check'
  | 'x-circle'
  | 'pencil'
  | 'trash'
  | 'arrow-down'
  | 'arrow-up'
  | 'arrow-left'
  | 'arrow-right'
  // 导航箭头
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  // 搜索和设置
  | 'magnifying-glass'
  | 'adjustments-horizontal'
  | 'cog-6-tooth'
  | 'cog-8-tooth'
  // 通信
  | 'bell'
  | 'envelope'
  | 'chat-bubble-left-right'
  // 安全
  | 'lock-closed'
  | 'lock-open'
  | 'shield-check'
  | 'key'
  // 状态
  | 'information-circle'
  | 'exclamation-circle'
  | 'exclamation-triangle'
  // 其他
  | 'heart'
  | 'star'
  | 'calendar'
  | 'clock'
  | 'ellipsis-horizontal'
  | 'ellipsis-vertical'

// Icon Props 接口
export interface IconProps {
  /**
   * 图标名称
   */
  name: IconName

  /**
   * 图标尺寸
   * @default 'md'
   */
  size?: IconSize

  /**
   * 图标变体（实心或轮廓）
   * @default 'outline'
   */
  variant?: IconVariant

  /**
   * 自定义类名
   */
  class?: any

  /**
   * ARIA 标签（可访问性）
   */
  ariaLabel?: string

  /**
   * 点击事件
   */
  onClick?: (event: MouseEvent) => void
}

// Icon 尺寸对应的像素值
export const iconSizes: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

// Icon 组件默认属性
export const iconDefaults: Partial<IconProps> = {
  size: 'md',
  variant: 'outline',
}
