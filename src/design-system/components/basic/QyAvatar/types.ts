/**
 * QyAvatar component type definitions
 */

export type QyAvatarType = 'image' | 'text' | 'group'
export type QyAvatarSize = 'sm' | 'md' | 'lg'

export interface QyAvatarProps {
  /**
   * Avatar type
   * @default 'image'
   */
  type?: QyAvatarType

  /**
   * Image source URL (for image type)
   */
  src?: string

  /**
   * Avatar text (for text type)
   */
  text?: string

  /**
   * Avatar size
   * @default 'md'
   */
  size?: QyAvatarSize

  /**
   * Alt text for image (for image type)
   * @default 'Avatar'
   */
  alt?: string

  /**
   * Avatar background color (for text type)
   * @default 'cyan'
   */
  color?: 'cyan' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink'

  /**
   * Group of avatars (for group type)
   */
  avatars?: Array<{ src?: string; text?: string; alt?: string }>
}

export interface QyAvatarEmits {
  /**
   * Emitted when avatar is clicked
   */
  (e: 'click', event: MouseEvent): void
}
