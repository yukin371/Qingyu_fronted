<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <div class="qy-card__aurora" aria-hidden="true"></div>

    <!-- Title Slot -->
    <div v-if="$slots.title" class="mb-4 relative z-[1]">
      <slot name="title" />
    </div>

    <!-- Default Slot -->
    <div class="relative z-[1]">
      <slot />
    </div>

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-white/50 relative z-[1]">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QyCardProps, QyCardEmits } from './types'

// Props
const props = withDefaults(defineProps<QyCardProps>(), {
  hoverable: false,
  shadow: true
})

// Emits
const emit = defineEmits<QyCardEmits>()

// Define slots
defineSlots<{ default?: () => any; title?: () => any; footer?: () => any }>()

// Compute card classes
const cardClasses = computed(() => {
  const classes = [
    // Base styles
    'qy-card relative overflow-hidden bg-white/72 backdrop-blur-xl border border-white/85 rounded-[1.7rem] p-6',
    // Transition
    'transition-all duration-500 ease-out',
    // Shadow
    props.shadow && 'shadow-[0_18px_44px_-26px_rgba(15,23,42,0.48)]',
    // Hoverable styles
    props.hoverable && 'cursor-pointer hover:shadow-[0_26px_60px_-28px_rgba(37,99,235,0.35)] hover:-translate-y-1'
  ]

  return classes.filter(Boolean).join(' ')
})

// Handle click event
const handleClick = (event: MouseEvent) => {
  if (props.hoverable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.qy-card__aurora {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 10% 0%, rgba(37, 99, 235, 0.12), transparent 36%),
    radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.1), transparent 34%);
}
</style>
