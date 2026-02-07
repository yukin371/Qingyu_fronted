<template>
  <div class="publish-management-view">
    <el-row :gutter="20">
      <!-- 左侧：发布统计 -->
      <el-col :span="6">
        <el-card shadow="never" class="stats-card">
          <template #header>
            <h3>发布统计</h3>
          </template>
          <div v-loading="loadingStats" class="stats-list">
            <div class="stat-item">
              <span class="label">总章节数</span>
              <span class="value">{{ stats.total_chapters }}</span>
            </div>
            <div class="stat-item">
              <span class="label">已发布</span>
              <span class="value success">{{ stats.published_chapters }}</span>
            </div>
            <div class="stat-item">
              <span class="label">草稿</span>
              <span class="value info">{{ stats.draft_chapters }}</span>
            </div>
            <div class="stat-item">
              <span class="label">审核中</span>
              <span class="value warning">{{ stats.pending_review_chapters }}</span>
            </div>
            <div class="stat-item">
              <span class="label">定时发布</span>
              <span class="value info">{{ stats.scheduled_chapters }}</span>
            </div>
            <el-divider />
            <div class="stat-item">
              <span class="label">总字数</span>
              <span class="value">{{ formatNumber(stats.total_words) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">已发布字数</span>
              <span class="value success">{{ formatNumber(stats.published_words) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：发布管理 -->
      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <h3>发布管理</h3>
              <div class="header-actions">
                <el-button @click="showExportDialog = true">
                  <QyIcon name="Download"  />
                  导出
                </el-button>
                <el-button type="primary" @click="showPublishPlanDialog = true">
                  <QyIcon name="Setting"  />
                  发布计划
                </el-button>
              </div>
            </div>
          </template>

          <el-tabs v-model="activeTab">
            <!-- 发布计划 -->
            <el-tab-pane label="发布计划" name="plan">
              <div v-if="!publishPlan" class="empty-plan">
                <el-empty description="暂无发布计划">
                  <el-button type="primary" @click="showPublishPlanDialog = true">
                    创建发布计划
                  </el-button>
                </el-empty>
              </div>
              <div v-else class="plan-detail">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="计划名称">
                    {{ publishPlan.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="发布类型">
                    <el-tag :type="getTypeTagType(publishPlan.type)">
                      {{ getTypeLabel(publishPlan.type) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="发布状态">
                    <el-tag :type="getStatusTagType(publishPlan.status)">
                      {{ publishPlan.status }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="发布平台">
                    <el-tag
                      v-for="platform in publishPlan.platforms"
                      :key="platform"
                      style="margin-right: 4px"
                    >
                      {{ getPlatformLabel(platform) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="发布方式">
                    {{ getScheduleTypeLabel(publishPlan.schedule.type) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="发布间隔" v-if="publishPlan.schedule.interval_days">
                    每 {{ publishPlan.schedule.interval_days }} 天
                  </el-descriptions-item>
                  <el-descriptions-item label="每次发布" v-if="publishPlan.schedule.chapters_per_release">
                    {{ publishPlan.schedule.chapters_per_release }} 章
                  </el-descriptions-item>
                  <el-descriptions-item label="定价" v-if="!publishPlan.pricing.is_free">
                    {{ publishPlan.pricing.price }} 书币/章
                  </el-descriptions-item>
                  <el-descriptions-item label="VIP折扣" v-if="publishPlan.pricing.vip_discount">
                    {{ publishPlan.pricing.vip_discount }}%
                  </el-descriptions-item>
                </el-descriptions>

                <div class="plan-actions">
                  <el-button @click="editPublishPlan">编辑计划</el-button>
                  <el-button
                    v-if="publishPlan.status === 'active'"
                    type="warning"
                    @click="pausePlan"
                  >
                    暂停
                  </el-button>
                  <el-button
                    v-else
                    type="success"
                    @click="resumePlan"
                  >
                    恢复
                  </el-button>
                  <el-button type="primary" @click="submitReview">
                    提交审核
                  </el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 章节发布 -->
            <el-tab-pane label="章节发布" name="chapters">
              <div class="chapter-publish">
                <div class="filter-bar">
                  <el-select v-model="chapterFilter.status" placeholder="状态筛选" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="草稿" value="draft" />
                    <el-option label="审核中" value="pending_review" />
                    <el-option label="已发布" value="published" />
                    <el-option label="定时发布" value="scheduled" />
                  </el-select>
                  <el-button @click="loadPublishRecords">刷新</el-button>
                </div>

                <el-table :data="publishRecords" v-loading="loadingRecords" stripe>
                  <el-table-column prop="chapter_number" label="章节号" width="80" />
                  <el-table-column prop="chapter_title" label="章节标题" />
                  <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getStatusTagType(row.status)">
                        {{ getStatusLabel(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="发布时间" width="180">
                    <template #default="{ row }">
                      {{ row.published_at ? formatDate(row.published_at) : '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        v-if="row.status === 'draft'"
                        size="small"
                        type="primary"
                        @click="publishChapter(row)"
                      >
                        发布
                      </el-button>
                      <el-button
                        v-if="row.status === 'draft'"
                        size="small"
                        @click="scheduleChapter(row)"
                      >
                        定时
                      </el-button>
                      <el-button
                        v-if="row.status === 'published'"
                        size="small"
                        type="danger"
                        @click="unpublishChapter(row)"
                      >
                        下架
                      </el-button>
                      <el-button
                        v-if="row.status === 'pending_review'"
                        size="small"
                        type="warning"
                        @click="viewReview(row)"
                      >
                        查看审核
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <el-pagination
                  v-if="recordTotal > 0"
                  v-model:current-page="recordPage"
                  v-model:page-size="recordPageSize"
                  :total="recordTotal"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @current-change="loadPublishRecords"
                  @size-change="loadPublishRecords"
                  style="margin-top: 16px; justify-content: center"
                />
              </div>
            </el-tab-pane>

            <!-- 导出历史 -->
            <el-tab-pane label="导出历史" name="export">
              <div class="export-history">
                <el-table :data="exportHistory" v-loading="loadingExport" stripe>
                  <el-table-column label="格式" width="100">
                    <template #default="{ row }">
                      <el-tag>{{ row.format.toUpperCase() }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="范围" width="100">
                    <template #default="{ row }">
                      {{ getScopeLabel(row.scope) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getExportStatusType(row.status)">
                        {{ getExportStatusLabel(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="进度" width="150">
                    <template #default="{ row }">
                      <el-progress :percentage="row.progress" :status="row.status === 'completed' ? 'success' : undefined" />
                    </template>
                  </el-table-column>
                  <el-table-column label="创建时间" width="180">
                    <template #default="{ row }">
                      {{ formatDate(row.created_at) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="{ row }">
                      <el-button
                        v-if="row.status === 'completed'"
                        size="small"
                        type="primary"
                        @click="downloadExport(row)"
                      >
                        下载
                      </el-button>
                      <el-button
                        v-if="row.status === 'pending' || row.status === 'processing'"
                        size="small"
                        @click="cancelExport(row)"
                      >
                        取消
                      </el-button>
                      <el-button
                        size="small"
                        type="danger"
                        @click="deleteExport(row)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <el-pagination
                  v-if="exportTotal > 0"
                  v-model:current-page="exportPage"
                  v-model:page-size="exportPageSize"
                  :total="exportTotal"
                  :page-sizes="[10, 20, 50]"
                  layout="total, sizes, prev, pager, next"
                  @current-change="loadExportHistory"
                  @size-change="loadExportHistory"
                  style="margin-top: 16px; justify-content: center"
                />
              </div>
            </el-tab-pane>

            <!-- 审核历史 -->
            <el-tab-pane label="审核历史" name="review">
              <div class="review-history">
                <!-- 审核统计 -->
                <el-row :gutter="20" class="review-stats">
                  <el-col :span="6">
                    <el-card shadow="hover">
                      <el-statistic title="总审核数" :value="reviewStats.total" />
                    </el-card>
                  </el-col>
                  <el-col :span="6">
                    <el-card shadow="hover">
                      <el-statistic title="通过" :value="reviewStats.approved">
                        <template #suffix>
                          <span style="color: #67c23a">({{ reviewStats.approvedRate }}%)</span>
                        </template>
                      </el-statistic>
                    </el-card>
                  </el-col>
                  <el-col :span="6">
                    <el-card shadow="hover">
                      <el-statistic title="拒绝" :value="reviewStats.rejected">
                        <template #suffix>
                          <span style="color: #f56c6c">({{ reviewStats.rejectedRate }}%)</span>
                        </template>
                      </el-statistic>
                    </el-card>
                  </el-col>
                  <el-col :span="6">
                    <el-card shadow="hover">
                      <el-statistic title="审核中" :value="reviewStats.pending" />
                    </el-card>
                  </el-col>
                </el-row>

                <!-- 审核趋势图表 -->
                <el-card shadow="never" style="margin-top: 20px">
                  <template #header>
                    <div class="card-header">
                      <h3>审核趋势</h3>
                      <el-radio-group v-model="reviewTrendPeriod" size="small">
                        <el-radio-button label="7d">近7天</el-radio-button>
                        <el-radio-button label="30d">近30天</el-radio-button>
                        <el-radio-button label="90d">近90天</el-radio-button>
                      </el-radio-group>
                    </div>
                  </template>
                  <div ref="reviewTrendChartRef" style="height: 300px"></div>
                </el-card>

                <!-- 审核历史列表 -->
                <el-card shadow="never" style="margin-top: 20px">
                  <template #header>
                    <div class="card-header">
                      <h3>审核记录</h3>
                      <div class="header-actions">
                        <el-select v-model="reviewFilter.status" placeholder="状态筛选" clearable size="small">
                          <el-option label="全部" value="" />
                          <el-option label="审核中" value="pending" />
                          <el-option label="已通过" value="approved" />
                          <el-option label="已拒绝" value="rejected" />
                        </el-select>
                        <el-button size="small" @click="loadReviewHistory">
                          <el-icon><Refresh /></el-icon>
                          刷新
                        </el-button>
                      </div>
                    </div>
                  </template>

                  <el-table :data="reviewHistory" v-loading="loadingReview" stripe>
                    <el-table-column prop="chapter_title" label="章节标题" min-width="200" />
                    <el-table-column prop="chapter_number" label="章节号" width="100" />
                    <el-table-column label="审核状态" width="100">
                      <template #default="{ row }">
                        <el-tag :type="getReviewStatusType(row.status)">
                          {{ getReviewStatusLabel(row.status) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="提交时间" width="180">
                      <template #default="{ row }">
                        {{ formatDate(row.submitted_at) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="审核时间" width="180">
                      <template #default="{ row }">
                        {{ row.reviewed_at ? formatDate(row.reviewed_at) : '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column label="审核人" width="120">
                      <template #default="{ row }">
                        {{ row.reviewer_name || '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" fixed="right">
                      <template #default="{ row }">
                        <el-button
                          size="small"
                          type="primary"
                          @click="viewReviewDetail(row)"
                        >
                          查看详情
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>

                  <el-pagination
                    v-if="reviewTotal > 0"
                    v-model:current-page="reviewPage"
                    v-model:page-size="reviewPageSize"
                    :total="reviewTotal"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next"
                    @current-change="loadReviewHistory"
                    @size-change="loadReviewHistory"
                    style="margin-top: 16px; justify-content: center"
                  />
                </el-card>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发布计划对话框 -->
    <el-dialog v-model="showPublishPlanDialog" title="发布计划" width="600px">
      <el-form :model="planForm" label-width="100px">
        <el-form-item label="计划名称">
          <el-input v-model="planForm.name" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="发布类型">
          <el-select v-model="planForm.type" style="width: 100%">
            <el-option
              v-for="option in publishTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <div>
                <div>{{ option.label }}</div>
                <div style="font-size: 12px; color: var(--el-text-color-secondary)">
                  {{ option.description }}
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发布平台">
          <el-checkbox-group v-model="planForm.platforms">
            <el-checkbox
              v-for="option in publishPlatformOptions"
              :key="option.value"
              :label="option.value"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="发布方式">
          <el-radio-group v-model="planForm.scheduleType">
            <el-radio label="immediate">立即发布</el-radio>
            <el-radio label="scheduled">定时发布</el-radio>
            <el-radio label="manual">手动发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="planForm.scheduleType === 'scheduled'" label="发布间隔">
          <el-input-number v-model="planForm.intervalDays" :min="1" :max="30" />
          <span style="margin-left: 8px">天</span>
        </el-form-item>
        <el-form-item v-if="planForm.scheduleType === 'scheduled'" label="每次发布">
          <el-input-number v-model="planForm.chaptersPerRelease" :min="1" :max="10" />
          <span style="margin-left: 8px">章</span>
        </el-form-item>
        <el-form-item label="定价设置">
          <el-radio-group v-model="planForm.isFree">
            <el-radio :label="true">免费</el-radio>
            <el-radio :label="false">付费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!planForm.isFree" label="章节价格">
          <el-input-number v-model="planForm.price" :min="1" :max="1000" />
          <span style="margin-left: 8px">书币</span>
        </el-form-item>
        <el-form-item v-if="!planForm.isFree" label="VIP折扣">
          <el-input-number v-model="planForm.vipDiscount" :min="0" :max="100" />
          <span style="margin-left: 8px">%</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPublishPlanDialog = false">取消</el-button>
        <el-button type="primary" @click="savePublishPlan">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog v-model="showExportDialog" title="导出作品" width="500px">
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="导出格式">
          <el-select v-model="exportForm.format" style="width: 100%">
            <el-option
              v-for="option in exportFormatOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="导出范围">
          <el-select v-model="exportForm.scope" style="width: 100%">
            <el-option
              v-for="option in exportScopeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="包含选项">
          <el-checkbox-group v-model="exportForm.options">
            <el-checkbox label="include_metadata">包含元数据</el-checkbox>
            <el-checkbox label="include_comments">包含评论</el-checkbox>
            <el-checkbox label="include_toc">包含目录</el-checkbox>
            <el-checkbox label="page_breaks">分页符</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button type="primary" @click="startExport">开始导出</el-button>
      </template>
    </el-dialog>

    <!-- 审核详情对话框 -->
    <el-dialog
      v-model="reviewDetailDialogVisible"
      title="审核详情"
      width="600px"
    >
      <div v-if="currentReviewDetail" class="review-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="章节标题" :span="2">
            {{ currentReviewDetail.chapter_title }}
          </el-descriptions-item>
          <el-descriptions-item label="章节号">
            {{ currentReviewDetail.chapter_number }}
          </el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getReviewStatusType(currentReviewDetail.status)">
              {{ getReviewStatusLabel(currentReviewDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDate(currentReviewDetail.submitted_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="审核时间">
            {{ currentReviewDetail.reviewed_at ? formatDate(currentReviewDetail.reviewed_at) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核人" :span="2">
            {{ currentReviewDetail.reviewer_name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核意见" :span="2" v-if="currentReviewDetail.review_comment">
            <div class="review-comment">
              {{ currentReviewDetail.review_comment }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="reviewDetailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentReviewDetail?.status === 'rejected'"
          type="primary"
          @click="resubmitReview"
        >
          重新提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { message } from '@/design-system/services'
import { Download, Setting, Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
  getPublishPlan,
  createPublishPlan,
  updatePublishPlan,
  pausePublishPlan,
  resumePublishPlan,
  getPublishStats,
  getPublishRecords,
  publishChapter as apiPublishChapter,
  unpublishChapter as apiUnpublishChapter,
  scheduleChapter as apiScheduleChapter,
  submitForReview,
  type PublishPlan,
  type PublishRecord,
  type PublishStats,
  publishTypeOptions,
  publishPlatformOptions
} from '@/modules/writer/api'
import {
  createExportTask,
  getExportHistory,
  downloadExportFile,
  cancelExportTask,
  deleteExportTask as apiDeleteExportTask,
  exportFormatOptions,
  exportScopeOptions,
  type ExportTask
} from '@/modules/writer/api'

// 假设从路由参数获取书籍ID
const bookId = ref('')

const loadingStats = ref(false)
const loadingRecords = ref(false)
const loadingExport = ref(false)

const activeTab = ref('plan')
const stats = reactive<PublishStats>({
  total_chapters: 0,
  published_chapters: 0,
  draft_chapters: 0,
  pending_review_chapters: 0,
  scheduled_chapters: 0,
  total_words: 0,
  published_words: 0
})

const publishPlan = ref<PublishPlan | null>(null)
const publishRecords = ref<PublishRecord[]>([])
const recordPage = ref(1)
const recordPageSize = ref(20)
const recordTotal = ref(0)
const chapterFilter = reactive({ status: '' })

const exportHistory = ref<ExportTask[]>([])
const exportPage = ref(1)
const exportPageSize = ref(20)
const exportTotal = ref(0)

const showPublishPlanDialog = ref(false)
const showExportDialog = ref(false)

const planForm = reactive({
  name: '',
  type: 'free' as const,
  platforms: ['all'],
  scheduleType: 'immediate' as const,
  intervalDays: 1,
  chaptersPerRelease: 1,
  isFree: true,
  price: 10,
  vipDiscount: 80
})

const exportForm = reactive({
  format: 'pdf' as const,
  scope: 'book' as const,
  options: ['include_metadata', 'include_toc']
})

// 审核历史相关状态
const loadingReview = ref(false)
const reviewHistory = ref<any[]>([])
const reviewPage = ref(1)
const reviewPageSize = ref(20)
const reviewTotal = ref(0)
const reviewFilter = reactive({ status: '' })
const reviewTrendPeriod = ref('7d')
const reviewTrendChartRef = ref<HTMLElement | null>(null)
const reviewTrendChart = ref<echarts.ECharts | null>(null)
const reviewDetailDialogVisible = ref(false)
const currentReviewDetail = ref<any>(null)

// 审核统计数据
const reviewStats = reactive({
  total: 0,
  approved: 0,
  approvedRate: 0,
  rejected: 0,
  rejectedRate: 0,
  pending: 0
})

// 加载发布统计
const loadStats = async () => {
  loadingStats.value = true
  try {
    const res = await getPublishStats(bookId.value)
    Object.assign(stats, res)
  } catch (error: any) {
    console.error('加载统计失败', error)
  } finally {
    loadingStats.value = false
  }
}

// 加载发布计划
const loadPublishPlan = async () => {
  try {
    publishPlan.value = await getPublishPlan(bookId.value)
  } catch (error: any) {
    console.error('加载发布计划失败', error)
  }
}

// 加载发布记录
const loadPublishRecords = async () => {
  loadingRecords.value = true
  try {
    const res = await getPublishRecords(bookId.value, {
      page: recordPage.value,
      page_size: recordPageSize.value,
      status: chapterFilter.status || undefined
    })
    publishRecords.value = res.items
    recordTotal.value = res.total
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loadingRecords.value = false
  }
}

// 加载导出历史
const loadExportHistory = async () => {
  loadingExport.value = true
  try {
    const res = await getExportHistory(bookId.value, {
      page: exportPage.value,
      page_size: exportPageSize.value
    })
    exportHistory.value = res.items
    exportTotal.value = res.total
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loadingExport.value = false
  }
}

// 保存发布计划
const savePublishPlan = async () => {
  try {
    if (publishPlan.value) {
      await updatePublishPlan(publishPlan.value.id, {
        name: planForm.name,
        type: planForm.type,
        platforms: planForm.platforms,
        schedule: {
          type: planForm.scheduleType,
          interval_days: planForm.intervalDays,
          chapters_per_release: planForm.chaptersPerRelease
        },
        pricing: {
          is_free: planForm.isFree,
          price: planForm.price,
          vip_discount: planForm.vipDiscount
        }
      })
      message.success('更新成功')
    } else {
      await createPublishPlan(bookId.value, {
        name: planForm.name,
        type: planForm.type,
        platforms: planForm.platforms,
        schedule: {
          type: planForm.scheduleType,
          interval_days: planForm.intervalDays,
          chapters_per_release: planForm.chaptersPerRelease
        },
        pricing: {
          is_free: planForm.isFree,
          price: planForm.price,
          vip_discount: planForm.vipDiscount
        }
      })
      message.success('创建成功')
    }
    showPublishPlanDialog.value = false
    loadPublishPlan()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 编辑发布计划
const editPublishPlan = () => {
  if (!publishPlan.value) return
  Object.assign(planForm, {
    name: publishPlan.value.name,
    type: publishPlan.value.type,
    platforms: publishPlan.value.platforms,
    scheduleType: publishPlan.value.schedule.type,
    intervalDays: publishPlan.value.schedule.interval_days || 1,
    chaptersPerRelease: publishPlan.value.schedule.chapters_per_release || 1,
    isFree: publishPlan.value.pricing.is_free,
    price: publishPlan.value.pricing.price || 10,
    vipDiscount: publishPlan.value.pricing.vip_discount || 80
  })
  showPublishPlanDialog.value = true
}

// 暂停计划
const pausePlan = async () => {
  if (!publishPlan.value) return
  try {
    await pausePublishPlan(publishPlan.value.id)
    message.success('已暂停')
    loadPublishPlan()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 恢复计划
const resumePlan = async () => {
  if (!publishPlan.value) return
  try {
    await resumePublishPlan(publishPlan.value.id)
    message.success('已恢复')
    loadPublishPlan()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 发布章节
const publishChapter = async (record: PublishRecord) => {
  try {
    await apiPublishChapter(record.chapter_id, {})
    message.success('发布成功')
    loadPublishRecords()
    loadStats()
  } catch (error: any) {
    message.error(error.message || '发布失败')
  }
}

// 下架章节
const unpublishChapter = async (record: PublishRecord) => {
  try {
    await apiUnpublishChapter(record.chapter_id)
    message.success('下架成功')
    loadPublishRecords()
    loadStats()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 定时发布
const scheduleChapter = (record: PublishRecord) => {
  message.info('定时发布功能开发中')
}

// 查看审核
const viewReview = (record: PublishRecord) => {
  message.info('审核详情功能开发中')
}

// 提交审核
const submitReview = async () => {
  try {
    await submitForReview(bookId.value)
    message.success('已提交审核')
  } catch (error: any) {
    message.error(error.message || '提交失败')
  }
}

// 开始导出
const startExport = async () => {
  try {
    await createExportTask(bookId.value, {
      format: exportForm.format,
      scope: exportForm.scope,
      include_metadata: exportForm.options.includes('include_metadata'),
      include_comments: exportForm.options.includes('include_comments'),
      include_toc: exportForm.options.includes('include_toc'),
      page_breaks: exportForm.options.includes('page_breaks')
    })
    message.success('导出任务已创建')
    showExportDialog.value = false
    activeTab.value = 'export'
    loadExportHistory()
  } catch (error: any) {
    message.error(error.message || '导出失败')
  }
}

// 下载导出
const downloadExport = async (task: ExportTask) => {
  try {
    const blob = await downloadExportFile(task.id)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export_${task.id}.${task.format}`
    a.click()
    URL.revokeObjectURL(url)
    message.success('下载成功')
  } catch (error: any) {
    message.error(error.message || '下载失败')
  }
}

// 取消导出
const cancelExport = async (task: ExportTask) => {
  try {
    await cancelExportTask(task.id)
    message.success('已取消')
    loadExportHistory()
  } catch (error: any) {
    message.error(error.message || '操作失败')
  }
}

// 删除导出
const deleteExport = async (task: ExportTask) => {
  try {
    await apiDeleteExportTask(task.id)
    message.success('删除成功')
    loadExportHistory()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

// ========== 审核历史相关方法 ==========

// 加载审核统计
const loadReviewStats = async () => {
  try {
    // TODO: 调用审核统计 API
    // const res = await getReviewStats(bookId.value)
    // Object.assign(reviewStats, res)

    // 模拟数据
    reviewStats.total = 45
    reviewStats.approved = 38
    reviewStats.approvedRate = Math.round((reviewStats.approved / reviewStats.total) * 100)
    reviewStats.rejected = 4
    reviewStats.rejectedRate = Math.round((reviewStats.rejected / reviewStats.total) * 100)
    reviewStats.pending = 3
  } catch (error: any) {
    console.error('加载审核统计失败', error)
  }
}

// 加载审核历史
const loadReviewHistory = async () => {
  loadingReview.value = true
  try {
    // TODO: 调用审核历史 API
    // const res = await getReviewHistory(bookId.value, {
    //   page: reviewPage.value,
    //   size: reviewPageSize.value,
    //   status: reviewFilter.status
    // })
    // reviewHistory.value = res.items
    // reviewTotal.value = res.total

    // 模拟数据
    reviewHistory.value = [
      {
        id: '1',
        chapter_title: '第一章：初入江湖',
        chapter_number: 1,
        status: 'approved',
        submitted_at: new Date(Date.now() - 86400000).toISOString(),
        reviewed_at: new Date(Date.now() - 72000000).toISOString(),
        reviewer_name: '审核员A',
        review_comment: '内容质量良好，符合平台规范'
      },
      {
        id: '2',
        chapter_title: '第二章：意外发现',
        chapter_number: 2,
        status: 'approved',
        submitted_at: new Date(Date.now() - 172800000).toISOString(),
        reviewed_at: new Date(Date.now() - 158400000).toISOString(),
        reviewer_name: '审核员B',
        review_comment: '章节结构合理'
      },
      {
        id: '3',
        chapter_title: '第三章：神秘人物',
        chapter_number: 3,
        status: 'rejected',
        submitted_at: new Date(Date.now() - 259200000).toISOString(),
        reviewed_at: new Date(Date.now() - 244800000).toISOString(),
        reviewer_name: '审核员C',
        review_comment: '部分内容需修改，请重新提交'
      },
      {
        id: '4',
        chapter_title: '第四章：危机四伏',
        chapter_number: 4,
        status: 'pending',
        submitted_at: new Date(Date.now() - 43200000).toISOString(),
        reviewed_at: null,
        reviewer_name: null,
        review_comment: null
      }
    ]
    reviewTotal.value = 4
  } catch (error: any) {
    console.error('加载审核历史失败', error)
    ElMessage.error('加载审核历史失败')
  } finally {
    loadingReview.value = false
  }
}

// 查看审核详情
const viewReviewDetail = (row: any) => {
  currentReviewDetail.value = row
  reviewDetailDialogVisible.value = true
}

// 重新提交审核
const resubmitReview = () => {
  reviewDetailDialogVisible.value = false
  ElMessage.info('重新提交功能开发中')
  // TODO: 实现重新提交审核逻辑
}

// 获取审核状态标签
const getReviewStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status] || status
}

// 获取审核状态标签类型
const getReviewStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || ''
}

// 初始化审核趋势图表
const initReviewTrendChart = () => {
  if (!reviewTrendChartRef.value) return

  reviewTrendChart.value = echarts.init(reviewTrendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['提交审核', '审核通过', '审核拒绝']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '提交审核',
        type: 'line',
        data: [5, 8, 6, 9, 7, 4, 6],
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '审核通过',
        type: 'line',
        data: [4, 7, 5, 8, 6, 4, 5],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '审核拒绝',
        type: 'line',
        data: [1, 1, 1, 1, 1, 0, 1],
        smooth: true,
        itemStyle: { color: '#f56c6c' }
      }
    ]
  }

  reviewTrendChart.value.setOption(option)
}

// 监听审核趋势周期变化
watch(reviewTrendPeriod, () => {
  // TODO: 根据周期重新加载图表数据
  initReviewTrendChart()
})

// 监听 tab 切换，初始化图表
watch(activeTab, (newTab) => {
  if (newTab === 'review') {
    loadReviewStats()
    loadReviewHistory()
    setTimeout(() => {
      initReviewTrendChart()
    }, 100)
  }
})

// 辅助函数
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const getTypeLabel = (type: string) => {
  return publishTypeOptions.find(o => o.value === type)?.label || type
}

const getTypeTagType = (type: string) => {
  const map: Record<string, any> = {
    free: 'success',
    paid: 'warning',
    vip: 'danger',
    limited: 'info'
  }
  return map[type] || ''
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    pending_review: '审核中',
    scheduled: '定时发布',
    published: '已发布',
    rejected: '已驳回',
    unpublished: '已下架'
  }
  return map[status] || status
}

const getStatusTagType = (status: string) => {
  const map: Record<string, any> = {
    draft: 'info',
    pending_review: 'warning',
    scheduled: 'info',
    published: 'success',
    rejected: 'danger',
    unpublished: 'info'
  }
  return map[status] || ''
}

const getPlatformLabel = (platform: string) => {
  return publishPlatformOptions.find(o => o.value === platform)?.label || platform
}

const getScheduleTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    immediate: '立即发布',
    scheduled: '定时发布',
    manual: '手动发布'
  }
  return map[type] || type
}

const getScopeLabel = (scope: string) => {
  return exportScopeOptions.find(o => o.value === scope)?.label || scope
}

const getExportStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || ''
}

const getExportStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '等待中',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

onMounted(() => {
  // 这里应该从路由参数获取书籍ID
  bookId.value = 'demo-book-id'
  loadStats()
  loadPublishPlan()
  loadPublishRecords()
  loadExportHistory()
})
</script>

<style scoped lang="scss">
.publish-management-view {
  padding: 20px;
}

.stats-card {
  h3 {
    margin: 0;
    font-size: 16px;
  }
}

.stats-list {
  .stat-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }

    .value {
      font-size: 18px;
      font-weight: 600;

      &.success {
        color: var(--el-color-success);
      }

      &.info {
        color: var(--el-color-info);
      }

      &.warning {
        color: var(--el-color-warning);
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.empty-plan {
  padding: 40px 0;
}

.plan-detail {
  .plan-actions {
    margin-top: 20px;
    display: flex;
    gap: 12px;
  }
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.chapter-publish,
.export-history {
  :deep(.el-pagination) {
    display: flex;
  }
}

.review-history {
  .review-stats {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .review-detail {
    .review-comment {
      white-space: pre-wrap;
      word-break: break-word;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-top: 8px;
    }
  }

  :deep(.el-pagination) {
    display: flex;
  }
}
</style>
