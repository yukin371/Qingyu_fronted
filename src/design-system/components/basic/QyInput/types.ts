/**
 * QyInput component type definitions
 */

export type QyInputType = 'text' | 'search' | 'textarea'

export interface QyInputProps {
  /**
   * Input type
   * @default 'text'
   */
  type?: QyInputType

  /**
   * Input placeholder text
   */
  placeholder?: string

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean

  /**
   * Input value (v-model)
   */
  modelValue?: string

  /**
   * Number of rows for textarea
   * @default 3
   */
  rows?: number
}

export interface QyInputEmits {
  /**
   * Emitted when input value changes (for v-model)
   */
  (e: 'update:modelValue', value: string): void

  /**
   * Emitted on input event
   */
  (e: 'input', value: string): void

  /**
   * Emitted on focus event
   */
  (e: 'focus', event: FocusEvent): void

  /**
   * Emitted on blur event
   */
  (e: 'blur', event: FocusEvent): void
}
