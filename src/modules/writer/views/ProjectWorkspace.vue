<template>
  <EditorLayout>
    <!-- 左侧面板插槽 -->
    <template #left-panel>
      <ProjectSidebar
        v-model:projectId="currentProjectId"
        v-model:chapterId="currentChapterId"
        :projects="projects"
        :chapters="flatChapters"
        @add-chapter="showCreateDocDialog = true"
        @delete-chapter="handleDeleteChapter"
      />
    </template>

    <!-- 主编辑器插槽 -->
    <template #editor="{ activeTool }">
      <EditorPanel
        :content="fileContent"
        :project-name="currentProject?.title"
        :chapter-title="documentTitle"
        :active-tool="activeTool"
        :show-preview="showPreview"
        :show-timeline="showTimeline"
        :timeline-id="currentTimelineId"
        @update:content="handleContentUpdate"
        @save="handleManualSave"
        @togglePreview="showPreview = !showPreview"
        @formatCommand="handleToolbarCommand"
        @aiAssistant="toggleAISidebar"
        @contextmenu="handleContextMenu"
      />
    </template>

    <!-- 右侧AI面板插槽 -->
    <template #right-panel>
      <AIPanel
        v-model:collapsed="aiSidebarVisible"
        :session-id="currentProjectId"
        @send="handleAISend"
      />
    </template>
  </EditorLayout>

  <!-- 辅助组件 -->

  <!-- AI 右键菜单 -->
  <AIContextMenu
    v-if="contextMenu.visible"
    :visible="contextMenu.visible"
    :x="contextMenu.x"
    :y="contextMenu.y"
    :selected-text="contextMenu.selectedText"
    @action="handleAIAction"
    @update:visible="val => contextMenu.visible = val"
  />

  <!-- 新建文档对话框 -->
  <el-dialog v-model="showCreateDocDialog" title="新建文档" width="400px">
    <el-form :model="newDocForm">
      <el-form-item label="标题">
        <el-input v-model="newDocForm.title" placeholder="请输入文档标题" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="newDocForm.type">
          <el-option label="章节" value="chapter" />
          <el-option label="卷/分卷" value="volume" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showCreateDocDialog = false">取消</el-button>
      <el-button type="primary" @click="handleCreateDoc">创建</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
// 引入新的 Store 体系
import { useProjectStore } from '@/modules/writer/stores/projectStore'
import { useDocumentStore } from '@/modules/writer/stores/documentStore'
import { useEditorStore } from '@/modules/writer/stores/editorStore'
import { useWriterStore } from '@/modules/writer/stores/writerStore' // 假如还需要读取 timeline 等

// 引入组件
import EditorLayout from '@/modules/writer/components/editor/EditorLayout.vue'
import EditorPanel from '@/modules/writer/components/editor/EditorPanel.vue'
import ProjectSidebar from '@/modules/writer/components/ProjectSidebar.vue'
import AIPanel from '@/modules/writer/components/editor/AIPanel.vue'
import AIContextMenu from '@/modules/writer/components/ai/AIContextMenu.vue'

// 工具
import { formatMarkdown } from '@/modules/writer/utils/editor'

// =======================
// 状态初始化
// =======================
const route = useRoute()
const projectStore = useProjectStore()
const documentStore = useDocumentStore()
const editorStore = useEditorStore()
const writerStore = useWriterStore() // 用于 Timeline 数据

// UI Flags
const showPreview = ref(false)
const showTimeline = ref(false)
const showCreateDocDialog = ref(false)
const aiSidebarVisible = ref(false)

// Forms
const newDocForm = ref({ title: '', type: 'chapter' })
const contextMenu = reactive({ visible: false, x: 0, y: 0, selectedText: '' })

// =======================
// 数据绑定 (核心)
// =======================

// 1. 项目 ID
const currentProjectId = computed({
  get: () => projectStore.currentProjectId || (route.params.projectId as string),
  set: (id) => {
    if (id) {
      projectStore.loadDetail(id)
      documentStore.loadTree(id)
    }
  }
})

