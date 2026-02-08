<template>
  <div class="side-panel placeholder">
    <div class="placeholder-text">SidePanel (待实现)</div>
    <slot />
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
.side-panel.placeholder {
  border: 1px dashed var(--color-border);
  padding: 12px;
  height: 100%;

  .placeholder-text {
    color: var(--color-text-disabled);
    font-size: 12px;
    text-align: center;
    padding: 8px;
  }
}
</style>
