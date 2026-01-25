<template>
  <div class="review-management">
    <div class="page-header">
      <h2 class="page-title">内容审核</h2>
      <div class="header-actions">
        <el-button @click="loadReviews">
          <QyIcon name="Refresh" :size="14" />
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-select v-model="filters.contentType" placeholder="内容类型" clearable @change="handleFilterChange">
        <el-option label="全部" value="" />
        <el-option label="书籍" value="book" />
        <el-option label="章节" value="chapter" />
        <el-option label="文档" value="document" />
        <el-option label="评论" value="comment" />
      </el-select>

      <el-input
        v-model="filters.keyword"
        placeholder="搜索标题或内容"
        clearable
        @clear="handleFilterChange"
        @keyup.enter="handleFilterChange"
      >
        <template #prefix>
          <QyIcon name="Search" :size="16" />
        </template>
      </el-input>

      <el-button type="primary" @click="handleFilterChange">搜索</el-button>
    </div>

    <!-- 待审核列表 -->
    <div v-loading="loading" class="review-list">
      <el-empty v-if="reviews.length === 0 && !loading" description="暂无待审核内容" />

      <ReviewCard
        v-for="item in reviews"
        :key="item.reviewId"
        :item="item"
        @approve="handleApprove"
        @reject="handleReject"
        @view="handleView"
      />
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <el-pagination
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @update:current-page="pagination.page = $event"
        @update:page-size="pagination.pageSize = $event"
        @current-change="loadReviews"
        @size-change="loadReviews"
      />
    </div>

    <!-- 审核详情对话框 -->
    <el-dialog v-model="dialogVisible" :title="`审核详情 - ${currentItem?.title || '无标题'}`" width="800px">
      <div v-if="currentItem" class="review-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="内容类型">
            {{ getTypeName(currentItem.contentType) }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ currentItem.submittedAt }}
          </el-descriptions-item>
          <el-descriptions-item label="提交者">
            {{ currentItem.submittedBy }}
          </el-descriptions-item>
          <el-descriptions-item label="内容ID">
            {{ currentItem.contentId }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentItem.content" class="content-preview">
          <h4>内容预览</h4>
          <div class="content-text">{{ currentItem.content }}</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleReject(currentItem!)">拒绝</el-button>
        <el-button type="success" @click="handleApprove(currentItem!)">批准</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="5"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submitting" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { QyIcon } from '@/design-system/components'
import ReviewCard from '@admin/components/ReviewCard.vue'
import * as adminAPI from '@/modules/admin/api'
import type { PendingReview } from '@/types/shared'

// 筛选器
const filters = reactive({
  contentType: '',
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 数据
const loading = ref(false)
const reviews = ref<any[]>([])
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentItem = ref<PendingReview | null>(null)
const submitting = ref(false)

// 拒绝表单
const rejectForm = reactive({
  reason: ''
})

// 获取类型名称
const getTypeName = (type?: string): string => {
  if (!type) return '-'
  const typeMap: Record<string, string> = {
    book: '书籍',
    chapter: '章节',
    document: '文档',
    comment: '评论'
  }
  return typeMap[type] || type
}

// 加载审核列表
const loadReviews = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.pageSize
    }

    if (filters.contentType) {
      params.content_type = filters.contentType
    }

    const response = await adminAPI.getPendingReviews(params)

    if (response.data) {
      if (Array.isArray(response.data)) {
        reviews.value = response.data
        total.value = response.data.length
      } else if (response.data.items) {
        reviews.value = response.data.items
        total.value = response.data.total || 0
      }
    }
  } catch (error) {
    console.error('加载审核列表失败:', error)
    ElMessage.error('加载审核列表失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadReviews()
}

// 查看详情
const handleView = (item: PendingReview) => {
  currentItem.value = item
  dialogVisible.value = true
}

// 批准
const handleApprove = async (item: PendingReview) => {
  try {
    await ElMessageBox.confirm('确认批准该内容吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    })

    await adminAPI.reviewContent(item.contentId || item.targetId, {
      status: 'approved'
    })

    ElMessage.success('批准成功')
    dialogVisible.value = false
    loadReviews()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批准失败:', error)
      ElMessage.error('批准失败')
    }
  }
}

// 拒绝
const handleReject = (item: PendingReview) => {
  currentItem.value = item
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认拒绝
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  if (!currentItem.value) return

  submitting.value = true
  try {
    await adminAPI.reviewContent(currentItem.value.contentId || currentItem.value.targetId, {
      status: 'rejected',
      reason: rejectForm.reason
    })

    ElMessage.success('已拒绝')
    rejectDialogVisible.value = false
    dialogVisible.value = false
    loadReviews()
  } catch (error) {
    console.error('拒绝失败:', error)
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped lang="scss">
.review-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .el-select,
  .el-input {
    width: 200px;
  }
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.review-detail {
  .content-preview {
    margin-top: 20px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .content-text {
      padding: 16px;
      background: #fafafa;
      border-radius: 8px;
      line-height: 1.8;
      color: #606266;
      max-height: 400px;
      overflow-y: auto;
    }
  }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;

    .el-select,
    .el-input {
      width: 100%;
    }
  }
}
</style>

