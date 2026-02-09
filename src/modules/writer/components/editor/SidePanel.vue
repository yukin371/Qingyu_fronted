<template>
  <div class="side-panel" :class="[`side-panel--${position}`, { 'side-panel--collapsible': collapsible }]">
    <div class="side-panel__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  position: 'left' | 'right'
  collapsible?: boolean
}

withDefaults(defineProps<Props>(), {
  collapsible: false
})
</script>

<style scoped lang="scss">
.side-panel {
  height: 100%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}

.side-panel--left {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.side-panel--right {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

.side-panel__content {
  height: 100%;
  overflow: auto;
  background: #fff;
}

:deep(.ai-panel) {
  width: 100%;
  border-left: none;
  border-right: none;
}

:deep(.sidebar-header),
:deep(.sidebar-toolbar),
:deep(.sidebar-section-header) {
  background: #fff;
}

:deep(.sidebar-list) {
  background: #fff;
}

:deep(.chapter-item.is-active) {
  border-left-color: #3b82f6;
  background: #eff6ff;
}

:deep(.chapter-item:hover) {
  background: #f8fafc;
}

:deep(.collapse-trigger) {
  display: none;
}

@media (max-width: 1024px) {
  .side-panel {
    border-radius: 10px;
  }
}
</style>
