<template>
  <div class="announcement-management">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>公告管理</h2>
          <p class="subtitle">管理系统公告通知</p>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建公告
        </el-button>
      </div>
    </el-card>

    <el-card>
      <el-table
        v-loading="loading"
        :data="announcements"
        style="width: 100%"
      >
        <el-table-column prop="title" label="标题" />

        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="目标用户" width="100">
          <template #default="{ row }">
            <el-tag>{{ getTargetLabel(row.targetUsers) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="80" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="viewCount" label="查看次数" width="100" />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top: 20px; justify-content: center"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingAnnouncement ? '编辑公告' : '新建公告'"
      width="700px"
    >
      <el-form :model="announcementForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="announcementForm.title" />
        </el-form-item>

        <el-form-item label="内容" required>
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            :rows="6"
          />
        </el-form-item>

        <el-form-item label="类型" required>
          <el-select v-model="announcementForm.type">
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="通知" value="notice" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标用户" required>
          <el-select v-model="announcementForm.targetUsers">
            <el-option label="所有用户" value="all" />
            <el-option label="读者" value="reader" />
            <el-option label="作者" value="writer" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-input-number v-model="announcementForm.priority" :min="0" :max="100" />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="announcementForm.isActive" />
        </el-form-item>

        <el-form-item label="生效时间">
          <el-date-picker
            v-model="announcementForm.startTime"
            type="datetime"
            placeholder="开始时间"
          />
        </el-form-item>

        <el-form-item label="失效时间">
          <el-date-picker
            v-model="announcementForm.endTime"
            type="datetime"
            placeholder="结束时间"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import * as announcementApi from '@/api/admin'

const loading = ref(false)
const announcements = ref<announcementApi.Announcement[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editingAnnouncement = ref<announcementApi.Announcement | null>(null)
const submitting = ref(false)

const announcementForm = reactive<any>({
  title: '',
  content: '',
  type: 'info',
  targetUsers: 'all',
  priority: 0,
  isActive: true,
  startTime: null,
  endTime: null
})

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    info: '',
    warning: 'warning',
    notice: 'success'
  }
  return colors[type] || ''
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    info: '信息',
    warning: '警告',
    notice: '通知'
  }
  return labels[type] || type
}

const getTargetLabel = (target: string) => {
  const labels: Record<string, string> = {
    all: '所有用户',
    reader: '读者',
    writer: '作者',
    admin: '管理员'
  }
  return labels[target] || target
}

const loadAnnouncements = async () => {
  loading.value = true
  try {
    const response = await announcementApi.getAnnouncements({
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    })
    announcements.value = response.announcements
    total.value = response.total
  } catch (error) {
    ElMessage.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadAnnouncements()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadAnnouncements()
}

const handleCreate = () => {
  editingAnnouncement.value = null
  Object.assign(announcementForm, {
    title: '',
    content: '',
    type: 'info',
    targetUsers: 'all',
    priority: 0,
    isActive: true,
    startTime: null,
    endTime: null
  })
  dialogVisible.value = true
}

const handleEdit = (announcement: announcementApi.Announcement) => {
  editingAnnouncement.value = announcement
  Object.assign(announcementForm, {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    targetUsers: announcement.targetUsers,
    priority: announcement.priority,
    isActive: announcement.isActive,
    startTime: announcement.startTime,
    endTime: announcement.endTime
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editingAnnouncement.value) {
      await announcementApi.updateAnnouncement(editingAnnouncement.value.id, announcementForm)
      ElMessage.success('更新成功')
    } else {
      await announcementApi.createAnnouncement(announcementForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadAnnouncements()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (announcement: announcementApi.Announcement) => {
  try {
    await announcementApi.updateAnnouncement(announcement.id, { isActive: announcement.isActive })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    announcement.isActive = !announcement.isActive
  }
}

const handleDelete = async (announcement: announcementApi.Announcement) => {
  try {
    await ElMessageBox.confirm('确定要删除此公告吗？', '确认', {
      type: 'warning'
    })

    await announcementApi.deleteAnnouncement(announcement.id)
    ElMessage.success('删除成功')
    await loadAnnouncements()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped lang="scss">
.announcement-management {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 24px;
    }

    .subtitle {
      margin: 8px 0 0;
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>

