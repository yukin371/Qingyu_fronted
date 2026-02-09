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
      <svg
        v-if="!icon"
        xmlns="http://www.w3.org/2000/svg"
        class="w-1/2 h-1/2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <span v-else v-html="icon" :class="avatarIconClasses"></span>
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
      v-for="(avatarItem, index) in displayedAvatars"
      :key="index"
      :class="[groupAvatarItemClasses, { 'ml-[-8px]': index > 0 }]"
      :style="{ zIndex: avatars!.length - index }"
    >
      <img
        v-if="avatarItem.src"
        :src="avatarItem.src"
        :alt="avatarItem.alt || 'Avatar'"
        :class="avatarImageClasses"
      />
      <div
        v-else
        :class="[avatarPlaceholderClasses, avatarTextBgClasses]"
      >
        <span :class="avatarTextClasses">
          {{ getAvatarText(avatarItem.text) }}
        </span>
      </div>
    </div>
    <div
      v-if="avatars && avatars.length > actualMaxVisible"
      :class="[groupAvatarItemClasses, 'ml-[-8px]']"
      :style="{ zIndex: 0 }"
    >
      <div
        :class="[avatarTextBgClasses, 'flex items-center justify-center w-full h-full']"
      >
        <span :class="avatarTextClasses">
          +{{ avatars.length - actualMaxVisible }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/design-system/utils/cn'
import {
  avatarVariants,
  avatarImageVariants,
  avatarPlaceholderVariants,
  avatarTextBgVariants,
  avatarTextVariants,
  avatarGroupVariants,
  avatarGroupItemVariants
} from './variants'
import type { QyAvatarProps, QyAvatarEmits } from './types'

// Props
const props = withDefaults(defineProps<QyAvatarProps>(), {
  type: 'image',
  src: '',
  text: '',
  size: 'md',
  alt: 'Avatar',
  shape: 'circle',
  fit: 'cover',
  color: 'cyan',
  avatars: () => [],
  maxVisible: 3,
  icon: '',
  clickable: false
})

// Emits
const emit = defineEmits<QyAvatarEmits>()

// 计算实际的最大显示数量
const actualMaxVisible = computed(() => props.maxVisible || 3)

// 计算容器类名
const avatarWrapperClasses = computed(() => {
  return cn(
    avatarVariants({
      size: props.size,
      shape: props.shape
    }),
    {
      'cursor-pointer': props.clickable
    },
    props.class
  )
})

// 计算图片类名
const avatarImageClasses = computed(() => {
  return cn(
    avatarImageVariants({
      fit: props.fit
    })
  )
})

// 计算占位符类名
const avatarPlaceholderClasses = computed(() => {
  return cn(
    avatarPlaceholderVariants({
      size: props.size
    })
  )
})

// 计算图标类名
const avatarIconClasses = computed(() => {
  const sizeMap: Record<string, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  }
  return cn(sizeMap[props.size || 'md'], 'text-slate-500')
})

// 计算文本背景类名
const avatarTextBgClasses = computed(() => {
  return cn(
    avatarTextBgVariants({
      color: props.color
    })
  )
})

// 计算文本类名
const avatarTextClasses = computed(() => {
  return cn(
    avatarTextVariants({
      size: props.size
    })
  )
})

// 计算显示的文本
const displayText = computed(() => {
  return getAvatarText(props.text)
})

// 获取头像文本（前2个字符，大写）
const getAvatarText = (text?: string) => {
  if (!text) return ''
  return text.substring(0, 2).toUpperCase()
}

// 计算组容器类名
const groupClasses = computed(() => {
  return cn(
    avatarGroupVariants()
  )
})

// 计算组头像项类名
const groupAvatarItemClasses = computed(() => {
  return cn(
    avatarGroupItemVariants({
      size: props.size,
      shape: props.shape
    })
  )
})

// 计算显示的头像列表
const displayedAvatars = computed(() => {
  if (!props.avatars) return []
  return props.avatars.slice(0, actualMaxVisible.value)
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  if (props.clickable) {
    emit('click', event)
  }
}

// 暴露方法给父组件
defineExpose({
  focus: () => {
    // 可以添加聚焦逻辑
  },
  blur: () => {
    // 可以添加失焦逻辑
  }
})
</script>
