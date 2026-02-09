<template>
  <!-- Image Avatar -->
  <div
    v-if="type === 'image'"
    :class="avatarWrapperClasses"
    @click="handleClick"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      :class="avatarImageClasses"
    />
    <div v-else :class="avatarPlaceholderClasses">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  </div>

  <!-- Text Avatar -->
  <div
    v-else-if="type === 'text'"
    :class="[avatarWrapperClasses, avatarTextBgClasses]"
    @click="handleClick"
  >
    <span :class="avatarTextClasses">
      {{ displayText }}
    </span>
  </div>

  <!-- Group Avatar -->
  <div v-else-if="type === 'group'" :class="groupClasses">
    <div
      v-for="(avatar, index) in displayedAvatars"
      :key="index"
      :class="[groupAvatarClasses, { 'ml-[-8px]': index > 0 }]"
      :style="{ zIndex: avatars!.length - index }"
    >
      <img
        v-if="avatar.src"
        :src="avatar.src"
        :alt="avatar.alt || 'Avatar'"
        :class="avatarImageClasses"
      />
      <div v-else :class="[avatarPlaceholderClasses, avatarTextBgClasses]">
        <span :class="avatarTextClasses">
          {{ getAvatarText(avatar.text) }}
        </span>
      </div>
    </div>
    <div
      v-if="avatars && avatars.length > maxVisible"
      :class="[groupAvatarClasses, 'ml-[-8px]']"
      :style="{ zIndex: 0 }"
    >
      <div :class="[avatarTextBgClasses, 'flex items-center justify-center w-full h-full']">
        <span :class="avatarTextClasses">
          +{{ avatars.length - maxVisible }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyAvatarProps, QyAvatarEmits } from './types'

// Props
const props = withDefaults(defineProps<QyAvatarProps>(), {
  type: 'image',
  src: '',
  text: '',
  size: 'md',
  alt: 'Avatar',
  color: 'cyan',
  avatars: () => []
})

// Emits
const emit = defineEmits<QyAvatarEmits>()

// Maximum visible avatars in group
const maxVisible = 3

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  return sizes[props.size]
})

// Avatar wrapper classes
const avatarWrapperClasses = computed(() => {
  return [
    'relative',
    'overflow-hidden',
    'rounded-full',
    'bg-white/70',
    'backdrop-blur-md',
    'border-2 border-white/85',
    'shadow-[0_10px_24px_-16px_rgba(15,23,42,0.5)]',
    'cursor-pointer',
    'transition-all',
    'duration-300 ease-out',
    'hover:shadow-[0_14px_30px_-16px_rgba(37,99,235,0.45)]',
    'hover:scale-105 hover:-translate-y-0.5',
    sizeClasses.value
  ].join(' ')
})

// Avatar image classes
const avatarImageClasses = computed(() => {
  return [
    'w-full',
    'h-full',
    'object-cover saturate-[1.05]'
  ].join(' ')
})

// Avatar placeholder classes
const avatarPlaceholderClasses = computed(() => {
  return [
    'w-full',
    'h-full',
    'flex',
    'items-center',
    'justify-center',
    'bg-gradient-to-br from-slate-100 to-slate-200',
    'text-slate-500'
  ].join(' ')
})

// Color background classes for text avatar
const avatarTextBgClasses = computed(() => {
  const colors = {
    cyan: 'bg-gradient-to-br from-primary-400 to-primary-600',
    blue: 'bg-gradient-to-br from-secondary-400 to-secondary-600',
    green: 'bg-gradient-to-br from-green-400 to-green-600',
    red: 'bg-gradient-to-br from-red-400 to-red-600',
    yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
    pink: 'bg-gradient-to-br from-pink-400 to-pink-600'
  }
  return colors[props.color]
})

// Text classes for avatar
const avatarTextClasses = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  return [
    'font-semibold',
    'text-white',
    sizes[props.size]
  ].join(' ')
})

// Display text for text avatar
const displayText = computed(() => {
  return getAvatarText(props.text)
})

// Get avatar text (first 2 characters, uppercase)
const getAvatarText = (text?: string) => {
  if (!text) return ''
  return text.substring(0, 2).toUpperCase()
}

// Group classes
const groupClasses = computed(() => {
  return [
    'flex',
    'items-center'
  ].join(' ')
})

// Group avatar classes
const groupAvatarClasses = computed(() => {
  return [
    'relative',
    'overflow-hidden',
    'rounded-full',
    'border-2 border-white/90',
    'shadow-[0_8px_20px_-14px_rgba(15,23,42,0.45)]',
    sizeClasses.value
  ].join(' ')
})

// Displayed avatars (limited to maxVisible)
const displayedAvatars = computed(() => {
  if (!props.avatars) return []
  return props.avatars.slice(0, maxVisible)
})

// Handle click event
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>
