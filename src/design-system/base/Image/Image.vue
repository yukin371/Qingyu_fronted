<script setup lang="ts">
/**
 * Image 组件
 *
 * 用于图片展示，支持加载状态、错误状态和多种尺寸形状
 */

import { computed, ref, watch } from 'vue'
import { cn } from '../../utils/cn'
import Icon from '../Icon/Icon.vue'
import Skeleton from '../Skeleton/Skeleton.vue'
import type { ImageProps } from './types'
import { imageSizeMap, imageShapeMap, imageFitMap } from './types'

// 组件 Props
const props = withDefaults(defineProps<ImageProps>(), {
  size: 'md',
  shape: 'rect',
  fit: 'cover',
  lazy: true,
  showSkeleton: true,
  fallbackIcon: 'document',
})

// 组件 Emits
const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  click: [event: MouseEvent]
}>()

// 图片加载状态
const imageStatus = ref<ImageStatus>(props.src ? 'loading' : 'error')
const currentSrc = ref(props.src)

// 监听 src 变化，重置状态
watch(() => props.src, (newSrc) => {
  currentSrc.value = newSrc
  imageStatus.value = 'loading'
})

// 处理图片加载完成
const handleImageLoad = (event: Event) => {
  imageStatus.value = 'loaded'
  emit('load', event)
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  imageStatus.value = 'error'
  emit('error', event)
}

// 点击处理
const handleClick = (e: MouseEvent) => {
  emit('click', e)
}

// 计算尺寸类名
const sizeClasses = computed(() => {
  if (props.width || props.height) {
    return []
  }
  const sizeInfo = imageSizeMap[props.size || 'md']
  return [sizeInfo.width, sizeInfo.height]
})

// 计算自定义尺寸样式
const customStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = props.width
  }
  if (props.height) {
    style.height = props.height
  }
  return style
})

// 计算容器样式类名
const containerClasses = computed(() => {
  return cn(
    'relative inline-flex overflow-hidden bg-neutral-100 dark:bg-neutral-800',
    sizeClasses.value,
    imageShapeMap[props.shape || 'rect'],
    props.class
  )
})

// 计算图片样式类名
const imageClasses = computed(() => {
  return cn(
    'block w-full h-full',
    imageFitMap[props.fit || 'cover']
  )
})

// 计算是否显示骨架屏
const showSkeleton = computed(() => {
  return props.showSkeleton && imageStatus.value === 'loading'
})

// 计算是否显示错误状态
const showError = computed(() => {
  return imageStatus.value === 'error'
})

// 计算是否显示图片
const showImage = computed(() => {
  return imageStatus.value === 'loaded' && currentSrc.value
})

// 加载状态容器尺寸
const skeletonSize = computed(() => {
  const sizeMap: Record<string, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': 'xl',
    full: 'xl',
  }
  return sizeMap[props.size || 'md']
})
</script>

<template>
  <div
    :class="containerClasses"
    :style="customStyle"
    role="img"
    :aria-label="alt"
    @click="handleClick"
  >
    <!-- 骨架屏加载状态 -->
    <Skeleton
      v-if="showSkeleton"
      type="image"
      :size="skeletonSize"
      :class="[sizeClasses, customStyle]"
    />

    <!-- 图片 -->
    <img
      v-if="currentSrc"
      v-show="showImage"
      :src="currentSrc"
      :alt="alt"
      :loading="lazy ? 'lazy' : 'eager'"
      :class="imageClasses"
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- 错误状态 Fallback -->
    <div
      v-if="showError"
      class="absolute inset-0 flex items-center justify-center text-neutral-400 dark:text-neutral-600"
    >
      <Icon :name="fallbackIcon" size="lg" />
    </div>
  </div>
</template>
