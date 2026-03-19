<template>
  <footer class="workspace-statusbar" :class="{ 'workspace-statusbar--immersive': isImmersiveMode }">
    <div class="workspace-statusbar__stats">
      <span>章节数：{{ chapterCount }}</span>
      <span>目录节点：{{ directoryCount }}</span>
      <span>当前工具：{{ activeToolLabel }}</span>
      <span v-if="isImmersiveMode">沉浸计时：{{ immersiveTimerText }}</span>
    </div>
    <div class="workspace-statusbar__state">
      <span class="workspace-statusbar__dot" />
      <span>{{ isImmersiveMode ? '沉浸写作进行中' : saveStatusLabel }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
// =======================
// Props 定义
// =======================
defineProps<{
  /** 章节总数 */
  chapterCount: number
  /** 目录节点数 */
  directoryCount: number
  /** 当前工具标签 */
  activeToolLabel: string
  /** 保存状态标签 */
  saveStatusLabel: string
  /** 是否处于沉浸模式 */
  isImmersiveMode: boolean
  /** 沉浸计时文本 */
  immersiveTimerText: string
}>()
</script>

<style scoped lang="scss">
.workspace-statusbar {
  height: 30px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(90deg, #1f59d3, #1545a8);
  color: #f8fbff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.workspace-statusbar.workspace-statusbar--immersive {
  background: linear-gradient(90deg, #f0872f, #de6720);
}

.workspace-statusbar__stats {
  display: flex;
  align-items: center;
  gap: 16px;
  white-space: nowrap;
  overflow: hidden;
}

.workspace-statusbar__state {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.workspace-statusbar__dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #48e594;
  box-shadow: 0 0 0 5px rgba(72, 229, 148, 0.15);
}

@media (max-width: 1024px) {
  .workspace-statusbar {
    height: auto;
    min-height: 30px;
    padding: 6px 10px;
    flex-direction: column;
    align-items: flex-start;
  }

  .workspace-statusbar__stats {
    width: 100%;
    gap: 10px;
    overflow-x: auto;
  }
}
</style>
