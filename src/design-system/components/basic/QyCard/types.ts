/**
 * QyCard component type definitions
 */

export interface QyCardProps {
  /**
   * Enable hover effect
   * @default false
   */
  hoverable?: boolean

  /**
   * Enable shadow
   * @default true
   */
  shadow?: boolean
}

export interface QyCardEmits {
  /**
   * Emitted when card is clicked
   */
  (e: 'click', event: MouseEvent): void
}

export interface QyCardSlots {
  /**
   * Default slot - card main content
   */
  default?: () => any

  /**
   * Title slot - card title
   */
  title?: () => any

  /**
   * Footer slot - card footer
   */
  footer?: () => any
}
