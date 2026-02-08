<template>
  <div class="editor-panel placeholder">
    <div class="placeholder-text">EditorPanel (待实现)</div>
  </div>
</template>

<style scoped lang="scss">
.editor-panel.placeholder {
  flex: 1;
  border: 1px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;

  .placeholder-text {
    color: var(--color-text-disabled);
    font-size: 14px;
  }
}
</style>
