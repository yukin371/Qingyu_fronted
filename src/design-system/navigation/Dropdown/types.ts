/**
 * Dropdown 组件类型定义
 */

import type { VNode } from 'vue'

// Dropdown 触发方式
export type DropdownTrigger = 'click' | 'hover' | 'focus' | 'contextmenu'

// Dropdown 位置
export type DropdownPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end'

// Dropdown 尺寸
export type DropdownSize = 'small' | 'medium' | 'large'

// DropdownItem 命令值类型
export type DropdownCommand = string | number | object

// Dropdown Props 接口
export interface DropdownProps {
  /**
   * 触发方式
   * @default 'click'
   */
  trigger?: DropdownTrigger | DropdownTrigger[]

  /**
   * 下拉菜单出现的位置
   * @default 'bottom'
   */
  placement?: DropdownPlacement

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否在点击菜单项后隐藏菜单
   * @default true
   */
  hideOnClick?: boolean

  /**
   * 触发器的自定义类名
   */
  triggerClass?: string

  /**
   * 下拉菜单的尺寸
   * @default 'medium'
   */
  size?: DropdownSize

  /**
   * 下拉菜单的最大宽度（px）
   * @default 240
   */
  maxWidth?: number

  /**
   * 是否在菜单打开时禁用页面滚动
   * @default false
   */
  disableScroll?: boolean

  /**
   * 菜单显示的延迟时间（ms，仅对 hover 触发有效）
   * @default 150
   */
  showTimeout?: number

  /**
   * 菜单隐藏的延迟时间（ms，仅对 hover 触发有效）
   * @default 150
   */
  hideTimeout?: number

  /**
   * 菜单距离触发器的偏移量（px）
   * @default 8
   */
  offset?: number

  /**
   * 是否显示箭头
   * @default false
   */
  showArrow?: boolean

  /**
   * 自定义类名
   */
  class?: any
}

// Dropdown Events 接口
export interface DropdownEmits {
  /**
   * 菜单显示/隐藏时触发
   */
  visibleChange: [visible: boolean]

  /**
   * 点击菜单项时触发
   */
  command: [command: DropdownCommand]

  /**
   * 点击触发器时触发
   */
  click: [event: MouseEvent]
}

// Dropdown Slots 类型
export interface DropdownSlots {
  /**
   * 默认插槽 - 下拉菜单内容
   */
  default?: () => VNode[]

  /**
   * 触发器插槽
   */
  trigger?: () => VNode[]
}

// DropdownItem Props 接口
export interface DropdownItemProps {
  /**
   * 命令值
   */
  command?: DropdownCommand

  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean

  /**
   * 是否显示分割线
   * @default false
   */
  divided?: boolean

  /**
   * 图标类名
   */
  icon?: string

  /**
   * 自定义类名
   */
  class?: any
}

// DropdownItem Events 接口
export interface DropdownItemEmits {
  /**
   * 点击事件
   */
  click: [event: MouseEvent, command: DropdownCommand]
}

// DropdownItem Slots 类型
export interface DropdownItemSlots {
  /**
   * 默认插槽 - 菜单项内容
   */
  default?: () => VNode[]

  /**
   * 图标插槽
   */
  icon?: () => VNode[]
}

// DropdownDivider Props 接口
export interface DropdownDividerProps {
  /**
   * 自定义类名
   */
  class?: any
}

// Dropdown 组件默认属性
export const dropdownDefaults: Partial<DropdownProps> = {
  trigger: 'click',
  placement: 'bottom',
  disabled: false,
  hideOnClick: true,
  size: 'medium',
  maxWidth: 240,
  disableScroll: false,
  showTimeout: 150,
  hideTimeout: 150,
  offset: 8,
  showArrow: false,
}

// DropdownItem 组件默认属性
export const dropdownItemDefaults: Partial<DropdownItemProps> = {
  disabled: false,
  divided: false,
}
