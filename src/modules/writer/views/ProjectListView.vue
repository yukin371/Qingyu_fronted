<template>
  <div class="project-list-view">
    <div class="page-header">
      <h1>我的项目</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建项目
      </el-button>
    </div>

    <div v-if="loading" class="loading-container">
      <Loading />
    </div>

    <div v-else-if="projectList.length === 0" class="empty-container">
      <Empty description="还没有项目，创建一个开始吧！" />
    </div>

    <div v-else class="project-grid">
      <el-card
        v-for="project in projectList"
        :key="project.id"
        class="project-card"
        shadow="hover"
        @click="openProject(project.id)"
      >
        <template #header>
          <div class="card-header">
            <span class="project-name">{{ project.name }}</span>
            <el-dropdown @command="handleCommand($event, project)">
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

        <div class="project-meta">
          <el-tag size="small" type="info">
            {{ formatDate(project.createdAt) }}
          </el-tag>
        </div>
      </el-card>
    </div>

    <!-- 创建项目对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建新项目" width="500px">
      <el-form :model="newProject" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="newProject.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="newProject.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述（可选）"
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled } from '@element-plus/icons-vue'
import { useWriterStore } from '../stores/writerStore'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

const router = useRouter()
const writerStore = useWriterStore()

// State
const loading = ref(true)
const showCreateDialog = ref(false)
const newProject = ref({
  name: '',
  description: ''
})

// Computed
const projectList = computed(() => writerStore.projectList)

// Methods
const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

const openProject = (projectId) => {
  router.push({ name: 'writer-project', params: { projectId } })
}

const handleCreate = async () => {
  if (!newProject.value.name.trim()) {
    ElMessage.warning('请输入项目名称')
    return
  }

  try {
    const project = await writerStore.createProject(newProject.value)
    ElMessage.success('项目创建成功')
    showCreateDialog.value = false
    newProject.value = { name: '', description: '' }

    // 打开新创建的项目
    openProject(project.id)
  } catch (error) {
    ElMessage.error('创建项目失败：' + error.message)
  }
}

const handleCommand = async (command, project) => {
  if (command === 'edit') {
    // TODO: 实现编辑功能
    ElMessage.info('编辑功能开发中')
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        `确定要删除项目"${project.name}"吗？此操作不可恢复。`,
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await writerStore.deleteProject(project.id)
      ElMessage.success('项目已删除')
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败：' + error.message)
      }
    }
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await writerStore.loadProjects()
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  } finally {
    loading.value = false
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

