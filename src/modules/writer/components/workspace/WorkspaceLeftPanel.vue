<template>
  <div
    class="workspace-left-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-focus': isImmersiveMode }"
  >
    <aside class="workspace-left-dock" aria-label="左侧工具栏">
      <button
        v-for="item in dockItems"
        :key="item.tool"
        type="button"
        class="workspace-left-dock__item"
        :class="{ active: activeToolForDock === item.tool }"
        :title="item.label"
        @click="$emit('dock-select', item.tool)"
      >
        <QyIcon :name="item.icon" :size="16" />
        <span class="workspace-left-dock__label">{{ item.label }}</span>
      </button>
    </aside>

    <div class="workspace-left-panel-body">
      <!-- 百科侧边栏 -->
      <div v-if="isEncyclopediaTool" class="world-sidebar">
        <div class="world-sidebar__header">{{ worldSidebarTitle }}</div>
        <template v-if="encyclopediaSubView === 'encyclopedia'">
          <QyGhostButton
            class="world-sidebar__item"
            :active="encyclopediaCategory === 'characters'"
            @click="$emit('set-encyclopedia-category', 'characters')"
          >
            <span class="world-sidebar__icon">
              <QyIcon name="User" :size="14" />
            </span>
            <span class="world-sidebar__copy">
              <strong>角色卡片</strong>
              <em>人物设定与关键标签</em>
            </span>
          </QyGhostButton>
          <QyGhostButton
            class="world-sidebar__item"
            :active="encyclopediaCategory === 'locations'"
            @click="$emit('set-encyclopedia-category', 'locations')"
          >
            <span class="world-sidebar__icon">
              <QyIcon name="LocationInformation" :size="14" />
            </span>
            <span class="world-sidebar__copy">
              <strong>地点卡片</strong>
              <em>空间信息与世界观锚点</em>
            </span>
          </QyGhostButton>
        </template>
        <div v-else class="world-sidebar__hint">
          <p>{{ worldSidebarHint }}</p>
        </div>
      </div>

      <!-- 项目侧边栏 -->
      <ProjectSidebar
        v-else
        v-model:projectId="localProjectId"
        v-model:chapterId="localChapterId"
        :projects="projects"
        :chapters="chapters"
        @add-chapter="$emit('add-chapter')"
        @add-volume="$emit('add-volume')"
        @open-directory-outline="(id: string) => $emit('open-directory-outline', id)"
        @delete-chapter="(id: string) => $emit('delete-chapter', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import ProjectSidebar from '@/modules/writer/components/ProjectSidebar.vue'
import type {
  SidebarProjectSummary,
  SidebarChapterSummary,
  LeftDockTool,
  EncyclopediaSubView,
  EncyclopediaCategory,
} from '@/modules/writer/composables/types'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  /** 面板是否折叠 */
  collapsed: boolean
  /** 是否处于沉浸模式 */
  isImmersiveMode: boolean
  /** 当前选中的工具 (用于高亮 dock) */
  activeToolForDock: LeftDockTool
  /** 是否为百科工具 */
  isEncyclopediaTool: boolean
  /** 百科子视图 */
  encyclopediaSubView: EncyclopediaSubView
  /** 百科分类 */
  encyclopediaCategory: EncyclopediaCategory
  /** 百科侧边栏标题 */
  worldSidebarTitle: string
  /** 百科侧边栏提示 */
  worldSidebarHint: string
  /** 项目列表 */
  projects: SidebarProjectSummary[]
  /** 章节列表 */
  chapters: SidebarChapterSummary[]
  /** 当前项目 ID */
  projectId: string
  /** 当前章节 ID */
  chapterId: string
}>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  /** 更新项目 ID */
  (e: 'update:projectId', value: string): void
  /** 更新章节 ID */
  (e: 'update:chapterId', value: string): void
  /** Dock 工具选择 */
  (e: 'dock-select', tool: LeftDockTool): void
  /** 设置百科分类 */
  (e: 'set-encyclopedia-category', category: EncyclopediaCategory): void
  /** 快速添加章节 */
  (e: 'add-chapter'): void
  /** 快速添加卷 */
  (e: 'add-volume'): void
  /** 打开目录大纲 */
  (e: 'open-directory-outline', directoryId: string): void
  /** 删除章节 */
  (e: 'delete-chapter', chapterId: string): void
}>()

