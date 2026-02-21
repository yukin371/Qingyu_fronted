<template>
  <el-dialog
    v-model="visible"
    title="数据迁移"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="!migrationStarted" class="migration-info">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #title>
          发现本地数据
        </template>
        <p>
          您有 <strong>{{ localData.projectCount }}</strong> 个本地项目和
          <strong>{{ localData.documentCount }}</strong> 个文档可以迁移到云端。
        </p>
      </el-alert>

      <div class="migration-note">
        <p>迁移说明：</p>
        <ul>
          <li>本地项目将被创建为云端项目</li>
          <li>项目中的文档也会一并迁移</li>
          <li>迁移完成后可选择清空本地数据</li>
        </ul>
      </div>
    </div>

    <div v-else-if="migrating" class="migration-progress">
      <el-progress
        :percentage="progressPercent"
        :status="progressPercent === 100 ? 'success' : ''"
      />
      <p class="progress-status">{{ progress.status }}</p>
    </div>

    <div v-else class="migration-result">
      <el-result
        v-if="migrationResult?.success"
        icon="success"
        title="迁移成功"
        :sub-title="`已迁移 ${migrationResult.projectsMigrated} 个项目和 ${migrationResult.documentsMigrated} 个文档`"
      />
      <el-result
        v-else
        icon="error"
        title="迁移完成（部分失败）"
      >
        <template #sub-title>
          <div>
            <p>成功: {{ migrationResult?.projectsMigrated }} 个项目, {{ migrationResult?.documentsMigrated }} 个文档</p>
            <p v-if="migrationResult?.errors?.length">错误: {{ migrationResult.errors.length }} 个</p>
          </div>
        </template>
        <template #extra>
          <div class="error-list">
            <el-scrollbar max-height="150px">
              <p v-for="(error, index) in migrationResult?.errors" :key="index" class="error-item">
                {{ error }}
              </p>
            </el-scrollbar>
          </div>
        </template>
      </el-result>

      <el-checkbox v-model="clearLocalAfterMigration" :disabled="clearingLocal">
        迁移成功后清空本地数据
      </el-checkbox>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="!migrationStarted" @click="handleClose">取消</el-button>
        <el-button
          v-if="!migrationStarted"
          type="primary"
          :loading="checkingLocal"
          @click="startMigration"
        >
          开始迁移
        </el-button>
        <el-button
          v-if="migrationStarted && !migrating"
          type="primary"
          @click="handleComplete"
        >
          完成
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  migrateToBackend,
  hasLocalDataToMigrate,
  clearLocalData,
  type MigrationResult,
} from '@/utils/migration'

interface Props {
  modelValue: boolean
}

interface Emits {
  (_e: 'update:modelValue', _value: boolean): void
  (_e: 'migration-complete'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const checkingLocal = ref(false)
const migrating = ref(false)
const migrationStarted = ref(false)
const clearLocalAfterMigration = ref(true)
const clearingLocal = ref(false)

const localData = ref({
  hasData: false,
  projectCount: 0,
  documentCount: 0,
})

const migrationResult = ref<MigrationResult | null>(null)

const progress = ref({
  current: 0,
  total: 0,
  status: '',
})

const progressPercent = computed(() => {
  if (progress.value.total === 0) return 0
  return Math.round((progress.value.current / progress.value.total) * 100)
})

// 检查本地数据
const checkLocalData = async () => {
  checkingLocal.value = true
  try {
    localData.value = await hasLocalDataToMigrate()
  } finally {
    checkingLocal.value = false
  }
}

// 开始迁移
const startMigration = async () => {
  migrating.value = true
  migrationStarted.value = true
  migrationResult.value = null

  try {
    migrationResult.value = await migrateToBackend((p) => {
      progress.value = p
    })

    // 如果迁移成功且用户选择清空本地数据
    if (migrationResult.value.success && clearLocalAfterMigration.value) {
      clearingLocal.value = true
      try {
        await clearLocalData()
        ElMessage.success('本地数据已清空')
      } catch (error: unknown) {
        ElMessage.warning('清空本地数据失败: ' + (error instanceof Error ? error.message : '未知错误'))
      } finally {
        clearingLocal.value = false
      }
    }
  } catch (error: unknown) {
    ElMessage.error('迁移失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    migrating.value = false
  }
}

// 完成迁移
const handleComplete = () => {
  emit('migration-complete')
  handleClose()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  // 重置状态
  migrationStarted.value = false
  migrating.value = false
  migrationResult.value = null
  progress.value = { current: 0, total: 0, status: '' }
}

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    checkLocalData()
  }
})
</script>

<style scoped>
.migration-info {
  padding: 10px 0;
}

.migration-note {
  margin-top: 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.migration-note p {
  margin: 0 0 8px 0;
  font-weight: 500;
}

.migration-note ul {
  margin: 0;
  padding-left: 20px;
}

.migration-note li {
  margin: 4px 0;
  color: var(--el-text-color-secondary);
}

.migration-progress {
  padding: 20px 0;
  text-align: center;
}

.progress-status {
  margin-top: 12px;
  color: var(--el-text-color-secondary);
}

.migration-result {
  text-align: center;
}

.error-list {
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
}

.error-item {
  margin: 4px 0;
  font-size: 12px;
  color: var(--el-color-danger);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
