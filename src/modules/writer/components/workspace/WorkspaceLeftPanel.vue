<template>
  <div
    class="workspace-left-panel-shell"
    :class="{ 'is-collapsed': collapsed, 'is-immersive-focus': isImmersiveMode }"
  >
    <!-- 折叠状态：Dock 图标栏 -->
    <aside v-if="collapsed" class="workspace-left-dock" aria-label="左侧工具栏">
      <button
        type="button"
        class="dock-item"
        :class="{ active: activeTab === 'chapters' }"
        :title="'章节'"
        @click="handleDockClick('chapters')"
      >
        <QyIcon name="Document" :size="18" />
      </button>
      <button
        type="button"
        class="dock-item"
        :class="{ active: activeTab === 'outline' }"
        :title="'大纲'"
        @click="handleDockClick('outline')"
      >
        <QyIcon name="Memo" :size="18" />
      </button>
      <button
        type="button"
        class="dock-item dock-item--primary"
        :title="'结构舞台'"
        @click="openTool('structure')"
      >
        <QyIcon name="Grid" :size="18" />
      </button>

      <!-- 分隔线 -->
      <div class="dock-divider"></div>

      <button type="button" class="dock-item" :title="'资产总览'" @click="openTool('assets')">
        <QyIcon name="Collection" :size="18" />
      </button>
      <button type="button" class="dock-item" :title="'展开更多工具'" @click="$emit('toggle')">
        <QyIcon name="ArrowRight" :size="18" />
      </button>
    </aside>

    <!-- 展开状态：顶部 Tab 栏 -->
    <header v-else class="workspace-left-tabs">
      <div class="tab-group">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'chapters' }"
          @click="activeTab = 'chapters'"
        >
          章节
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'outline' }"
          @click="activeTab = 'outline'"
        >
          大纲
        </button>
      </div>

      <button
        type="button"
        class="primary-tool-btn"
        title="打开结构舞台"
        @click="openTool('structure')"
      >
        <QyIcon name="Grid" :size="14" />
        <span>结构舞台</span>
      </button>

      <!-- 更多工具下拉菜单 -->
      <div class="more-tools-dropdown" v-click-outside="closeMoreMenu">
        <button
          type="button"
          class="more-btn"
          :class="{ active: moreMenuOpen }"
          @click="moreMenuOpen = !moreMenuOpen"
        >
          工具
        </button>
        <div v-if="moreMenuOpen" class="dropdown-menu">
          <button
            type="button"
            class="dropdown-item dropdown-item--featured"
            @click="openTool('assets')"
          >
            <QyIcon name="Collection" :size="14" />
            <span>资产总览</span>
          </button>
          <div class="dropdown-section-label">专业工具</div>
          <button type="button" class="dropdown-item" @click="openTool('relations')">
            <QyIcon name="Share" :size="14" />
            <span>关系图谱</span>
          </button>
          <button type="button" class="dropdown-item" @click="openTool('timeline')">
            <QyIcon name="Clock" :size="14" />
            <span>时间线</span>
          </button>
          <button type="button" class="dropdown-item" @click="openTool('branches')">
            <QyIcon name="Connection" :size="14" />
            <span>故事分支</span>
          </button>
        </div>
      </div>

      <!-- 折叠按钮 -->
      <button type="button" class="collapse-btn" :title="'折叠面板'" @click="$emit('toggle')">
        <QyIcon name="ArrowLeft" :size="14" />
      </button>
    </header>

    <!-- 内容区域 -->
    <div class="workspace-left-panel-body">
      <ProjectSidebar
        v-if="activeTab === 'chapters'"
        v-model:projectId="localProjectId"
        v-model:chapterId="localChapterId"
        :projects="projects"
        :chapters="chapters"
        @add-doc="emit('add-doc')"
        @open-directory-outline="(id: string) => emit('open-directory-outline', id)"
        @delete-chapter="(id: string) => emit('delete-chapter', id)"
      />

      <OutlineTreePanel
        v-else-if="activeTab === 'outline'"
        :nodes="outlineTreeNodes"
        :selected-node-id="outlineTreeState.selectedNodeId.value"
        :expanded-node-ids="outlineTreeState.expandedNodeIds.value"
        :chapters="chapterOptions"
        :chapter-graphs="chapterGraphs"
        :asset-summary-by-chapter-id="assetSummaryByChapterId"
        :current-chapter-id="chapterId"
        :loading="isOutlineLoading"
        :can-move-up="outlineTreeState.canMoveUp.value"
        :can-move-down="outlineTreeState.canMoveDown.value"
        @toggle="outlineTreeState.toggleNode"
        @select="handleOutlineSelect"
        @create-root="emit('create-outline-root')"
        @create-child="emit('create-outline-child')"
        @open-graph="(chapterId: string) => $emit('open-graph', chapterId)"
        @convert-to-chapter="handleConvertToChapter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import ProjectSidebar from '@/modules/writer/components/ProjectSidebar.vue'
