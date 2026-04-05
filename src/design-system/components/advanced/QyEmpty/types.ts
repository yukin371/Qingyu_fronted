/**
 * QyEmpty component type definitions
 */

export interface QyEmptyProps {
  /**
   * Icon SVG string
   */
  icon?: string

  /**
   * Title text
   */
  title?: string

  /**
   * Description text
   */
  description?: string

  /**
   * Action button text
   */
  actionText?: string

  /**
   * Optional image URL (overrides icon)
   */
  image?: string

  /**
   * Icon size: 'small' | 'medium' | 'large'
   */
  iconSize?: 'small' | 'medium' | 'large'
}

export interface QyEmptyEmits {
  /**
   * Emitted when action button is clicked
   */
  (e: 'action'): void
}