// 2. 文档 ID (切换文档的核心逻辑)
const currentChapterId = computed({
  get: () => documentStore.currentDocMeta?.id || '',
  set: async (id) => {
    if (!id) return
    // 切换前先保存旧的（虽然 Store 有 debounce，但切换是强制的）
    if (editorStore.isDirty) await editorStore.save()

    await documentStore.selectDocument(id) // 选中树节点
    await editorStore.loadContent(id)      // 加载编辑器内容
  }
})

// 3. 供 Sidebar 使用的数据源
const projects = computed(() => projectStore.projects)
const flatChapters = computed(() => documentStore.flatDocs || []) // 需确保 Store 中有这个 getter 或 state

// 4. 编辑器内容绑定 (双向绑定到 Store，Store 内处理自动保存)
const fileContent = computed({
  get: () => editorStore.content,
  set: (val) => editorStore.setContent(val)
})

const documentTitle = computed({
  get: () => documentStore.currentDocMeta?.title || '',
  set: (val) => {
    if (documentStore.currentDocMeta) {
      documentStore.currentDocMeta.title = val
    }
  }
})

// 当前项目信息
const currentProject = computed(() => projectStore.currentProject)

const currentTimelineId = computed(() => writerStore.timeline.currentTimeline?.id)

// =======================
// 业务逻辑方法
// =======================

// 初始化
onMounted(async () => {
  const pId = currentProjectId.value
  if (pId) {
    // 并行加载数据
    await Promise.all([
      projectStore.loadDetail(pId),
      documentStore.loadTree(pId)
    ])

    // 如果没有选中章节，且列表不为空，默认选第一个
    if (!currentChapterId.value && flatChapters.value.length > 0) {
      currentChapterId.value = flatChapters.value[0].id
    }
  }
})

// 内容更新处理
const handleContentUpdate = (newContent: string) => {
  editorStore.setContent(newContent)
}

// 手动保存内容
const handleManualSave = async () => {
  await editorStore.save()
  message.success('保存成功')
}

// 创建文档
const handleCreateDoc = async () => {
  if (!newDocForm.value.title) return
  try {
    await documentStore.create(currentProjectId.value, {
      title: newDocForm.value.title,
      type: newDocForm.value.type as 'chapter' | 'volume',
      projectId: currentProjectId.value
    })

    showCreateDocDialog.value = false
    newDocForm.value.title = ''
  } catch {
    message.error('创建失败')
  }
}

// 删除文档
const handleDeleteChapter = async (docId: string) => {
  try {
    await messageBox.confirm('确定删除该章节吗？此操作不可恢复', '警告', { type: 'warning' })
    await documentStore.remove(docId)
    // 如果删除的是当前文档，清空编辑器
    if (docId === currentChapterId.value) {
      editorStore.reset() // 需要在 store 中实现 reset
    }
  } catch {
    // cancel
  }
}

// 工具栏命令
const handleToolbarCommand = (cmd: string) => {
  // 由于EditorPanel使用contenteditable，需要特殊处理
  // 这里暂时简单处理，直接在editorStore上操作
  // 实际可能需要通过emit传递DOM引用
  const editorElement = document.querySelector('.editor-content') as HTMLDivElement
  if (editorElement) {
    formatMarkdown(cmd, editorElement)
    editorStore.setContent(editorElement.textContent || '')
  }
}

// AI 相关
const toggleAISidebar = () => aiSidebarVisible.value = !aiSidebarVisible.value

const handleContextMenu = (event: MouseEvent, selectedText: string) => {
  if (selectedText) {
    contextMenu.x = event.clientX
    contextMenu.y = event.clientY
    contextMenu.selectedText = selectedText
    contextMenu.visible = true
  }
}

const handleAIAction = (action: string, text?: string) => {
  contextMenu.visible = false
  aiSidebarVisible.value = true
  // 这里可以调用 AI Store 设置当前模式和文本
  writerStore.setAITool(action as 'chat' | 'continue' | 'polish' | 'expand' | 'rewrite' | 'agent')
  if (text) writerStore.setSelectedText(text)
}

const handleAISend = (message: string) => {
  // 处理AI发送消息事件
  console.log('[ProjectWorkspace] AI send message:', message)
  // TODO: 集成到writerStore的AI功能
}
</script>

<style scoped lang="scss">
// ProjectWorkspace现在使用EditorLayout，不需要额外的样式
// 所有布局相关样式由EditorLayout及其子组件处理
</style>
