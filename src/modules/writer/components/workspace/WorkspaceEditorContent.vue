<template>
  <div class="creative-stage">
    <div class="creative-stage__body">
      <!-- 百科视图 - 关系图谱 -->
      <CharacterGraphView
        v-if="isEncyclopedia && subView === 'relations'"
        :chapter-id="chapterId"
        :chapters="chapters"
        @status-change="emit('status-change', $event)"
      />
      <!-- 百科视图 - 时间线 -->
      <TimelineOutlineView
        v-else-if="isEncyclopedia && subView === 'timeline'"
        :project-id="projectId"
      />
      <!-- 百科视图 - 分支 -->
      <StoryBranchView
        v-else-if="isEncyclopedia && subView === 'branches'"
        :project-id="projectId"
      />
      <!-- 结构舞台 -->
      <StructureStageView
        v-else-if="isEncyclopedia && subView === 'structure'"
        :project-id="projectId"
        :chapters="chapters"
        :current-chapter-id="chapterId"
        :current-chapter-title="chapterTitle"
        @open-graph="$emit('open-graph', $event)"
        @jump-to-chapter="$emit('jump-to-chapter', $event)"
      />
      <!-- 百科视图 - 主页 -->
      <EncyclopediaView
        v-else-if="isEncyclopedia"
        :project-id="projectId"
        :embedded="true"
        :active-category="category"
        @update:active-category="$emit('update:category', $event)"
      />
      <!-- 空状态 - 未选择章节 -->
      <div v-else-if="!chapterId" class="editor-empty-state">
        <div class="empty-content">
          <QyIcon name="Document" :size="48" class="empty-icon" />
          <h3>请选择章节</h3>
          <p>从左侧目录中选择一个章节开始写作</p>
          <QyGhostButton @click="$emit('add-doc')">
            <QyIcon name="Plus" :size="14" />
            新建章节
          </QyGhostButton>
        </div>
      </div>
      <!-- 写作编辑器 -->
      <TipTapEditorView
        v-else
        v-model="modelContent"
        :project-id="projectId"
        :document-id="chapterId"
        :readonly="false"
        :show-reference-panel="false"
        @selection-action="emit('trigger-ai-action', $event)"
        @save="(contents: unknown[]) => $emit('save', contents)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TipTapEditorView from '@/modules/writer/components/editor-new/TipTapEditorView.vue'
import StructureStageView from '@/modules/writer/components/workspace/structure/StructureStageView.vue'
import EncyclopediaView from '@/modules/writer/views/EncyclopediaView.vue'
import CharacterGraphView from '@/modules/writer/views/CharacterGraphView.vue'
import TimelineOutlineView from '@/modules/writer/views/TimelineOutlineView.vue'
import StoryBranchView from '@/modules/writer/views/StoryBranchView.vue'
import QyIcon from '@/design-system/components/basic/QyIcon/QyIcon.vue'
import QyGhostButton from '@/design-system/components/basic/QyGhostButton/QyGhostButton.vue'
import type {
  EncyclopediaSubView,
  EncyclopediaCategory,
  SidebarChapterSummary,
} from '@/modules/writer/composables/types'

// =======================
// Props 定义
// =======================
const props = defineProps<{
  /** 当前激活的工具 */
  activeTool: string
  /** 是否为百科工具 */
  isEncyclopedia: boolean
  /** 百科子视图 */
  subView: EncyclopediaSubView
  /** 百科分类 */
  category: EncyclopediaCategory
  /** 当前项目 ID */
  projectId: string
  /** 当前章节 ID */
  chapterId: string
  /** 当前章节标题 */
  chapterTitle: string
  /** 章节列表 */
  chapters: SidebarChapterSummary[]
  /** 编辑器内容 */
  content: string
}>()

// =======================
// Emits 定义
// =======================
const emit = defineEmits<{
  /** 更新编辑器内容 */
  (e: 'update:content', value: string): void
  /** 更新百科分类 */
  (e: 'update:category', value: EncyclopediaCategory): void
  /** 保存 */
  (e: 'save', contents: unknown[]): void
  /** 添加文档 */
  (e: 'add-doc'): void
  /** 触发 AI 快捷动作 */
  (
    e: 'trigger-ai-action',
    payload: {
      action: string
      text: string
      instructions?: string
      from?: number
      to?: number
      applyMode?:
        | 'replace_selection'
        | 'insert_after_selection'
        | 'append_paragraph'
        | 'replace_document'
    },
  ): void
  /** 从结构舞台跳转章节 */
  (e: 'jump-to-chapter', chapterId: string): void
  /** 从结构舞台打开关系图谱 */
  (e: 'open-graph', chapterId: string): void
  /** 工作区底部状态栏扩展状态 */
  (e: 'status-change', chips: string[]): void
}>()

// =======================
// Computed
// =======================
/** 编辑器内容双向绑定 */
const modelContent = computed({
  get: () => props.content,
  set: (value: string) => emit('update:content', value),
})
</script>

<style scoped lang="scss">
.creative-stage {
  position: relative;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.creative-stage__body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px;
}

.editor-empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--editor-radius-lg, 8px);
  background: var(--editor-bg-surface, #f8fafc);
  border: 1px solid var(--editor-border, #e2e8f0);
}

.empty-content {
  text-align: center;
  padding: 40px;
  max-width: 320px;
}

.empty-icon {
  color: #d6b58f;
  margin-bottom: 16px;
}

.empty-content h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #2d2b29;
}

.empty-content p {
  margin: 0 0 20px;
  font-size: 14px;
  color: #74675d;
  line-height: 1.5;
}

@media (prefers-reduced-motion: reduce) {
  .empty-icon {
    transition: none;
  }
}
</style>
