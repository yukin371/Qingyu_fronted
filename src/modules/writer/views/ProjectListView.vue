<template>
  <div class="project-list-view">
    <div class="page-header">
      <h1>我的项目</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建项目
      </el-button>
    </div>

    <div v-loading="loading" class="projects-container">
      <div v-if="!loading && projectList.length === 0" class="empty-container">
        <el-empty description="还没有项目，创建一个开始吧！">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建第一个项目
          </el-button>
        </el-empty>
      </div>

      <div v-else class="project-grid">
        <el-card
          v-for="project in projectList"
          :key="project.projectId"
          class="project-card"
          shadow="hover"
          @click="openProject(project.projectId)"
        >
          <template #header>
            <div class="card-header">
              <span class="project-name">{{ project.title }}</span>
              <el-dropdown @command="handleCommand($event, project)" @click.stop>
                <el-icon class="more-icon"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">编辑</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>

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
            <el-tag size="small" :type="getStatusType(project.status)">
              {{ getStatusText(project.status) }}
            </el-tag>
            <span class="meta-date">{{ formatDate(project.updatedAt) }}</span>
          </div>
        </el-card>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'
import { useWriterStore } from '@/stores/writer'

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
  router.push({ name: 'writer-project', params: { projectId } })
}

const handleCreate = async () => {
  if (!newProject.value.title.trim()) {
    ElMessage.warning('请输入项目名称')
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

      // 打开新创建的项目
      openProject(project.projectId)
    }
  } catch (error: any) {
    ElMessage.error('创建项目失败：' + (error.message || '未知错误'))
  }
}

const handleCommand = async (command: string, project: any) => {
  if (command === 'edit') {
    // TODO: 实现编辑功能
    ElMessage.info('编辑功能开发中')
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
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
        ElMessage.error('删除失败：' + (error.message || '未知错误'))
      }
    }
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    draft: 'info',
    writing: 'warning',
    completed: 'success',
    published: 'success'
  }
  return typeMap[status] || 'info'
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

// Lifecycle
onMounted(async () => {
  try {
    await writerStore.fetchProjects()
  } catch (error: any) {
    ElMessage.error('加载项目列表失败：' + (error.message || '未知错误'))
  }
})
</script>

<style scoped>
.project-list-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
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
  gap: 20px;
}

.project-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-size: 18px;
  font-weight: 500;
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
}

.project-meta {
  display: flex;
  gap: 8px;
}
</style>

