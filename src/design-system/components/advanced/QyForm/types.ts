/**
 * QyForm component type definitions
 */

export type QyFormLabelPosition = 'left' | 'top' | 'right'

export interface QyFormProps {
  /**
   * Form data model (v-model)
   */
  modelValue: Record<string, any>

  /**
   * Validation rules
   */
  rules?: Record<string, any[]>

  /**
   * Label width
   * @default '100px'
   */
  labelWidth?: string

  /**
   * Label position
   * @default 'top'
   */
  labelPosition?: QyFormLabelPosition
}

export interface QyFormEmits {
  /**
   * Emitted when form data changes (v-model)
   */
  (e: 'update:modelValue', value: Record<string, any>): void

  /**
   * Emitted on form validation
   */
  (e: 'validate', valid: boolean): void
}

export interface QyFormItemProps {
  /**
   * Form field name (for validation)
   */
  prop?: string

  /**
   * Label text
   */
  label?: string

  /**
   * Label width (overrides form level)
   */
  labelWidth?: string

  /**
   * Required field indicator
   */
  required?: boolean

  /**
   * Error message (external control)
   */
  error?: string
}

export interface QyValidationRule {
  /**
   * Required validation
   */
  required?: boolean

  /**
   * Minimum length
   */
  min?: number

  /**
   * Maximum length
   */
  max?: number

  /**
   * Pattern validation
   */
  pattern?: RegExp

  /**
   * Custom validator function
   */
  validator?: (value: any) => boolean | string

  /**
   * Error message
   */
  message?: string
}
