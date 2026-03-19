<template>
  <div
    class="workspace-right-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-hidden': isImmersiveMode }"
  >
    <div class="workspace-right-panel-body">
      <AIPanel
        :session-id="projectId"
        :action-trigger="aiActionTrigger"
        @send="(msg: string) => $emit('ai-send', msg)"
        @apply-generated-text="(payload: AIApplyPayload) => $emit('ai-apply', payload)"
      />
    </div>
    <aside class="workspace-right-dock" aria-label="右侧工具栏">
      <button
        v-for="item in dockItems"
        :key="item.tool"
        type="button"
        class="workspace-right-dock__item"
        :class="{ active: activeRightDockTool === item.tool }"
        :title="item.label"
        @click="$emit('dock-select', item.tool)"
      >
        <QyIcon :name="item.icon" :size="16" />
        <span class="workspace-right-dock__label">{{ item.label }}</span>
      </button>
    </aside>
  </div>
</template>

<script setup lang="ts">
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import AIPanel from '@/modules/writer/components/editor/AIPanel.vue'

// =======================
// Types
// =======================
export type RightDockTool = 'ai'

export interface AIActionTrigger {
  id: number
  action: string
  text: string
  instructions?: string
}

export interface AIApplyPayload {
  action: string
  sourceText: string
  generatedText: string
}

// =======================
// Props 定义
// =======================
defineProps<{
  /** 面板是否折叠 */
  collapsed: boolean
  /** 是否处于沉浸模式 */
  isImmersiveMode: boolean
  /** 当前选中的右侧工具 */
  activeRightDockTool: RightDockTool
  /** 当前项目 ID */
  projectId: string
  /** AI 动作触发器 */
  aiActionTrigger: AIActionTrigger | null
}>()

// =======================
// Emits 定义
// =======================
defineEmits<{
  /** Dock 工具选择 */
  (e: 'dock-select', tool: RightDockTool): void
  /** AI 发送消息 */
  (e: 'ai-send', message: string): void
  /** AI 应用生成的文本 */
  (e: 'ai-apply', payload: AIApplyPayload): void
}>()

// =======================
// Dock 配置
// =======================
const dockItems: Array<{ tool: RightDockTool; label: string; icon: string }> = [
  { tool: 'ai', label: 'AI 助手', icon: 'MagicStick' },
]
</script>

<style scoped lang="scss">
.workspace-right-panel-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  width: 100%;
  min-width: 0;
}

.workspace-right-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.workspace-right-panel-shell.is-collapsed .workspace-right-panel-body {
  width: 0;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
}

.workspace-right-panel-shell.is-collapsed :deep(.side-panel),
.workspace-right-panel-shell.is-collapsed :deep(.side-panel__content) {
  overflow: visible !important;
}

.workspace-right-panel-shell.is-immersive-hidden {
  width: 0 !important;
  min-width: 0 !important;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

.workspace-right-panel-shell.is-immersive-hidden .workspace-right-dock,
.workspace-right-panel-shell.is-immersive-hidden .workspace-right-panel-body {
  width: 0 !important;
  min-width: 0 !important;
  opacity: 0;
  pointer-events: none;
}

.workspace-right-dock {
  width: 56px;
  flex: 0 0 56px;
  border-left: 1px solid #d7deeb;
  background: linear-gradient(180deg, #ffffff, #f2f7ff);
  position: relative;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
}

.workspace-right-dock__item {
  width: 100%;
  border: 1px solid #d8e1f2;
  border-radius: 10px;
  padding: 7px 4px;
  background: #fff;
  color: #314360;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.workspace-right-dock__item:hover {
  border-color: #95b3f8;
  background: #eff5ff;
}

.workspace-right-dock__item.active {
  border-color: #2f6fff;
  background: linear-gradient(140deg, #eaf1ff, #dce9ff);
  color: #1f4ec2;
  box-shadow: 0 8px 14px rgba(47, 111, 255, 0.14);
}

.workspace-right-dock__label {
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  background: #0f1e3a;
  color: #fff;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.16s ease;
  z-index: 120;
}

.workspace-right-dock__item:hover .workspace-right-dock__label,
.workspace-right-dock__item:focus-visible .workspace-right-dock__label {
  opacity: 1;
}

.workspace-right-dock__item :deep(.qy-icon) {
  color: currentColor;
}

@media (max-width: 1024px) {
  .workspace-right-dock {
    width: 50px;
    flex-basis: 50px;
    padding: 8px 6px;
  }

  .workspace-right-dock__label {
    display: none;
  }
}
</style>