import OutlineTreePanel from '@/modules/writer/components/workspace/structure/OutlineTreePanel.vue'
import { useWriterStore } from '@/modules/writer/stores/writerStore'
import { loadCharacterGraphDraftState } from '@/modules/writer/utils/characterGraphDrafts'
import {
  loadWriterAssetRefState,
  summarizeWriterAssetRefs,
  type WriterAssetSummary,
} from '@/modules/writer/utils/writerAssetRefs'
import { useOutlineTreeState } from '@/modules/writer/composables/useOutlineTreeState'
import type {
  SidebarProjectSummary,
  SidebarChapterSummary,
} from '@/modules/writer/composables/types'
import type { OutlineNode } from '@/types/writer'
import type { ChapterGraph } from '@/modules/writer/types/character'

const writerStore = useWriterStore()
const outlineTreeState = useOutlineTreeState()

// =======================
// Props & Emits
// =======================
const props = defineProps<{
  collapsed: boolean
  isImmersiveMode: boolean
  projects: SidebarProjectSummary[]
  chapters: SidebarChapterSummary[]
  projectId: string
  chapterId: string
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'update:projectId', value: string): void
  (e: 'update:chapterId', value: string): void
  (e: 'add-doc'): void
  (e: 'open-directory-outline', directoryId: string): void
  (e: 'delete-chapter', chapterId: string): void
  (e: 'create-outline-root'): void
  (e: 'create-outline-child'): void
  (e: 'open-graph', chapterId: string): void
  (e: 'open-fullscreen-tool', tool: string): void
  (e: 'outline-select', node: OutlineNode): void
  (e: 'convert-to-chapter', payload: { outlineNode: OutlineNode; volumeNode: OutlineNode }): void
}>()

// =======================
// Tab 状态
// =======================
type LeftTab = 'chapters' | 'outline'
const activeTab = ref<LeftTab>('chapters')

// =======================
// 更多工具菜单
// =======================
const moreMenuOpen = ref(false)

function closeMoreMenu() {
  moreMenuOpen.value = false
}

function openTool(tool: string) {
  moreMenuOpen.value = false
  emit('open-fullscreen-tool', tool)
}

// v-click-outside 指令简单实现
const vClickOutside = {
  mounted(el: HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void }, binding: any) {
    el.clickOutsideEvent = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: HTMLElement & { clickOutsideEvent?: (event: MouseEvent) => void }) {
    if (el.clickOutsideEvent) {
      document.removeEventListener('click', el.clickOutsideEvent)
    }
  },
}

// =======================
// Dock 点击处理
// =======================
function handleDockClick(tab: LeftTab) {
  if (activeTab.value === tab) {
    // 点击已激活图标 → 展开面板
    emit('toggle')
  } else {
    // 切换到其他 tab
    activeTab.value = tab
    emit('toggle')
  }
}

function handleOutlineSelect(node: OutlineNode) {
  outlineTreeState.selectNode(node)
  emit('outline-select', node)
}

// 转为章节处理
function handleConvertToChapter(payload: { outlineNode: OutlineNode; volumeNode: OutlineNode }) {
  emit('convert-to-chapter', payload)
}

// =======================
// 数据准备
// =======================
const chapterOptions = computed<SidebarChapterSummary[]>(() =>
  props.chapters.filter((chapter) => chapter.nodeType !== 'directory'),
)

const outlineTreeNodes = computed<OutlineNode[]>(() => {
  const tree = writerStore.outline.tree
  console.log('[WorkspaceLeftPanel] 获取大纲树:', tree)

  // 确保 tree 是数组
  if (Array.isArray(tree)) {
    console.log('[WorkspaceLeftPanel] 大纲树是数组，长度:', tree.length)
    return tree
  }
  // 如果不是数组，返回空数组
  console.warn('[WorkspaceLeftPanel] outline.tree is not an array:', tree)
  return []
})
const isOutlineLoading = computed(() => writerStore.outline.loading)

// 自动展开根节点
watch(
  () => writerStore.outline.tree,
  (tree) => {
    if (tree && tree.length > 0 && outlineTreeState.expandedNodeIds.value.length === 0) {
      console.log('[WorkspaceLeftPanel] 自动展开根节点')
      outlineTreeState.expandRootNodes()
    }
  },
  { immediate: true },
)

const graphDraftState = computed(() => loadCharacterGraphDraftState(props.projectId))
const chapterGraphs = computed<ChapterGraph[]>(() => graphDraftState.value.chapterGraphs)

