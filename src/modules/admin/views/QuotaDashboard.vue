<template>
  <div class="mx-auto max-w-[1440px] space-y-6">
    <section
      class="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-7 shadow-[0_26px_80px_rgba(15,23,42,0.08)]"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Admin Quota
          </p>
          <h2 class="mt-3 text-3xl font-black text-slate-900">AI 配额仪表板</h2>
          <p class="mt-2 text-sm text-slate-500">
            汇总实时消耗、配额风险和重点用户，供管理员快速处理。
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <el-segmented v-model="days" :options="dayOptions" />
          <el-button :loading="loading" @click="loadDashboard">刷新</el-button>
          <el-button type="primary" @click="goTo('/admin/quota/reports')">查看报表</el-button>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <QuotaStatCard
        eyebrow="总览"
        title="纳入配额管理用户"
        :value="formatNumber(summary.totalUsers)"
        subtitle="全量 quota 账户"
        icon="用户"
        clickable
        @click="goTo('/admin/quota/users')"
      />
      <QuotaStatCard
        eyebrow="今日"
        title="Token 消耗"
        :value="formatNumber(summary.totalConsumption)"
        subtitle="近一次聚合结果"
        icon="Tok"
        :accent="'linear-gradient(135deg, #0f766e 0%, #0ea5e9 100%)'"
        :accent-glow="'radial-gradient(circle at top right, rgba(14,165,233,0.16), transparent 40%)'"
      />
      <QuotaStatCard
        eyebrow="风险"
        title="临近耗尽用户"
        :value="formatNumber(summary.nearExhaustUsers)"
        subtitle="建议优先复核充值/策略"
        icon="预警"
        clickable
        :accent="'linear-gradient(135deg, #d97706 0%, #f97316 100%)'"
        :accent-glow="'radial-gradient(circle at top right, rgba(249,115,22,0.18), transparent 38%)'"
        @click="goTo('/admin/quota/alerts')"
      />
      <QuotaStatCard
        eyebrow="状态"
        title="已暂停用户"
        :value="formatNumber(summary.suspendedUsers)"
        subtitle="可批量恢复或保持冻结"
        icon="冻结"
        :accent="'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'"
        :accent-glow="'radial-gradient(circle at top right, rgba(124,58,237,0.16), transparent 40%)'"
      />
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">消耗趋势</h3>
            <p class="text-sm text-slate-500">近 {{ days }} 天 Token 消耗与活跃用户数</p>
          </div>
          <el-tag type="success" effect="plain">缓存聚合</el-tag>
        </div>
        <QuotaTrendChart :points="trendData" mode="dashboard" height="340px" />
      </article>

      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">配额分布</h3>
            <p class="text-sm text-slate-500">当前以角色分布为主视图</p>
          </div>
          <el-button
            text
            @click="distributionMode = distributionMode === 'role' ? 'status' : 'role'"
          >
            切换到{{ distributionMode === 'role' ? '状态' : '角色' }}
          </el-button>
        </div>
        <QuotaDistributionChart :data="distributionSource" height="340px" />
      </article>
    </section>

    <section class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">消耗排行 TOP 10</h3>
            <p class="text-sm text-slate-500">快速定位高消耗或配额风险用户</p>
          </div>
          <el-button text @click="goTo('/admin/quota/users')">用户列表</el-button>
        </div>
        <div
          v-if="topConsumers.length === 0"
          class="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400"
        >
          暂无排行数据
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(user, index) in topConsumers"
            :key="user.userId"
            class="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/90 px-4 py-3"
          >
            <div
              class="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white"
            >
              {{ index + 1 }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-semibold text-slate-900">
                {{ user.username || user.userId }}
              </div>
              <div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{{ user.userId }}</span>
                <span>{{ user.role || 'unknown' }}</span>
              </div>
            </div>
            <div class="w-28">
              <el-progress
                :percentage="clampPercent(user.usagePercent)"
                :stroke-width="10"
                :show-text="false"
              />
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-slate-900">
                {{ formatNumber(user.usedQuota) }}
              </div>
              <div class="text-xs text-slate-500">/ {{ formatNumber(user.totalQuota) }}</div>
            </div>
          </div>
        </div>
      </article>

      <article
        class="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900">最新预警</h3>
            <p class="text-sm text-slate-500">异常、阈值与一致性事件</p>
          </div>
          <el-button text @click="goTo('/admin/quota/alerts')">预警中心</el-button>
        </div>
        <div
          v-if="recentAlerts.length === 0"
          class="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400"
        >
          当前没有新预警
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="alert in recentAlerts"
            :key="alert.id"
            class="rounded-2xl border px-4 py-3"
            :class="alertCardClass(alert.level)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">{{ alert.title }}</div>
                <div class="mt-1 text-xs opacity-80">
                  {{ alert.userId || '全局预警' }} · {{ alert.createdAt }}
                </div>
              </div>
              <el-tag :type="tagType(alert.level)" effect="dark">{{ alert.level }}</el-tag>
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from '@/design-system/services'
import {
  getQuotaDashboard,
  getQuotaTrend,
  type QuotaAlertSummary,
  type QuotaDashboard,
  type QuotaTopConsumer,
  type QuotaTrendPoint,
} from '@/api/admin/quota'
import QuotaDistributionChart from '../components/quota/QuotaDistributionChart.vue'
import QuotaStatCard from '../components/quota/QuotaStatCard.vue'
import QuotaTrendChart from '../components/quota/QuotaTrendChart.vue'

const router = useRouter()
const loading = ref(false)
const days = ref(7)
const distributionMode = ref<'role' | 'status'>('role')
const summary = ref<QuotaDashboard['summary']>({
  totalUsers: 0,
  activeUsers: 0,
  exhaustedUsers: 0,
  nearExhaustUsers: 0,
  suspendedUsers: 0,
  totalConsumption: 0,
  avgConsumption: 0,
})
const distribution = ref<QuotaDashboard['distribution']>({
  byRole: {},
  byLevel: {},
  byService: {},
  byStatus: {},
})
const topConsumers = ref<QuotaTopConsumer[]>([])
const recentAlerts = ref<QuotaAlertSummary[]>([])
const trendData = ref<QuotaTrendPoint[]>([])

const dayOptions = [
  { label: '7 天', value: 7 },
  { label: '30 天', value: 30 },
  { label: '90 天', value: 90 },
]

const distributionSource = computed(() =>
  distributionMode.value === 'role' ? distribution.value.byRole : distribution.value.byStatus,
)

const formatNumber = (value: number) => Number(value || 0).toLocaleString('zh-CN')

const clampPercent = (value: number) => Math.max(0, Math.min(100, Number(value || 0)))

const tagType = (level?: string) => {
  if (level === 'critical') return 'danger'
  if (level === 'warning') return 'warning'
  return 'info'
}

const alertCardClass = (level?: string) => {
  if (level === 'critical') return 'border-rose-100 bg-rose-50 text-rose-700'
  if (level === 'warning') return 'border-amber-100 bg-amber-50 text-amber-700'
  return 'border-sky-100 bg-sky-50 text-sky-700'
}

const goTo = (path: string) => {
  router.push(path)
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const [dashboard, trend] = await Promise.all([getQuotaDashboard(), getQuotaTrend(days.value)])
    summary.value = dashboard.summary
    distribution.value = dashboard.distribution
    topConsumers.value = dashboard.topConsumers ?? []
    recentAlerts.value = dashboard.recentAlerts ?? []
    trendData.value = trend.length > 0 ? trend : (dashboard.trendData ?? [])
  } catch (error) {
    console.error('加载 quota dashboard 失败:', error)
    message.error('加载配额仪表板失败')
  } finally {
    loading.value = false
  }
}

watch(days, () => {
  void loadDashboard()
})

onMounted(() => {
  void loadDashboard()
})
</script>
