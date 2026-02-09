<template>
  <span
    ref="tagRef"
    :class="tagClasses"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <slot />
    <button
      v-if="closable"
      type="button"
      class="qy-tag__close"
      :disabled="disabled"
      aria-label="close"
      @click.stop="handleClose"
    >
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M6 6l8 8m0-8l-8 8"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '@/design-system/utils/cn'
import { tagVariants } from './variants'
import type { QyTagProps, QyTagEmits, QyTagInstance } from './types'

// Props
const props = withDefaults(defineProps<QyTagProps>(), {
  type: 'primary',
  size: 'md',
  effect: 'light',
  round: true,
  hit: false,
  closable: false,
  disabled: false
})

// Emits
const emit = defineEmits<QyTagEmits>()

// 标签引用
const tagRef = ref<HTMLSpanElement>()

// 计算标签类名
const tagClasses = computed(() => {
  return cn(
    tagVariants({
      type: props.type,
      size: props.size,
      effect: props.effect,
      round: props.round,
      hit: props.hit
    }),
    {
      'opacity-50 cursor-not-allowed pointer-events-none': props.disabled,
      'shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)]':
        props.effect === 'light' && props.type === 'default',
      'hover:shadow-lg': !props.disabled
    },
    props.class
  )
})

// 处理关闭事件
const handleClose = () => {
  if (!props.disabled) {
    emit('close')
  }
}

// 暴露方法给父组件
defineExpose<QyTagInstance>({
  focus: () => tagRef.value?.focus(),
  blur: () => tagRef.value?.blur()
})
</script>

<style scoped>
.qy-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 0;
  background: rgba(15, 23, 42, 0.08);
  color: currentColor;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.qy-tag__close:hover {
  background: rgba(15, 23, 42, 0.18);
  transform: scale(1.1);
}

.qy-tag__close:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.qy-tag__close svg {
  width: 0.7rem;
  height: 0.7rem;
}

/* Dark effect下的关闭按钮样式调整 */
span[data-effect="dark"] .qy-tag__close {
  background: rgba(255, 255, 255, 0.2);
}

span[data-effect="dark"] .qy-tag__close:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
