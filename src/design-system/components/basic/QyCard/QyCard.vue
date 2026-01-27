<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Title Slot -->
    <div v-if="$slots.title" class="mb-4">
      <slot name="title" />
    </div>

    <!-- Default Slot -->
    <slot />

    <!-- Footer Slot -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-white/30">
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
    'bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6',
    // Transition
    'transition-all duration-500',
    // Shadow
    props.shadow && 'shadow-sm',
    // Hoverable styles
    props.hoverable && 'cursor-pointer hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1'
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
