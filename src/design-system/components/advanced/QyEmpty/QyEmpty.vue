<script setup lang="ts">
/**
 * QyEmpty 空状态组件
 *
 * Apple 风格的空状态展示组件
 */
import type { QyEmptyProps, QyEmptyEmits } from './types'

// Props
const props = withDefaults(defineProps<QyEmptyProps>(), {
  icon: '',
  title: '暂无数据',
  description: '当前没有数据可展示',
  actionText: '',
  image: '',
  iconSize: 'medium', // 'small' | 'medium' | 'large'
})

// Emits
const emit = defineEmits<QyEmptyEmits>()

// Handle action click
const handleAction = () => {
  emit('action')
}

// Icon size classes
const iconSizeClasses: Record<string, string> = {
  small: 'w-12 h-12',
  medium: 'w-16 h-16',
  large: 'w-20 h-20',
}
</script>

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

    <!-- Default elegant SVG icon -->
    <div v-else class="qy-empty__icon qy-empty__icon--default">
      <svg
        :class="['qy-empty__illustration', iconSizeClasses[iconSize]]"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Background circle -->
        <circle cx="60" cy="60" r="50" fill="#f1f5f9" />
        <!-- Inbox/tray icon -->
        <path
          d="M30 45L60 35L90 45V75L60 85L30 75V45Z"
          stroke="#cbd5e1"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="#f8fafc"
        />
        <!-- Top flap line -->
        <path
          d="M30 45L60 55L90 45"
          stroke="#cbd5e1"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- Inner line suggesting emptiness -->
        <path
          d="M45 55H75"
          stroke="#e2e8f0"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M50 63H70"
          stroke="#e2e8f0"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
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
        <button class="qy-empty__btn" @click="handleAction">
          {{ actionText }}
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.qy-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  text-align: center;
  min-height: 200px;
}

.qy-empty__icon {
  margin-bottom: 1rem;
  color: rgb(203 213 225);
}

.qy-empty__icon--default {
  display: flex;
  align-items: center;
  justify-content: center;
}

.qy-empty__illustration {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.qy-empty__illustration:hover {
  transform: scale(1.05);
  opacity: 0.9;
}

.qy-empty__image {
  width: 8rem;
  height: 8rem;
  object-fit: contain;
}

.qy-empty__icon-svg {
  width: 6rem;
  height: 6rem;
}

.qy-empty__icon-svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.qy-empty__title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(51 65 85);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.qy-empty__description {
  margin: 0;
  font-size: 0.875rem;
  color: rgb(100 116 139);
  max-width: 16rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.qy-empty__action {
  margin-top: 0.25rem;
}

.qy-empty__btn {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6366f1;
  background: #eff0ff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qy-empty__btn:hover {
  background: #e0e7ff;
  transform: translateY(-1px);
}

.qy-empty__btn:active {
  transform: translateY(0);
}
</style>
