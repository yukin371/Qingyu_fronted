<template>
  <div class="qy-empty">
    <!-- Icon or Image -->
    <div v-if="$slots.icon || icon || image" class="qy-empty__icon">
      <slot name="icon">
        <img
          v-if="image"
          :src="image"
          :alt="title || 'Empty state'"
          class="qy-empty__image"
        />
        <div
          v-else-if="icon"
          v-html="icon"
          class="qy-empty__icon-svg"
        />
      </slot>
    </div>

    <!-- Title -->
    <div v-if="$slots.title || title" class="qy-empty__title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>

    <!-- Description -->
    <p v-if="$slots.description || description" class="qy-empty__description">
      <slot name="description">
        {{ description }}
      </slot>
    </p>

    <!-- Action -->
    <div v-if="$slots.action || actionText" class="qy-empty__action">
      <slot name="action">
        <QyButton variant="primary" @click="handleAction">
          {{ actionText }}
        </QyButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QyEmptyProps, QyEmptyEmits } from './types'
import QyButton from '../../basic/QyButton'

// Props
const props = withDefaults(defineProps<QyEmptyProps>(), {
  icon: '',
  title: 'No Data',
  description: 'There is no data to display',
  actionText: '',
  image: ''
})

// Emits
const emit = defineEmits<QyEmptyEmits>()

// Handle action click
const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.qy-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.qy-empty__icon {
  margin-bottom: 1.5rem;
  color: rgb(203 213 225);
}

.qy-empty__image {
  width: 12rem;
  height: 12rem;
  object-fit: contain;
}

.qy-empty__icon-svg {
  width: 8rem;
  height: 8rem;
}

.qy-empty__icon-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.qy-empty__title {
  font-size: 1.25rem;
  font-weight: 500;
  color: rgb(51 65 85);
  margin-bottom: 0.5rem;
}

.qy-empty__description {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(100 116 139);
  max-width: 24rem;
  margin-bottom: 1.5rem;
}

.qy-empty__action {
  margin-top: 0.5rem;
}
</style>
