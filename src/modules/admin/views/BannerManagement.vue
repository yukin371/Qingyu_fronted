<template>
  <div class="banner-management">
    <el-card class="header-card">
      <div class="header-content">
        <div>
          <h2>Banner管理</h2>
          <p class="subtitle">管理首页轮播图Banner</p>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建Banner
        </el-button>
      </div>
    </el-card>

    <el-card>
      <el-table
        v-loading="loading"
        :data="banners"
        style="width: 100%"
      >
        <el-table-column label="预览" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              fit="cover"
              style="width: 100px; height: 60px"
            />
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" />

        <el-table-column label="目标类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.targetType)">
              {{ getTypeLabel(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序" width="80" />

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.isActive"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="clickCount" label="点击量" width="100" />

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
      :title="editingBanner ? '编辑Banner' : '新建Banner'"
      width="600px"
    >
      <el-form :model="bannerForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="bannerForm.title" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input v-model="bannerForm.description" type="textarea" />
        </el-form-item>

        <el-form-item label="图片URL" required>
          <el-input v-model="bannerForm.image" />
        </el-form-item>

        <el-form-item label="目标类型" required>
          <el-select v-model="bannerForm.targetType">
            <el-option label="书籍" value="book" />
            <el-option label="分类" value="category" />
            <el-option label="外链" value="url" />
          </el-select>
        </el-form-item>

        <el-form-item label="跳转目标" required>
          <el-input v-model="bannerForm.target" />
        </el-form-item>

        <el-form-item label="排序权重">
          <el-input-number v-model="bannerForm.sortOrder" :min="0" />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="bannerForm.isActive" />
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
import * as bannerApi from '@/modules/admin/api'

const loading = ref(false)
const banners = ref<bannerApi.Banner[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editingBanner = ref<bannerApi.Banner | null>(null)
const submitting = ref(false)

const bannerForm = reactive<any>({
  title: '',
  description: '',
  image: '',
  target: '',
  targetType: 'book',
  sortOrder: 0,
  isActive: true
})

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    book: 'primary',
    category: 'success',
    url: 'warning'
  }
  return colors[type] || ''
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    book: '书籍',
    category: '分类',
    url: '外链'
  }
  return labels[type] || type
}

const loadBanners = async () => {
  loading.value = true
  try {
    const response = await bannerApi.getBanners({
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    })
    banners.value = response.data?.items || []
    total.value = response.data?.total || 0
  } catch (error) {
    ElMessage.error('加载Banner列表失败')
  } finally {
    loading.value = false
  }
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadBanners()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadBanners()
}

const handleCreate = () => {
  editingBanner.value = null
  Object.assign(bannerForm, {
    title: '',
    description: '',
    image: '',
    target: '',
    targetType: 'book',
    sortOrder: 0,
    isActive: true
  })
  dialogVisible.value = true
}

const handleEdit = (banner: bannerApi.Banner) => {
  editingBanner.value = banner
  Object.assign(bannerForm, {
    title: banner.title,
    description: banner.description,
    image: banner.image,
    target: banner.target,
    targetType: banner.targetType,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (editingBanner.value) {
      await bannerApi.updateBanner(editingBanner.value.id, bannerForm)
      ElMessage.success('更新成功')
    } else {
      await bannerApi.createBanner(bannerForm)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadBanners()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (banner: bannerApi.Banner) => {
  try {
    await bannerApi.updateBanner(banner.id, { isActive: banner.isActive })
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    banner.isActive = !banner.isActive
  }
}

const handleDelete = async (banner: bannerApi.Banner) => {
  try {
    await ElMessageBox.confirm('确定要删除此Banner吗？', '确认', {
      type: 'warning'
    })

    await bannerApi.deleteBanner(banner.id)
    ElMessage.success('删除成功')
    await loadBanners()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadBanners()
})
</script>

<style scoped lang="scss">
.banner-management {
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

