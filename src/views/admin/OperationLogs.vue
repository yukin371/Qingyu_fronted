<template>
  <div class="operation-logs">
    <div class="page-header">
      <h2 class="page-title">操作日志</h2>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-input
        v-model="filters.operation"
        placeholder="操作类型"
        clearable
        style="width: 200px"
        @clear="handleFilterChange"
      />

      <el-input
        v-model="filters.adminId"
        placeholder="管理员ID"
        clearable
        style="width: 200px"
        @clear="handleFilterChange"
      />

      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleFilterChange"
      />

      <el-button type="primary" @click="handleFilterChange">查询</el-button>
      <el-button :icon="Refresh" @click="loadLogs">刷新</el-button>
      <el-button :icon="Download" @click="exportLogs">导出</el-button>
    </div>

    <!-- 日志列表 -->
    <div class="log-list">
      <el-table
        v-loading="loading"
        :data="logs"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="logId" label="日志ID" width="150" />
        <el-table-column prop="adminName" label="管理员" width="120" />
        <el-table-column prop="operation" label="操作类型" width="150">
          <template #default="{ row }">
            <el-tag :type="getOperationType(row.operation)">
              {{ getOperationText(row.operation) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="details" label="操作详情" min-width="250" />
        <el-table-column prop="targetType" label="目标类型" width="100" />
        <el-table-column prop="targetId" label="目标ID" width="120" />
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadLogs"
          @size-change="loadLogs"
        />
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="dialogVisible" title="日志详情" width="700px">
      <div v-if="currentItem" class="log-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="日志ID">
            {{ currentItem.logId }}
          </el-descriptions-item>
          <el-descriptions-item label="管理员">
            {{ currentItem.adminName }} ({{ currentItem.adminId }})
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationType(currentItem.operation)">
              {{ getOperationText(currentItem.operation) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标类型">
            {{ currentItem.targetType || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="目标ID">
            {{ currentItem.targetId || currentItem.target || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作详情">
            {{ currentItem.details }}
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ formatDate(currentItem.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import * as adminAPI from '@/api/shared/admin'
import type { OperationLog } from '@/api/shared/types'
import { formatDate } from '@/utils/format'

// 筛选器
const filters = reactive({
  operation: '',
  adminId: '',
  dateRange: null as any
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 数据
const loading = ref(false)
const logs = ref<OperationLog[]>([])
const total = ref(0)

// 对话框
const dialogVisible = ref(false)
const currentItem = ref<OperationLog | null>(null)

// 获取操作类型
const getOperationType = (operation: string): any => {
  const typeMap: Record<string, any> = {
    approve_content: 'success',
    reject_content: 'danger',
    approve_withdraw: 'success',
    reject_withdraw: 'danger',
    update_user: 'warning',
    delete_user: 'danger'
  }
  return typeMap[operation] || 'info'
}

// 获取操作文本
const getOperationText = (operation: string): string => {
  const textMap: Record<string, string> = {
    approve_content: '批准内容',
    reject_content: '拒绝内容',
    approve_withdraw: '批准提现',
    reject_withdraw: '拒绝提现',
    approve_book: '批准书籍',
    update_user: '更新用户',
    delete_user: '删除用户'
  }
  return textMap[operation] || operation
}

// 加载日志
const loadLogs = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      page_size: pagination.pageSize
    }

    if (filters.operation) {
      params.operation = filters.operation
    }

    if (filters.adminId) {
      params.admin_id = filters.adminId
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      params.start_date = filters.dateRange[0]
      params.end_date = filters.dateRange[1]
    }

    // 使用模拟数据
    const mockData: OperationLog[] = [
      {
        logId: 'log_001',
        adminId: 'admin_001',
        adminName: '管理员A',
        operation: 'approve_book',
        targetType: 'book',
        targetId: 'book_123',
        details: '批准书籍《测试书籍》发布',
        createdAt: '2025-10-21T14:30:00Z'
      },
      {
        logId: 'log_002',
        adminId: 'admin_001',
        adminName: '管理员A',
        operation: 'approve_withdraw',
        targetType: 'withdrawal',
        targetId: 'wd_001',
        details: '批准用户提现申请 ¥500',
        createdAt: '2025-10-21T14:25:00Z'
      },
      {
        logId: 'log_003',
        adminId: 'admin_002',
        adminName: '管理员B',
        operation: 'reject_content',
        targetType: 'chapter',
        targetId: 'chapter_456',
        details: '拒绝章节审核：内容违规',
        createdAt: '2025-10-21T14:20:00Z'
      }
    ]

    logs.value = mockData
    total.value = mockData.length
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadLogs()
}

// 查看详情
const handleView = (item: OperationLog) => {
  currentItem.value = item
  dialogVisible.value = true
}

// 导出日志
const exportLogs = () => {
  ElMessage.info('导出功能开发中')
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped lang="scss">
.operation-logs {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
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
}

.log-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;

    .el-input,
    .el-date-picker {
      width: 100% !important;
    }
  }
}
</style>

