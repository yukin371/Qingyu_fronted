<template>
  <header class="workspace-topbar">
    <div class="workspace-topbar__title-group">
      <div class="workspace-topbar__logo">QY</div>
      <div class="workspace-topbar__title-block">
        <h1 class="workspace-topbar__title">{{ projectDisplayName }}</h1>
        <div class="workspace-topbar__meta">
          <span class="workspace-pill">{{ activeToolLabel }}</span>
          <span class="workspace-meta-text">当前章节：{{ currentChapterTitle }}</span>
          <span class="workspace-meta-text">{{ saveStatusLabel }}</span>
        </div>
      </div>
    </div>
    <div class="workspace-topbar__actions">
      <button
        type="button"
        class="workspace-action-btn workspace-action-btn--icon"
        :class="{ active: !leftPanelCollapsed }"
        title="切换左侧边栏"
        :disabled="isImmersiveMode"
        @click="$emit('toggle-left-panel')"
      >
        <QyIcon name="List" :size="14" />
      </button>
      <button
        type="button"
        class="workspace-action-btn workspace-action-btn--icon"
        :class="{ active: !rightPanelCollapsed }"
        title="切换右侧边栏"
        :disabled="isImmersiveMode"
        @click="$emit('toggle-right-panel')"
      >
        <QyIcon name="MagicStick" :size="14" />
      </button>
      <button type="button" class="workspace-action-btn" @click="$emit('save')">保存</button>
      <button type="button" class="workspace-action-btn" @click="$emit('export')">导出</button>
      <button
        type="button"
        class="workspace-action-btn workspace-action-btn--primary"
        @click="$emit('share')"
      >
        分享
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'

// =======================
// Props 定义
// =======================
defineProps<{
  /** 项目显示名称 */
  projectDisplayName: string
  /** 当前章节标题 */
  currentChapterTitle: string
  /** 当前工具标签 */
  activeToolLabel: string
  /** 保存状态标签 */
  saveStatusLabel: string
  /** 左侧面板是否折叠 */
  leftPanelCollapsed: boolean
  /** 右侧面板是否折叠 */
  rightPanelCollapsed: boolean
  /** 是否处于沉浸模式 */
  isImmersiveMode: boolean
}>()

// =======================
// Emits 定义
// =======================
defineEmits<{
  /** 切换左侧面板 */
  (e: 'toggle-left-panel'): void
  /** 切换右侧面板 */
  (e: 'toggle-right-panel'): void
  /** 保存 */
  (e: 'save'): void
  /** 导出 */
  (e: 'export'): void
  /** 分享 */
  (e: 'share'): void
}>()
</script>

<style scoped lang="scss">
.workspace-topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid #d5dfef;
  background: linear-gradient(110deg, #ffffff 0%, #f6f9ff 100%);
}

.workspace-topbar__title-group {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.workspace-topbar__logo {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #fff;
  background: linear-gradient(145deg, #1f63f0, #083ca5);
  box-shadow: 0 10px 18px rgba(31, 99, 240, 0.24);
}

.workspace-topbar__title-block {
  min-width: 0;
}

.workspace-topbar__title {
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 800;
  color: #13233f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-topbar__meta {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.workspace-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: #2053c6;
  background: #e5edff;
  border: 1px solid #c8d8ff;
}

.workspace-meta-text {
  font-size: 12px;
  color: #63708b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.workspace-action-btn {
  border: 1px solid #d4deef;
  background: #fff;
  color: #24344f;
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.workspace-action-btn:hover {
  border-color: #8cadf8;
  color: #1246b3;
  background: #f0f5ff;
}

.workspace-action-btn:disabled {
  opacity: 0.46;
  cursor: not-allowed;
}

.workspace-action-btn--primary {
  background: linear-gradient(145deg, #2f6fff, #1a4fcb);
  border-color: #2f6fff;
  color: #fff;
}

.workspace-action-btn--icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.workspace-action-btn--icon.active {
  border-color: #8cadf8;
  color: #1246b3;
  background: #f0f5ff;
}

.workspace-action-btn--primary:hover {
  filter: brightness(1.06);
  color: #fff;
}

@media (max-width: 1024px) {
  .workspace-topbar {
    height: auto;
    padding: 10px 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .workspace-topbar__actions {
    width: 100%;
  }

  .workspace-action-btn {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .workspace-topbar__meta {
    flex-wrap: wrap;
    gap: 6px;
  }

  .workspace-meta-text {
    font-size: 11px;
  }
}
</style>
