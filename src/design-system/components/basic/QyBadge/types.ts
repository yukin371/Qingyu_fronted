/**
 * QyBadge component type definitions
 */

export type QyBadgeType = 'count' | 'status' | 'dot'
export type QyBadgeColor = 'cyan' | 'blue' | 'green' | 'red' | 'yellow'

export interface QyBadgeProps {
  /**
   * Badge type
   * @default 'count'
   */
  type?: QyBadgeType

  /**
   * Badge color
   * @default 'cyan'
   */
  color?: QyBadgeColor

  /**
   * Badge value (for count type)
   */
  value?: number

  /**
   * Maximum value to display (shows 99+ for larger values)
   * @default 99
   */
  max?: number

  /**
   * Badge text (for status type)
   */
  text?: string

  /**
   * Dot size (for dot type)
   * @default 'md'
   */
  dotSize?: 'sm' | 'md' | 'lg'
}
