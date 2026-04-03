<template>
  <el-dialog
    :model-value="visible"
    title="导出作品"
    width="500px"
    @update:model-value="$emit('update:visible', $event)"
  >
    <el-form :model="localForm" label-width="100px">
      <el-form-item label="导出格式">
        <el-select v-model="localForm.format" style="width: 100%">
          <el-option
            v-for="option in exportFormatOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="导出范围">
        <el-select v-model="localForm.scope" style="width: 100%">
          <el-option
            v-for="option in exportScopeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="包含选项">
        <el-checkbox-group v-model="localForm.options">
          <el-checkbox label="include_metadata">包含元数据</el-checkbox>
          <el-checkbox label="include_comments">包含评论</el-checkbox>
          <el-checkbox label="include_toc">包含目录</el-checkbox>
          <el-checkbox label="page_breaks">分页符</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleExport">开始导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { exportFormatOptions, exportScopeOptions } from '@/modules/writer/api'

export interface ExportForm {
  format: 'txt' | 'md' | 'docx'
  scope: 'all'
  options: string[]
}

const props = defineProps<{
  visible: boolean
  form: ExportForm
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'export'): void
  (e: 'update:form', form: ExportForm): void
}>()

// 创建本地表单副本
const localForm = reactive<ExportForm>({ ...props.form })

// 监听 props.form 变化，同步到本地
watch(
  () => props.form,
  (newForm) => {
    Object.assign(localForm, newForm)
  },
  { deep: true },
)

// 导出时同步本地表单到父组件
const handleExport = () => {
  emit('update:form', { ...localForm })
  emit('export')
}
</script>
