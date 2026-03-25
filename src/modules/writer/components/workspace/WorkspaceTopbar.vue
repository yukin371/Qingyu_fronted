<template>
  <header class="workspace-topbar">
    <div class="workspace-topbar__left">
      <QyButton
        variant="secondary"
        size="sm"
        class="workspace-back-btn"
        title="返回创作中心"
        @click="$emit('back')"
      >
        <template #default>
          <QyIcon name="ArrowLeft" :size="16" />
        </template>
      </QyButton>
      <div class="workspace-topbar__project-info">
        <h1 class="workspace-topbar__project-name">{{ projectDisplayName }}</h1>
      </div>
    </div>

    <div class="workspace-topbar__center">
      <div class="workspace-topbar__chapter-status">
        <span class="chapter-title">{{ currentChapterTitle || '未选择章节' }}</span>
        <span class="status-divider" v-if="saveStatusLabel">·</span>
        <span class="status-text">{{ saveStatusLabel }}</span>
      </div>
    </div>

    <div class="workspace-topbar__right">
      <div class="workspace-topbar__actions">
        <QyButton
          variant="secondary"
          size="sm"
          :class="!leftPanelCollapsed ? 'active' : ''"
          title="切换左侧边栏"
          :disabled="isImmersiveMode"
          @click="$emit('toggle-left-panel')"
        >
          <QyIcon name="List" :size="14" />
          <span class="workspace-action-btn__mobile-label">目录</span>
        </QyButton>
        <QyButton
          variant="secondary"
          size="sm"
          :class="!rightPanelCollapsed ? 'active' : ''"
          title="切换右侧边栏"
          :disabled="isImmersiveMode"
          @click="$emit('toggle-right-panel')"
        >
          <QyIcon name="MagicStick" :size="14" />
          <span class="workspace-action-btn__mobile-label">AI</span>
        </QyButton>

        <div class="action-divider"></div>

        <QyButton variant="secondary" size="sm" @click="$emit('save')">保存</QyButton>
        <QyButton variant="secondary" size="sm" @click="$emit('export')">导出</QyButton>
        <QyButton variant="primary" size="sm" @click="$emit('share')">分享</QyButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyButton from '@/design-system/components/basic/QyButton/QyButton.vue'

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
  /** 返回 */
  (e: 'back'): void
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
  position: relative;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.workspace-topbar__left,
.workspace-topbar__right {
  display: flex;
  align-items: center;
  flex: 1;
}

.workspace-topbar__right {
  justify-content: flex-end;
}

.workspace-topbar__center {
  flex: 2;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.workspace-back-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  min-height: 0 !important;
  margin-right: 12px;
}

.workspace-topbar__project-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.workspace-topbar__chapter-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 20px;
  font-size: 13px;
  color: #4a4a4a;
  max-width: 100%;

  .chapter-title {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-divider {
    color: #999;
  }

  .status-text {
    font-size: 12px;
    color: #888;
    white-space: nowrap;
  }
}

.workspace-topbar__actions {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.qy-button) {
    min-height: 32px;
    height: 32px;
    padding: 0 12px;
  }
}

.action-divider {
  width: 1px;
  height: 20px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 4px;
}

@media (max-width: 768px) {
  .workspace-topbar__project-info {
    display: none;
  }

  .workspace-topbar__center {
    display: none;
  }
}
</style>
