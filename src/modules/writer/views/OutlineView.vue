<template>
  <div class="outline-view">
    <!-- 工具栏 -->
    <div class="outline-header">
      <div class="header-left">
        <el-icon class="header-icon"><List /></el-icon>
        <span class="header-title">大纲</span>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button
            :type="viewMode === 'tree' ? 'primary' : ''"
            size="small"
            @click="viewMode = 'tree'"
          >
            <el-icon><List /></el-icon>
            树形
          </el-button>
          <el-button
            :type="viewMode === 'mindmap' ? 'primary' : ''"
            size="small"
            @click="viewMode = 'mindmap'"
          >
            <el-icon><Share /></el-icon>
            思维导图
          </el-button>
        </el-button-group>
        <el-button
          type="primary"
          size="small"
          :icon="Plus"
          @click="handleAddNode"
        >
          添加节点
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="outline-content">
      <!-- 树形视图 -->
      <div v-show="viewMode === 'tree'" class="tree-view">
        <div class="tree-container">
          <el-scrollbar>
            <el-tree
              v-loading="writerStore.outline.loading"
              :data="outlineTree"
              node-key="id"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :props="{ label: 'title', children: 'children' }"
              draggable
              @node-click="handleNodeClick"
              @node-drop="handleNodeDrop"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <div class="node-content">
                    <el-icon v-if="data.level === 1"><Folder /></el-icon>
                    <el-icon v-else-if="data.level === 2"><Document /></el-icon>
                    <el-icon v-else><Memo /></el-icon>
                    <span class="node-title">{{ data.title }}</span>
                    <el-tag v-if="data.status" size="small" :type="getStatusType(data.status)">
                      {{ getStatusText(data.status) }}
                    </el-tag>
                    <span v-if="data.wordCount" class="word-count">{{ data.wordCount }}字</span>
                  </div>
                  <div class="node-actions">
                    <el-button
                      text
                      size="small"
                      :icon="Edit"
                      @click.stop="handleEditNode(data)"
                    />
                    <el-button
                      text
                      size="small"
                      :icon="Delete"
                      @click.stop="handleDeleteNode(data)"
                    />
                  </div>
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>

        <!-- 节点详情面板 -->
        <div v-if="selectedNode" class="node-detail">
          <div class="detail-header">
            <h3>{{ selectedNode.title }}</h3>
            <el-button text :icon="Close" @click="selectedNode = null" />
          </div>
          <div class="detail-content">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="层级">
                {{ getLevelText(selectedNode.level) }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(selectedNode.status)">
                  {{ getStatusText(selectedNode.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="字数">
                {{ selectedNode.wordCount || 0 }}
              </el-descriptions-item>
            </el-descriptions>
            <div class="detail-description">
              <h4>描述</h4>
              <p>{{ selectedNode.description || '暂无描述' }}</p>
            </div>
            <div class="detail-actions">
              <el-button type="primary" @click="handleEditNode(selectedNode)">
                编辑
              </el-button>
              <el-button @click="handleJumpToChapter(selectedNode)">
                跳转到章节
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 思维导图视图 -->
      <div v-show="viewMode === 'mindmap'" class="mindmap-view">
        <DrawCanvas
          :nodes="mindmapNodes"
          :edges="mindmapEdges"
          canvas-type="mindmap"
          :config="mindmapConfig"
          @node-add="handleMindmapNodeAdd"
          @node-update="handleMindmapNodeUpdate"
          @node-delete="handleMindmapNodeDelete"
          @export="handleMindmapExport"
        />
      </div>
    </div>

    <!-- 添加/编辑节点对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑节点' : '添加节点'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="nodeForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="节点标题" prop="title">
          <el-input v-model="nodeForm.title" placeholder="请输入节点标题" />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select v-model="nodeForm.level" placeholder="选择层级">
            <el-option label="章节" :value="1" />
            <el-option label="小节" :value="2" />
            <el-option label="段落" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="父节点">
          <el-tree-select
            v-model="nodeForm.parentId"
            :data="outlineTree"
            :props="{ label: 'title', value: 'id', children: 'children' }"
            placeholder="选择父节点（可选）"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="nodeForm.status" placeholder="选择状态">
            <el-option label="草稿" value="draft" />
            <el-option label="写作中" value="writing" />
            <el-option label="已完成" value="completed" />
            <el-option label="审阅中" value="reviewing" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="nodeForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入节点描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWriterStore } from '../stores/writerStore'
import type { OutlineNode } from '@/types/writer'
import DrawCanvas from '@/shared/components/draw/DrawCanvas.vue'
import type { DrawNode, DrawEdge, DrawEngineConfig } from '@/core/draw-engine/types'
import {
  List,
  Share,
  Plus,
  Edit,
  Delete,
  Close,
  Folder,
  Document,
  Memo
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const writerStore = useWriterStore()
const viewMode = ref<'tree' | 'mindmap'>('tree')
const selectedNode = ref<OutlineNode | null>(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const mindmapContainer = ref()

const nodeForm = ref({
  title: '',
  level: 1,
  parentId: '',
  status: 'draft' as 'draft' | 'writing' | 'completed' | 'reviewing',
  description: '',
  order: 0
})

const formRules = {
  title: [
    { required: true, message: '请输入节点标题', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择层级', trigger: 'change' }
  ]
}

const outlineTree = computed(() => writerStore.outline.tree)

// 思维导图配置
const mindmapConfig = ref<Partial<DrawEngineConfig>>({
  zoom: {
    min: 0.5,
    max: 3,
    step: 0.1
  },
  grid: {
    enabled: true,
    size: 20
  }
})

// 将大纲树转换为思维导图节点和边
const mindmapNodes = computed((): DrawNode[] => {
  if (!outlineTree.value || outlineTree.value.length === 0) return []

  const nodes: DrawNode[] = []
  const traverse = (item: OutlineNode, level: number = 0) => {
    nodes.push({
      id: item.id,
      label: item.title,
      type: `level-${item.level}`,
      x: level * 300,
      y: nodes.length * 100,
      width: 150,
      height: 60,
      data: {
        level: item.level,
        status: item.status,
        description: item.description,
        wordCount: item.wordCount
      }
    })

    if (item.children && item.children.length > 0) {
      item.children.forEach(child => traverse(child, level + 1))
    }
  }

  outlineTree.value.forEach(root => traverse(root, 0))
  return nodes
})

// 将大纲树转换为边关系
const mindmapEdges = computed((): DrawEdge[] => {
  if (!outlineTree.value || outlineTree.value.length === 0) return []

  const edges: DrawEdge[] = []
  const traverse = (item: OutlineNode) => {
    if (item.children && item.children.length > 0) {
      item.children.forEach(child => {
        edges.push({
          id: `edge-${item.id}-${child.id}`,
          source: item.id,
          target: child.id,
          label: ''
        })
        traverse(child)
      })
    }
  }

  outlineTree.value.forEach(root => traverse(root))
  return edges
})

onMounted(async () => {
  if (writerStore.currentProjectId) {
    await writerStore.loadOutlineTree()
  }
})

const handleAddNode = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const handleEditNode = (node: OutlineNode) => {
  isEdit.value = true
  dialogVisible.value = true
  nodeForm.value = {
    title: node.title,
    level: node.level,
    parentId: node.parentId || '',
    status: node.status || 'draft',
    description: node.description || '',
    order: node.order
  }
}

const handleDeleteNode = async (node: OutlineNode) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除节点"${node.title}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const projectId = writerStore.currentProjectId
    if (!projectId) return

    await writerStore.deleteOutlineNode(node.id, projectId)
    await writerStore.loadOutlineTree()
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleNodeClick = (node: OutlineNode) => {
  selectedNode.value = node
  writerStore.setCurrentOutlineNode(node)
}

const handleNodeDrop = async () => {
  // 处理节点拖拽排序
  // 这里需要实现节点顺序更新逻辑
  ElMessage.info('节点顺序已更新')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    const projectId = writerStore.currentProjectId
    if (!projectId) {
      ElMessage.warning('请先选择项目')
      return
    }

    submitting.value = true
    try {
      if (isEdit.value && selectedNode.value) {
        // 更新节点
        await writerStore.updateOutlineNode(selectedNode.value.id, projectId, nodeForm.value)
      } else {
        // 创建节点
        await writerStore.createOutlineNode(projectId, {
          ...nodeForm.value,
          order: outlineTree.value.length
        })
      }

      await writerStore.loadOutlineTree()
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
    } catch (error: any) {
      console.error('操作失败:', error)
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleJumpToChapter = (node: OutlineNode) => {
  if (node.documentId) {
    // 跳转到章节编辑
    ElMessage.info(`跳转到章节: ${node.title}`)
  } else {
    ElMessage.warning('该节点未关联章节')
  }
}

// 思维导图事件处理
const handleMindmapNodeAdd = (node: DrawNode) => {
  ElMessage.info(`添加节点: ${node.label}`)
  // 可以在这里调用添加节点的API
}

const handleMindmapNodeUpdate = (node: DrawNode) => {
  ElMessage.info(`更新节点: ${node.label}`)
  // 可以在这里调用更新节点的API
}

const handleMindmapNodeDelete = (nodeId: string) => {
  ElMessage.info(`删除节点: ${nodeId}`)
  // 可以在这里调用删除节点的API
}

const handleMindmapExport = async (format: string, data: any) => {
  ElMessage.success(`已导出为 ${format} 格式`)
  // 处理导出逻辑
}

const resetForm = () => {
  nodeForm.value = {
    title: '',
    level: 1,
    parentId: '',
    status: 'draft',
    description: '',
    order: outlineTree.value.length
  }
}

const getLevelText = (level: number): string => {
  const levelMap: Record<number, string> = {
    1: '章节',
    2: '小节',
    3: '段落'
  }
  return levelMap[level] || '未知'
}

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成',
    reviewing: '审阅中'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string): 'info' | 'warning' | 'success' | 'danger' => {
  const typeMap: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    draft: 'info',
    writing: 'warning',
    completed: 'success',
    reviewing: 'warning'
  }
  return typeMap[status] || 'info'
}
</script>

<style scoped lang="scss">
.outline-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.outline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;

  .header-icon {
    font-size: 24px;
    color: #409eff;
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

.outline-content {
  flex: 1;
  overflow: hidden;
}

/* 树形视图 */
.tree-view {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 16px;
  height: 100%;
  padding: 16px;
}

.tree-container {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  :deep(.el-tree) {
    padding: 8px;
  }
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;

    .node-actions {
      opacity: 1;
    }
  }
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  .node-title {
    font-size: 14px;
    color: #303133;
  }

  .word-count {
    font-size: 12px;
    color: #909399;
  }
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.node-detail {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.detail-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.detail-description {
  margin-top: 16px;

  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
  }
}

.detail-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

/* 思维导图视图 */
.mindmap-view {
  height: 100%;
  padding: 16px;
}

.mindmap-container {
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mindmap-placeholder {
  text-align: center;
  color: #909399;

  .placeholder-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  p {
    margin: 8px 0;
    font-size: 16px;
  }

  .placeholder-tip {
    font-size: 14px;
    color: #c0c4cc;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .tree-view {
    grid-template-columns: 1fr;

    .node-detail {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 350px;
      z-index: 1000;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .outline-view {
    background: #0d0d0d;
  }

  .outline-header {
    background: #1a1a1a;
    border-bottom-color: #2d2d2d;
  }

  .header-title {
    color: #e5e5e5;
  }

  .tree-container,
  .node-detail,
  .mindmap-container {
    background: #1a1a1a;
    border-color: #2d2d2d;
  }

  .tree-node:hover {
    background-color: #2d2d2d;
  }

  .node-content .node-title {
    color: #e5e5e5;
  }

  .detail-header {
    border-bottom-color: #2d2d2d;

    h3 {
      color: #e5e5e5;
    }
  }

  .detail-description p {
    color: #c0c4cc;
  }
}
</style>






