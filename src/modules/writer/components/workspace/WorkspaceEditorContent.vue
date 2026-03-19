<template>
  <!-- 百科视图 - 关系图谱 -->
  <CharacterGraphView v-if="isEncyclopedia && subView === 'relations'" />
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
  <!-- 百科视图 - 主页 -->
  <EncyclopediaView
    v-else-if="isEncyclopedia"
    :project-id="projectId"
    :embedded="true"
    :active-category="category"
    @update:active-category="$emit('update:category', $event)"
  />
  <!-- 写作编辑器 -->
  <TipTapEditorView
    v-else
    v-model="modelContent"
    :project-id="projectId"
    :document-id="chapterId"
    :readonly="false"
    :show-reference-panel="false"
    @save="$emit('save')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TipTapEditorView from '@/modules/writer/components/editor-new/TipTapEditorView.vue'
import EncyclopediaView from '@/modules/writer/views/EncyclopediaView.vue'
import CharacterGraphView from '@/modules/writer/views/CharacterGraphView.vue'
import TimelineOutlineView from '@/modules/writer/views/TimelineOutlineView.vue'
import StoryBranchView from '@/modules/writer/views/StoryBranchView.vue'
import type { EncyclopediaSubView, EncyclopediaCategory } from '@/modules/writer/composables/types'

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
  (e: 'save'): void
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
