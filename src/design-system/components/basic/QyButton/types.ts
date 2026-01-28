/**
 * QyButton component type definitions
 */

export type QyButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type QyButtonSize = 'sm' | 'md' | 'lg'

export interface QyButtonProps {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: QyButtonVariant

  /**
   * Button size
   * @default 'md'
   */
  size?: QyButtonSize

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean

  /**
   * Loading state (shows spinner and disables button)
   * @default false
   */
  loading?: boolean

  /**
   * Icon SVG string
   */
  icon?: string

  /**
   * Icon position
   * @default 'left'
   */
  iconPosition?: 'left' | 'right'
}

export interface QyButtonEmits {
  /**
   * Emitted when button is clicked
   */
  (e: 'click', event: MouseEvent): void
}
