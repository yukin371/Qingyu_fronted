<script setup lang="ts">
/**
 * Icon 组件
 *
 * 基于 Heroicons 的图标组件，支持多种尺寸和变体
 */

import { computed, defineComponent, h } from 'vue'
import { cn } from '../../utils/cn'
import type { IconProps } from './types'
import * as iconsData from './icons/icons-data'

// 图标 SVG 数据映射
const iconSvgMap: Record<string, { solid: string; outline: string }> = {
  home: { solid: iconsData.homeIconSolidSvg, outline: iconsData.homeIconOutlineSvg },
  user: { solid: iconsData.userIconSolidSvg, outline: iconsData.userIconOutlineSvg },
  document: { solid: iconsData.documentIconSolidSvg, outline: iconsData.documentIconOutlineSvg },
  folder: { solid: iconsData.folderIconSolidSvg, outline: iconsData.folderIconOutlineSvg },
  plus: { solid: iconsData.plusIconSolidSvg, outline: iconsData.plusIconOutlineSvg },
  minus: { solid: iconsData.minusIconSolidSvg, outline: iconsData.minusIconOutlineSvg },
  check: { solid: iconsData.checkIconSolidSvg, outline: iconsData.checkIconOutlineSvg },
  'x-mark': { solid: iconsData.xMarkIconSolidSvg, outline: iconsData.xMarkIconOutlineSvg },
  pencil: { solid: iconsData.pencilIconSolidSvg, outline: iconsData.pencilIconOutlineSvg },
  trash: { solid: iconsData.trashIconSolidSvg, outline: iconsData.trashIconOutlineSvg },
  'arrow-down': { solid: iconsData.arrowDownIconSolidSvg, outline: iconsData.arrowDownIconOutlineSvg },
  'arrow-up': { solid: iconsData.arrowUpIconSolidSvg, outline: iconsData.arrowUpIconOutlineSvg },
  'arrow-left': { solid: iconsData.arrowLeftIconSolidSvg, outline: iconsData.arrowLeftIconOutlineSvg },
  'arrow-right': { solid: iconsData.arrowRightIconSolidSvg, outline: iconsData.arrowRightIconOutlineSvg },
  'chevron-down': { solid: iconsData.chevronDownIconSolidSvg, outline: iconsData.chevronDownIconOutlineSvg },
  'chevron-up': { solid: iconsData.chevronUpIconSolidSvg, outline: iconsData.chevronUpIconOutlineSvg },
  'chevron-left': { solid: iconsData.chevronLeftIconSolidSvg, outline: iconsData.chevronLeftIconOutlineSvg },
  'chevron-right': { solid: iconsData.chevronRightIconSolidSvg, outline: iconsData.chevronRightIconOutlineSvg },
  'magnifying-glass': { solid: iconsData.magnifyingGlassIconSolidSvg, outline: iconsData.magnifyingGlassIconOutlineSvg },
  'cog-6-tooth': { solid: iconsData.cog6ToothIconSolidSvg, outline: iconsData.cog6ToothIconOutlineSvg },
  bell: { solid: iconsData.bellIconSolidSvg, outline: iconsData.bellIconOutlineSvg },
  heart: { solid: iconsData.heartIconSolidSvg, outline: iconsData.heartIconOutlineSvg },
  star: { solid: iconsData.starIconSolidSvg, outline: iconsData.starIconOutlineSvg },
  'lock-closed': { solid: iconsData.lockClosedIconSolidSvg, outline: iconsData.lockClosedIconOutlineSvg },
  'information-circle': { solid: iconsData.informationCircleIconSolidSvg, outline: iconsData.informationCircleIconOutlineSvg },
  'book-open': { solid: iconsData.bookOpenIconSolidSvg, outline: iconsData.bookOpenIconOutlineSvg },
  'photo': { solid: iconsData.photoIconSolidSvg, outline: iconsData.photoIconOutlineSvg },
}

// 尺寸映射
const sizeClasses: Record<string, string> = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
}

// 组件 Props
const props = withDefaults(defineProps<IconProps>(), {
  size: 'md',
  variant: 'outline',
})

// 组件 Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// 计算要渲染的 SVG 字符串
const svgContent = computed(() => {
  const icon = iconSvgMap[props.name as keyof typeof iconSvgMap]
  if (!icon) {
    console.warn(`Icon "${props.name}" not found`)
    return null
  }
  return props.variant === 'solid' ? icon.solid : icon.outline
})

// 计算样式类名
const classes = computed(() => {
  return cn(
    sizeClasses[props.size],
    'inline-flex-shrink-0',
    props.class
  )
})

// SVG 组件
const SvgComponent = defineComponent({
  setup() {
    return () => {
      if (!svgContent.value) return null

      // 解析 SVG 字符串并添加 aria-label
      const svgWithClass = svgContent.value.replace(
        /<svg/,
        `<svg style="width: 100%; height: 100%;" aria-label="${props.ariaLabel || props.name}"`
      )

      return h('div', {
        class: classes.value,
        innerHTML: svgWithClass,
        onClick: (e: MouseEvent) => emit('click', e),
      })
    }
  },
})
</script>

<template>
  <SvgComponent v-if="svgContent" />
  <span
    v-else
    :class="classes"
    :aria-label="ariaLabel || name"
  >?</span>
</template>