// =======================
// 本地双向绑定
// =======================
const localProjectId = computed({
  get: () => props.projectId,
  set: (val) => emit('update:projectId', val),
})

const localChapterId = computed({
  get: () => props.chapterId,
  set: (val) => emit('update:chapterId', val),
})

// =======================
// Dock 配置
// =======================
const dockItems: Array<{ tool: LeftDockTool; label: string; icon: string }> = [
  { tool: 'writing', label: '写作', icon: 'Edit' },
  { tool: 'immersive', label: '沉浸', icon: 'FullScreen' },
  { tool: 'relations', label: '关系', icon: 'Share' },
  { tool: 'encyclopedia', label: '百科', icon: 'Collection' },
  { tool: 'timeline', label: '时间', icon: 'Clock' },
  { tool: 'branches', label: '分支', icon: 'Connection' },
]
</script>

<style scoped lang="scss">
.workspace-left-panel-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  width: 100%;
  min-width: 0;
}

.workspace-left-dock {
  width: 56px;
  flex: 0 0 56px;
  border-right: 1px solid #d7deeb;
  background: linear-gradient(180deg, #ffffff, #f2f7ff);
  position: relative;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
}

.workspace-left-dock__item {
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

.workspace-left-dock__item:hover {
  border-color: #95b3f8;
  background: #eff5ff;
}

.workspace-left-dock__item.active {
  border-color: #2f6fff;
  background: linear-gradient(140deg, #eaf1ff, #dce9ff);
  color: #1f4ec2;
  box-shadow: 0 8px 14px rgba(47, 111, 255, 0.14);
}

.workspace-left-dock__label {
  position: absolute;
  left: calc(100% + 8px);
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

.workspace-left-dock__item:hover .workspace-left-dock__label,
.workspace-left-dock__item:focus-visible .workspace-left-dock__label {
  opacity: 1;
}

.workspace-left-dock__item :deep(.qy-icon) {
  color: currentColor;
}

.workspace-left-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.workspace-left-panel-shell.is-collapsed .workspace-left-panel-body {
  width: 0;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
}

.workspace-left-panel-shell.is-collapsed :deep(.side-panel),
.workspace-left-panel-shell.is-collapsed :deep(.side-panel__content) {
  overflow: visible !important;
}

.workspace-left-panel-shell.is-immersive-focus {
  width: 56px !important;
  min-width: 56px !important;
  max-width: 56px !important;
}

.workspace-left-panel-shell.is-immersive-focus .workspace-left-dock {
  width: 56px !important;
  min-width: 56px !important;
}

.workspace-left-panel-shell.is-immersive-focus .workspace-left-panel-body {
  width: 0 !important;
  min-width: 0 !important;
  max-width: 0 !important;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

.world-sidebar {
  height: 100%;
  padding: 16px 12px;
  border-right: 1px solid #d7deeb;
  background: linear-gradient(180deg, #f8fbff, #f0f5ff);
}

.world-sidebar__header {
  font-size: 11px;
  color: #63708b;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.world-sidebar__item {
  width: 100%;
  text-align: left;
  border: 1px solid #d8e0ef;
  color: #283452;
  border-radius: 10px;
  padding: 10px 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.world-sidebar__item:hover {
  border-color: #3b82f6;
  background: #f4f8ff;
}

.world-sidebar__item.active {
  border-color: #2f6fff;
  background: linear-gradient(130deg, #edf3ff, #e4eeff);
  color: #1f4ec2;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(47, 111, 255, 0.14);
}

.world-sidebar__icon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 111, 255, 0.12);
  color: currentColor;
  flex: 0 0 20px;
}

.world-sidebar__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.world-sidebar__copy strong {
  font-size: 12px;
  line-height: 1.1;
  font-weight: 700;
}

.world-sidebar__copy em {
  margin: 0;
  font-style: normal;
  font-size: 11px;
  line-height: 1.2;
  color: #677694;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.world-sidebar__hint {
  border: 1px solid #dbe4f3;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px 12px;
  color: #5f7191;
  font-size: 12px;
  line-height: 1.65;
}

.world-sidebar__hint p {
  margin: 0;
}

@media (max-width: 1024px) {
  .workspace-left-dock {
    width: 50px;
    flex-basis: 50px;
    padding: 8px 6px;
  }

  .workspace-left-dock__label {
    display: none;
  }
}
</style>
