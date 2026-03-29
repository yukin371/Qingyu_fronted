<template>
  <header class="workspace-topbar">
    <div class="workspace-topbar__left">
      <button class="topbar-back-btn" :title="'返回工作台'" @click="$emit('back')">
        <QyIcon name="ArrowLeft" :size="14" />
        <span>{{ projectDisplayName }}</span>
      </button>
    </div>

    <div class="workspace-topbar__center">
      <span class="chapter-title">{{ currentChapterTitle || '未选择章节' }}</span>
      <span v-if="saveStatusLabel" class="status-text">· {{ saveStatusLabel }}</span>
    </div>

    <div class="workspace-topbar__right">
      <button class="topbar-btn" :title="'保存'" @click="$emit('save')">
        <QyIcon name="DocumentChecked" :size="14" />
        <span>保存</span>
      </button>
      <button class="topbar-btn" :title="'导出'" @click="$emit('export')">
        <QyIcon name="Download" :size="14" />
        <span>导出</span>
      </button>
      <div class="topbar-divider"></div>
      <!-- 溢出菜单 -->
      <div class="topbar-overflow" @click.stop>
        <button class="topbar-btn topbar-btn--icon" :title="'更多操作'" @click="overflowOpen = !overflowOpen">
          <QyIcon name="MoreFilled" :size="16" />
        </button>
        <div v-if="overflowOpen" class="topbar-overflow__menu">
          <button class="topbar-overflow__item" @click="$emit('share'); overflowOpen = false">
            <QyIcon name="Share" :size="14" />
            <span>分享</span>
          </button>
          <button class="topbar-overflow__item" @click="showShortcutSettings = true; overflowOpen = false">
            <QyIcon name="SetUp" :size="14" />
            <span>快捷键设置</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 快捷键设置弹窗 -->
    <el-dialog
      v-model="showShortcutSettings"
      title="快捷键设置"
      width="560px"
      :close-on-click-modal="true"
      :append-to-body="true"
      class="shortcut-settings-dialog"
    >
      <ShortcutSettingsPanel />
    </el-dialog>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElDialog } from 'element-plus'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import ShortcutSettingsPanel from '../settings/ShortcutSettingsPanel.vue'

defineProps<{
  projectDisplayName: string
  currentChapterTitle: string
  activeToolLabel: string
  saveStatusLabel: string
  isImmersiveMode: boolean
}>()

defineEmits<{
  (e: 'back'): void
  (e: 'save'): void
  (e: 'export'): void
  (e: 'share'): void
}>()

const overflowOpen = ref(false)
const showShortcutSettings = ref(false)

function closeOverflow() {
  overflowOpen.value = false
}

onMounted(() => document.addEventListener('click', closeOverflow))
onUnmounted(() => document.removeEventListener('click', closeOverflow))
</script>

<style scoped lang="scss">
.workspace-topbar {
  height: 44px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--editor-bg-surface, #f8fafc);
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

// ── Left: back + project name ──
.workspace-topbar__left {
  min-width: 0;
  flex-shrink: 0;
}

.topbar-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ── Center: chapter title + save status ──
.workspace-topbar__center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
}

.chapter-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--editor-text-primary, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.status-text {
  font-size: 11px;
  color: var(--editor-text-ghost, #94a3b8);
  white-space: nowrap;
  flex-shrink: 0;
}

// ── Right: action buttons ──
.workspace-topbar__right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.topbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: var(--editor-radius-md, 6px);
  background: var(--editor-bg-base, #ffffff);
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  white-space: nowrap;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    border-color: var(--editor-border-focus, #06b6d4);
    color: var(--editor-text-primary, #0f172a);
  }

  &--icon {
    padding: 0 6px;
    border: none;
    background: transparent;

    &:hover {
      background: var(--editor-bg-elevated, #f1f5f9);
      border: none;
    }
  }
}

.topbar-divider {
  width: 1px;
  height: 18px;
  background: var(--editor-border, #e2e8f0);
  margin: 0 2px;
}

// ── Overflow menu ──
.topbar-overflow {
  position: relative;
}

.topbar-overflow__menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--editor-bg-base, #ffffff);
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: var(--editor-radius-lg, 8px);
  box-shadow: var(--editor-shadow-md, 0 4px 12px rgba(0,0,0,0.08));
  padding: 4px;
  z-index: 100;
  min-width: 120px;
}

.topbar-overflow__item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-primary, #0f172a);
  }
}
</style>
