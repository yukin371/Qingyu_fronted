/**
 * Qingyu Design System Components
 * Unified export for all Qingyu-style components
 */

// Basic Components (with backward compatibility aliases)
export { default as QyButton } from './basic/QyButton'
export { default as Button } from './basic/QyButton'
export { default as QyCard } from './basic/QyCard'
export { default as Card } from './basic/QyCard'
export { default as QyInput } from './basic/QyInput'
export { default as Input } from './basic/QyInput'
export { default as QyBadge } from './basic/QyBadge'
export { default as Badge } from './basic/QyBadge'
export { default as QyAvatar } from './basic/QyAvatar'
export { default as Avatar } from './basic/QyAvatar'
export { default as QyIcon } from './basic/QyIcon'
export { default as Icon } from './basic/QyIcon'
export { default as QyTag } from './basic/QyTag'
export { default as Tag } from './basic/QyTag'
export { default as QyCheckbox } from './basic/QyCheckbox'
export { default as Checkbox } from './basic/QyCheckbox'
export { QyCheckboxGroup, default as CheckboxGroup } from './basic/QyCheckbox'
export { default as QyRadio } from './basic/QyRadio'
export { default as Radio } from './basic/QyRadio'
export { QyRadioGroup, default as RadioGroup } from './basic/QyRadio'
export { default as QySwitch } from './basic/QySwitch'
export { default as Switch } from './basic/QySwitch'
export { default as QySlider } from './basic/QySlider'
export { default as Slider } from './basic/QySlider'
export { default as QyTextarea } from './basic/QyTextarea'
export { default as Textarea } from './basic/QyTextarea'
export { default as QySelect } from './basic/QySelect'
export { default as Select } from './basic/QySelect'
export { default as QyRate } from './basic/QyRate'
export { default as Rate } from './basic/QyRate'
export { default as QyScrollbar } from './basic/QyScrollbar'
export { default as Scrollbar } from './basic/QyScrollbar'
export { default as QyImage } from './basic/QyImage'
export { default as Image } from './basic/QyImage'

// Navigation Components
export { default as QyTopNav } from './navigation/QyTopNav'
export { default as QyBottomDock } from './navigation/QyBottomDock'
export { default as QyTabBar } from './navigation/QyTabBar'

// Advanced Components
export { default as QyModal } from './advanced/QyModal'
export { default as QyLoading } from './advanced/QyLoading'
export { default as QyEmpty } from './advanced/QyEmpty'
export { QyForm, QyFormItem } from './advanced/QyForm'
export { QyConfirmDialog } from './advanced/QyConfirmDialog'

// Business Components
export { default as QyBookCard } from './business/QyBookCard'
export { default as QyBookCover } from './business/QyBookCover'
export { default as QyUserCard } from './business/QyUserCard'
export { default as QyCommentItem } from './business/QyCommentItem'

// Re-export types
export type * from './basic/QyButton/types'
export type * from './basic/QyCard/types'
export type * from './basic/QyInput/types'
export type * from './basic/QyBadge/types'
export type * from './basic/QyAvatar/types'
export type * from './basic/QyIcon/types'
export type * from './basic/QyCheckbox/types'
export type * from './basic/QyRadio/types'
export type * from './basic/QySwitch/types'
export type * from './basic/QySlider/types'
export type * from './basic/QyTextarea/types'
export type * from './basic/QySelect/types'
export type * from './basic/QyRate/types'
export type * from './basic/QyScrollbar/types'
export type * from './basic/QyImage/types'
export type * from './navigation/QyTopNav/types'
export type * from './navigation/QyBottomDock/types'
export type * from './navigation/QyTabBar/types'
export type * from './advanced/QyModal/types'
export type * from './advanced/QyLoading/types'
export type * from './advanced/QyEmpty/types'
export type * from './advanced/QyForm/types'
export type * from './advanced/QyConfirmDialog/types'
export type * from './business/QyBookCard/types'
export type * from './business/QyBookCover/types'
export type * from './business/QyUserCard/types'
export type * from './business/QyCommentItem/types'

// Backward compatibility type aliases
import type { QyButtonProps } from './basic/QyButton/types'
import type { QyInputProps } from './basic/QyInput/types'
import type { QyTextareaProps } from './basic/QyTextarea/types'
import type { QySelectProps } from './basic/QySelect/types'
import type { QyCheckboxProps } from './basic/QyCheckbox/types'
import type { QyRadioProps } from './basic/QyRadio/types'
import type { QySwitchProps } from './basic/QySwitch/types'
import type { QySliderProps } from './basic/QySlider/types'
import type { QyAvatarProps } from './basic/QyAvatar/types'
import type { QyBadgeProps } from './basic/QyBadge/types'
import type { QyTagProps } from './basic/QyTag/types'
import type { QyIconProps } from './basic/QyIcon/types'
import type { QyImageProps } from './basic/QyImage/types'
import type { QyCardProps } from './basic/QyCard/types'
import type { QyRateProps } from './basic/QyRate/types'

// Export backward compatibility type aliases
export type ButtonProps = QyButtonProps
export type InputProps = QyInputProps
export type TextareaProps = QyTextareaProps
export type SelectProps = QySelectProps
export type CheckboxProps = QyCheckboxProps
export type RadioProps = QyRadioProps
export type SwitchProps = QySwitchProps
export type SliderProps = QySliderProps
export type AvatarProps = QyAvatarProps
export type BadgeProps = QyBadgeProps
export type IconProps = QyIconProps
export type ImageProps = QyImageProps
export type CardProps = QyCardProps
export type RateProps = QyRateProps
export type TagProps = QyTagProps
