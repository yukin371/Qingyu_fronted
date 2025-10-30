<template>
  <div class="project-workspace">
    <!-- 左侧文档列表 -->
    <aside class="document-sidebar">
      <div class="sidebar-header">
        <h3>{{ currentProject?.name || '项目文档' }}</h3>
        <el-button size="small" @click="showCreateDocDialog = true">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>

      <div class="document-list">
        <div
          v-for="doc in documentList"
          :key="doc.id"
          :class="['document-item', { active: currentDocumentId === doc.id }]"
          @click="selectDocument(doc.id)"
        >
          <el-icon class="doc-icon"><Document /></el-icon>
          <span class="doc-title">{{ doc.title }}</span>
          <el-dropdown @command="handleDocCommand($event, doc)" trigger="click">
            <el-icon class="more-icon" @click.stop><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">重命名</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <el-empty v-if="documentList.length === 0" description="暂无文档" />
      </div>
    </aside>

    <!-- 右侧编辑区域 -->
    <main class="editor-main">
      <div v-if="!currentDocument" class="empty-editor">
        <el-empty description="请选择或创建一个文档开始编辑" />
      </div>

      <div v-else class="editor-container">
        <!-- 文档头部 -->
        <div class="editor-header">
          <el-input
            v-model="currentDocument.title"
            class="doc-title-input"
            placeholder="文档标题"
            @change="saveDocumentTitle"
          />
          <div class="editor-actions">
            <el-button @click="goBack" link>
              <el-icon><Back /></el-icon>
              返回项目列表
            </el-button>
            <span class="save-status">{{ saveStatus }}</span>
          </div>
        </div>

        <!-- 编辑器 -->
        <div class="editor-content">
          <textarea
            ref="editorTextarea"
            v-model="documentContent"
            class="content-textarea"
            placeholder="开始写作..."
            @input="handleContentChange"
          ></textarea>
        </div>

        <!-- 底部状态栏 -->
        <div class="editor-footer">
          <span class="status-item">字数: {{ wordCount }}</span>
          <span class="status-item">最后保存: {{ lastSaveTime }}</span>
        </div>
      </div>
    </main>

    <!-- 创建文档对话框 -->
    <el-dialog v-model="showCreateDocDialog" title="新建文档" width="400px">
      <el-input v-model="newDocTitle" placeholder="请输入文档标题" />
      <template #footer>
        <el-button @click="showCreateDocDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateDoc">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElEmpty } from 'element-plus'
import { Plus, Document, MoreFilled, Back } from '@element-plus/icons-vue'
import { useWriterStore } from '@/stores/writer'
import { useProjectStore } from '@/stores/project'

const route = useRoute()
const router = useRouter()
const writerStore = useWriterStore()
const projectStore = useProjectStore()

const projectId = route.params.projectId as string

// State
const showCreateDocDialog = ref(false)
const newDocTitle = ref('')
const editorTextarea = ref<HTMLTextAreaElement | null>(null)
let autoSaveTimer: NodeJS.Timeout | null = null

// Computed
const currentProject = computed(() => writerStore.currentProject)
const currentDocument = computed(() => projectStore.currentDocument)
const currentDocumentId = computed(() => projectStore.currentDocumentId)
const documentList = computed(() => projectStore.documentList)
const documentContent = computed({
  get: () => projectStore.editorContent,
  set: (value: string) => projectStore.updateEditorContent(value)
})
const saveStatus = computed(() => {
  if (projectStore.isSaving) return '保存中...'
  if (projectStore.hasUnsavedChanges) return '未保存'
  return '已保存'
})
const lastSaveTime = computed(() => {
  if (!projectStore.lastSaved) return '-'
  return new Date(projectStore.lastSaved).toLocaleTimeString('zh-CN')
})

const wordCount = computed(() => {
  if (!documentContent.value) return 0
  return documentContent.value.replace(/[\s\n\r]/g, '').length
})

