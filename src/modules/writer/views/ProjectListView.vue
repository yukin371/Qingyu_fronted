<template>
  <WriterPageShell>
    <div class="project-list-view">
      <WriterSurfaceCard class="mb-5">
        <div class="page-header" style="margin-bottom: 0;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <h1>我的项目</h1>
            <!-- 存储模式指示器 -->
            <span
              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
              :class="writerStore.storageMode === 'offline' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
            >
              {{ writerStore.storageMode === 'offline' ? '📦 离线模式' : '🌐 在线模式' }}
            </span>
          </div>
          <div style="display: flex; gap: 8px;">
            <!-- 切换存储模式按钮 -->
            <el-tooltip
              :content="writerStore.storageMode === 'offline' ? '切换到在线模式（需要后端支持）' : '切换到离线模式（使用本地存储）'"
              placement="bottom"
            >
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                @click="handleToggleMode"
              >
                <QyIcon name="component" :is="writerStore.storageMode === 'offline' ? 'Connection' : 'FolderOpened'"  />
                {{ writerStore.storageMode === 'offline' ? '切换在线' : '切换离线' }}
              </button>
            </el-tooltip>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              @click="showCreateDialog = true"
            >
              <QyIcon name="Plus"  />
              新建项目
            </button>
          </div>
        </div>
        <p class="mt-3 text-sm text-slate-500">统一管理作品与章节，支持快速新建、编辑与发布。</p>
      </WriterSurfaceCard>

    <div v-loading="loading" class="projects-container">
      <div v-if="!loading && projectList.length === 0" class="empty-container">
        <el-empty description="还没有项目，创建一个开始吧！">
          <el-button type="primary" @click="showCreateDialog = true">
            <QyIcon name="Plus"  />
            创建第一个项目
          </el-button>
        </el-empty>
      </div>

      <div v-else class="project-grid">
        <WriterSurfaceCard
          v-for="project in projectList"
          :key="project.projectId"
          tag="article"
          centered
          interactive
          class="project-card"
          @click="openProject(project.projectId)"
        >
          <div class="card-header">
            <span class="project-name">{{ project.title }}</span>
            <el-dropdown class="project-actions" @command="handleCommand($event, project)" @click.stop>
              <el-icon class="more-icon"><QyIcon name="MoreFilled"  /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="project-description">
            {{ project.description || '暂无描述' }}
          </div>

          <div class="project-stats">
            <div class="stat-item">
              <span class="stat-label">字数</span>
              <span class="stat-value">{{ project.wordCount || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">章节</span>
              <span class="stat-value">{{ project.chapterCount || 0 }}</span>
            </div>
          </div>

          <div class="project-meta">
            <span class="status-badge" :class="getStatusClass(project.status)">
              {{ getStatusText(project.status) }}
            </span>
            <span class="meta-date">{{ formatDate(project.updatedAt) }}</span>
          </div>

          <div class="project-entry-hint">
            <span>点击进入项目</span>
            <QyIcon name="ArrowRight" />
          </div>
        </WriterSurfaceCard>
      </div>
    </div>

    <!-- 创建项目对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建新项目" width="520px">
      <el-form :model="newProject" label-width="90px">
        <el-form-item label="项目名称" required>
          <el-input v-model="newProject.title" placeholder="请输入项目名称" maxlength="50" />
        </el-form-item>

        <el-form-item label="项目类型">
          <el-select v-model="newProject.type" placeholder="选择项目类型">
            <el-option label="小说" value="novel" />
            <el-option label="散文随笔" value="essay" />
            <el-option label="其他" value="others" />
          </el-select>
        </el-form-item>

        <el-form-item label="项目描述">
          <el-input
            v-model="newProject.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述（可选）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
    </div>
  </WriterPageShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, messageBox } from '@/design-system/services'
import { QyIcon } from '@/design-system/components'
import { useWriterStore } from '@/stores/writer'
import { ElMessage } from 'element-plus'
import WriterPageShell from '@/modules/writer/components/WriterPageShell.vue'
import WriterSurfaceCard from '@/modules/writer/components/WriterSurfaceCard.vue'

const router = useRouter()
const writerStore = useWriterStore()

// State
const showCreateDialog = ref(false)
const newProject = ref({
  title: '',
  description: '',
  type: 'novel' as 'novel' | 'essay' | 'others'
})

// Computed
const projectList = computed(() => writerStore.projectList)
const loading = computed(() => writerStore.loading)

// Methods
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const openProject = (projectId: string) => {
  if (!projectId) {
    ElMessage.error('项目ID无效')
    return
  }
  router.push({ name: 'writer-project', params: { projectId } })
}

const handleCreate = async () => {
  if (!newProject.value.title.trim()) {
    message.warning('请输入项目名称')
    return
  }

  try {
    const project = await writerStore.createNewProject({
      title: newProject.value.title,
      description: newProject.value.description,
      type: newProject.value.type
    })

    if (project) {
      showCreateDialog.value = false
      newProject.value = { title: '', description: '', type: 'novel' }

      // 打开新创建的项目 - 兼容不同的字段名
      const projectId = project.projectId || project.id
      if (projectId) {
        openProject(projectId)
      } else {
        ElMessage.error('项目创建成功，但缺少项目ID')
      }
    }
  } catch (error: any) {
    ElMessage.error('创建项目失败：' + (error.message || '未知错误'))
  }
}

const handleCommand = async (command: string, project: any) => {
  if (command === 'edit') {
    // TODO: 实现编辑功能
    message.info('编辑功能开发中')
  } else if (command === 'delete') {
    try {
      await messageBox.confirm(
        `确定要删除项目"${project.title}"吗？此操作不可恢复。`,
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await writerStore.deleteProjectById(project.projectId)
    } catch (error: any) {
      if (error !== 'cancel') {
        message.error('删除失败：' + (error.message || '未知错误'))
      }
    }
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    writing: '写作中',
    completed: '已完成',
    published: '已发布'
  }
  return textMap[status] || status
}

const getStatusClass = (status: string) => `status-${status || 'draft'}`

// 切换存储模式
async function handleToggleMode() {
  writerStore.toggleStorageMode()
  // 重新加载项目列表
  try {
    await writerStore.fetchProjects()
  } catch (error: any) {
    message.error('加载项目列表失败：' + (error.message || '未知错误'))
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await writerStore.fetchProjects()
  } catch (error: any) {
    message.error('加载项目列表失败：' + (error.message || '未知错误'))
  }
})
</script>

<style scoped>
.project-list-view {
  padding: 0;
  max-width: none;
  margin: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.loading-container,
.empty-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 28px;
  padding: 10px 4px;
}

.project-card {
  border: 1px solid #dbe6f6 !important;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.project-card:hover {
  transform: translateY(-6px);
  border-color: #93c5fd !important;
  box-shadow: 0 14px 34px rgba(37, 99, 235, 0.18);
}

.card-header {
  position: relative;
  margin-bottom: 10px;
  min-height: 24px;
  text-align: center;
}

.project-actions {
  position: absolute;
  top: 0;
  right: 0;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  display: inline-block;
  max-width: calc(100% - 28px);
}

.more-icon {
  cursor: pointer;
  font-size: 20px;
  color: #909399;
}

.more-icon:hover {
  color: #409eff;
}

.project-description {
  color: #606266;
  min-height: 60px;
  margin-bottom: 16px;
  text-align: center;
}

.project-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-draft {
  background: #eff6ff;
  color: #2563eb;
}

.status-badge.status-writing {
  background: #fffbeb;
  color: #b45309;
}

.status-badge.status-completed,
.status-badge.status-published {
  background: #ecfdf5;
  color: #047857;
}

.project-entry-hint {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #dbe6f6;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
}
</style>
