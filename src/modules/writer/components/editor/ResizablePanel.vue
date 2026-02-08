<template>
  <div class="resizable-panel placeholder">
    <div class="placeholder-text">ResizablePanel (待实现)</div>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  panelId: 'left' | 'right'
  defaultWidth: number
  minWidth?: number
  maxWidth?: number
  position: 'left' | 'right'
  collapsible?: boolean
}

withDefaults(defineProps<Props>(), {
  minWidth: 200,
  maxWidth: 600,
  collapsible: false
})
</script>

<style scoped lang="scss">
.resizable-panel.placeholder {
  border: 1px dashed var(--color-border);
  padding: 12px;
  min-width: 200px;

  .placeholder-text {
    color: var(--color-text-disabled);
    font-size: 12px;
    text-align: center;
    padding: 8px;
  }
}
</style>