const assetRefState = computed(() => loadWriterAssetRefState(props.projectId))
const assetSummaryByChapterId = computed<Record<string, WriterAssetSummary>>(() => {
  const summaries: Record<string, WriterAssetSummary> = {}
  for (const chapter of chapterOptions.value) {
    const chapterRefs = assetRefState.value.chapterRefs[chapter.id] || []
    const volumeRefs = chapter.parentId
      ? assetRefState.value.volumeRefs[chapter.parentId] || []
      : []
    const merged = [...chapterRefs]
    const seen = new Set(
      chapterRefs.map((ref) => `${ref.assetType}:${ref.assetId || ref.assetName}`),
    )
    for (const ref of volumeRefs) {
      const key = `${ref.assetType}:${ref.assetId || ref.assetName}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(ref)
    }
    summaries[chapter.id] = summarizeWriterAssetRefs(merged)
  }
  return summaries
})

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
</script>

<style scoped lang="scss">
.workspace-left-panel-shell {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 56px;
  background: var(--editor-bg-surface, #f8fafc);
  border-right: 1px solid var(--editor-border, #e2e8f0);
  position: relative;
  transition: width 150ms ease-out;
}

.workspace-left-panel-shell.is-collapsed {
  width: 56px !important;
  min-width: 56px !important;
}

.workspace-left-panel-shell.is-collapsed .workspace-left-panel-body {
  width: 0;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
}

.workspace-left-panel-shell.is-immersive-focus {
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

// =======================
// 顶部 Tab 栏
// =======================
.workspace-left-tabs {
  height: 44px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid var(--editor-border, #e2e8f0);
  background: var(--editor-bg-surface, #f8fafc);
  flex-shrink: 0;
}

.tab-group {
  display: flex;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.primary-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(50, 83, 106, 0.16);
  border-radius: var(--editor-radius-md, 6px);
  background: rgba(236, 254, 255, 0.72);
  color: var(--editor-accent, #06b6d4);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    background: rgba(236, 254, 255, 0.96);
    color: var(--editor-text-primary, #0f172a);
    border-color: rgba(50, 83, 106, 0.24);
  }
}

.tab-btn {
  flex: 1;
  padding: 6px 10px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease-out;
  white-space: nowrap;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-secondary, #334155);
  }

  &.active {
    background: var(--editor-accent-soft, #ecfeff);
    color: var(--editor-accent, #06b6d4);
    font-weight: 600;
  }
}

// =======================
// 更多工具下拉菜单
// =======================
.more-tools-dropdown {
  position: relative;
  flex-shrink: 0;
}

.more-btn {
  min-width: 40px;
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 120ms ease-out;
  line-height: 1;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-secondary, #334155);
  }

  &.active {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-accent, #06b6d4);
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 156px;
  background: var(--editor-bg-base, #ffffff);
  border: 1px solid var(--editor-border, #e2e8f0);
  border-radius: var(--editor-radius-lg, 8px);
  box-shadow: var(--editor-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.08));
  padding: 4px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 120ms ease-out;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-primary, #0f172a);
  }

  span {
    flex: 1;
  }
}

.dropdown-item--featured {
  background: rgba(236, 254, 255, 0.56);
  color: var(--editor-accent, #06b6d4);
}

.dropdown-section-label {
  padding: 6px 10px 4px;
  color: var(--editor-text-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

// =======================
// 折叠按钮
// =======================
.collapse-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-text-muted, #64748b);
  cursor: pointer;
  transition: all 120ms ease-out;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--editor-bg-elevated, #f1f5f9);
    color: var(--editor-text-secondary, #334155);
  }
}

// =======================
// Dock 图标栏（折叠状态）
// =======================
.workspace-left-dock {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 4px;
  height: 100%;
  background: var(--editor-bg-actbar, #f1f5f9);
  border-right: 1px solid var(--editor-border, #e2e8f0);
}

.dock-item {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--editor-radius-md, 6px);
  background: transparent;
  color: var(--editor-actbar-icon, #64748b);
  cursor: pointer;
  transition:
    background 120ms ease-out,
    color 120ms ease-out;

  &:hover {
    background: var(--editor-bg-elevated, #e8edf2);
    color: var(--editor-text-primary, #0f172a);
  }

  &.active {
    background: var(--editor-accent-soft, #ecfeff);
    color: var(--editor-accent, #06b6d4);
  }

  // 主辅助工具样式：结构舞台等默认主辅助工具有微妙高亮
  &--primary {
    color: var(--editor-accent, #06b6d4);

    &:not(.active) {
      background: rgba(6, 182, 212, 0.08);
    }

    &:hover {
      background: rgba(6, 182, 212, 0.14);
      color: var(--editor-accent, #06b6d4);
    }
  }
}

.dock-divider {
  width: 24px;
  height: 1px;
  background: var(--editor-border, #e2e8f0);
  margin: 4px 0;
}

// =======================
// 内容区域
// =======================
.workspace-left-panel-body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

// =======================
// 响应式
// =======================
@media (max-width: 1024px) {
  .workspace-left-tabs {
    padding: 0 8px;
  }

  .tab-btn {
    font-size: 12px;
    padding: 6px 8px;
  }

  .primary-tool-btn {
    padding: 0 8px;

    span {
      display: none;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .workspace-left-panel-shell,
  .tab-btn,
  .primary-tool-btn,
  .more-btn,
  .collapse-btn,
  .dropdown-item {
    transition: none;
  }
}
</style>
