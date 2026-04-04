<template>
  <el-dialog :model-value="visible" title="发布计划" width="600px" @update:model-value="$emit('update:visible', $event)">
    <el-form :model="localForm" label-width="100px">
      <el-form-item label="计划名称">
        <el-input v-model="localForm.name" placeholder="请输入计划名称" />
      </el-form-item>
      <el-form-item label="发布类型">
        <el-select v-model="localForm.type" style="width: 100%">
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
        <el-checkbox-group v-model="localForm.platforms">
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
        <el-radio-group v-model="localForm.scheduleType">
          <el-radio value="immediate">立即发布</el-radio>
          <el-radio value="scheduled">定时发布</el-radio>
          <el-radio value="manual">手动发布</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="localForm.scheduleType === 'scheduled'" label="发布间隔">
        <el-input-number v-model="localForm.intervalDays" :min="1" :max="30" />
        <span style="margin-left: 8px">天</span>
      </el-form-item>
      <el-form-item v-if="localForm.scheduleType === 'scheduled'" label="每次发布">
        <el-input-number v-model="localForm.chaptersPerRelease" :min="1" :max="10" />
        <span style="margin-left: 8px">章</span>
      </el-form-item>
      <el-form-item label="定价设置">
        <el-radio-group v-model="localForm.isFree">
          <el-radio :value="true">免费</el-radio>
          <el-radio :value="false">付费</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="!localForm.isFree" label="章节价格">
        <el-input-number v-model="localForm.price" :min="1" :max="1000" />
        <span style="margin-left: 8px">书币</span>
      </el-form-item>
      <el-form-item v-if="!localForm.isFree" label="VIP折扣">
        <el-input-number v-model="localForm.vipDiscount" :min="0" :max="100" />
        <span style="margin-left: 8px">%</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import {
  publishTypeOptions,
  publishPlatformOptions,
} from '@/modules/writer/api'

export interface PlanForm {
  name: string
  type: 'free' | 'paid' | 'vip' | 'limited'
  platforms: string[]
  scheduleType: 'immediate' | 'scheduled' | 'manual'
  intervalDays: number
  chaptersPerRelease: number
  isFree: boolean
  price: number
  vipDiscount: number
}

const props = defineProps<{
  visible: boolean
  form: PlanForm
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'save'): void
  (e: 'update:form', form: PlanForm): void
}>()

// 创建本地表单副本
const localForm = reactive<PlanForm>({ ...props.form })

// 监听 props.form 变化，同步到本地
watch(
  () => props.form,
  (newForm) => {
    Object.assign(localForm, newForm)
  },
  { deep: true }
)

// 保存时同步本地表单到父组件
const handleSave = () => {
  emit('update:form', { ...localForm })
  emit('save')
}
</script>