// Methods
const selectDocument = async (docId: string) => {
  try {
    await projectStore.loadDocument(docId)
  } catch (error: any) {
    ElMessage.error('加载文档失败：' + (error.message || '未知错误'))
  }
}

const handleContentChange = () => {
  // 文档内容已通过computed自动更新到store

  // 清除旧的自动保存定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }

  // 设置新的自动保存定时器（30秒后保存）
  autoSaveTimer = setTimeout(saveDocument, 30000)
}

const saveDocument = async () => {
  if (!currentDocument.value || !projectStore.hasUnsavedChanges) return

  try {
    await projectStore.saveDocumentContent(
      currentDocument.value.documentId,
      documentContent.value
    )
  } catch (error) {
    saveStatus.value = '保存失败'
    ElMessage.error('保存失败：' + error.message)
  }
}

const saveDocumentTitle = async () => {
  if (!currentDocument.value) return

  try {
    await projectStore.updateDocumentData(
      currentDocument.value.documentId,
      { title: currentDocument.value.title }
    )
  } catch (error: any) {
    ElMessage.error('保存标题失败：' + (error.message || '未知错误'))
  }
}

const handleCreateDoc = async () => {
  if (!newDocTitle.value.trim()) {
    ElMessage.warning('请输入文档标题')
    return
  }

  try {
    const doc = await projectStore.createNewDocument(projectId, {
      title: newDocTitle.value
    })

    if (doc) {
      showCreateDocDialog.value = false
      newDocTitle.value = ''
      // 自动选择新创建的文档
      await selectDocument(doc.documentId)
    }
  } catch (error: any) {
    ElMessage.error('创建文档失败：' + (error.message || '未知错误'))
  }
}

const handleDocCommand = async (command: string, doc: any) => {
  if (command === 'rename') {
    try {
      const { value } = await ElMessageBox.prompt('请输入新标题', '重命名文档', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: doc.title
      })

      if (value && value.trim()) {
        await projectStore.updateDocumentData(doc.documentId, { title: value.trim() })
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('重命名失败：' + (error.message || '未知错误'))
      }
    }
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        `确定要删除文档"${doc.title}"吗？`,
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await projectStore.deleteDocumentById(doc.documentId)
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败：' + (error.message || '未知错误'))
      }
    }
  }
}

const goBack = () => {
  router.push({ name: 'writer-projects' })
}

// Lifecycle
onMounted(async () => {
  try {
    // 设置当前项目ID
    projectStore.setCurrentProject(projectId)

    // 加载项目详情和文档列表
    await Promise.all([
      writerStore.fetchProjectById(projectId),
      projectStore.fetchDocuments(projectId),
      projectStore.fetchDocumentTree(projectId)
    ])
  } catch (error: any) {
    ElMessage.error('加载项目失败：' + (error.message || '未知错误'))
  }
})

onBeforeUnmount(() => {
  // 清除自动保存定时器
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }

  // 保存当前文档
  if (projectStore.hasUnsavedChanges) {
    saveDocument()
  }
})
</script>

<style scoped>
.project-workspace {
  display: flex;
  height: calc(100vh - 64px);
}

/* 左侧文档列表 */
.document-sidebar {
  width: 280px;
  border-right: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.document-item:hover {
  background-color: #e5e7eb;
}

.document-item.active {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.doc-icon {
  flex-shrink: 0;
}

.doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-icon {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.document-item:hover .more-icon {
  opacity: 1;
}

/* 右侧编辑器 */
.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.empty-editor {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.doc-title-input {
  flex: 1;
  font-size: 18px;
  font-weight: 500;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.save-status {
  color: #6b7280;
  font-size: 14px;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

.content-textarea {
  width: 100%;
  height: 100%;
  padding: 24px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.7;
  border: none;
  outline: none;
  resize: none;
}

.editor-footer {
  padding: 8px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

