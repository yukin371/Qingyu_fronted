/**
 * QyTag Component Types
 */

export interface QyTagProps {
  /**
   * Tag variant
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

  /**
   * Tag size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether the tag can be closed
   * @default false
   */
  closable?: boolean

  /**
   * Whether the tag is disabled
   * @default false
   */
  disabled?: boolean
}

export interface QyTagEmits {
  /**
   * Emitted when the tag is closed
   */
  close: []
}
