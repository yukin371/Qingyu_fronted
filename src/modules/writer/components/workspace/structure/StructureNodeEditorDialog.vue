<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="520px"
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
  >
    <el-form label-width="96px">
      <el-form-item label="节点标题">
        <el-input v-model="localForm.title" placeholder="输入结构节点标题" />
      </el-form-item>

      <el-form-item label="层级" v-if="mode !== 'edit'">
        <el-select v-model="localForm.level" style="width: 100%">
          <el-option label="章节主干" :value="1" />
          <el-option label="小节细纲" :value="2" />
          <el-option label="场景节拍" :value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="localForm.status" style="width: 100%">
          <el-option label="草稿" value="planned" />
          <el-option label="写作中" value="writing" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </el-form-item>

      <el-form-item label="结构说明">
        <el-input
          v-model="localForm.description"
          type="textarea"
          :rows="4"
          placeholder="补充这个节点的目标、冲突、结果或节拍要点"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="emitSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElOption, ElSelect } from 'element-plus'

export interface StructureNodeFormValue {
  title: string
  level: number
  status: 'planned' | 'writing' | 'completed'
  description: string
}

const props = defineProps<{
  visible: boolean
  mode: 'create-root' | 'create-child' | 'edit'
  initialValue: StructureNodeFormValue
  submitting: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit', value: StructureNodeFormValue): void
}>()

const localForm = reactive<StructureNodeFormValue>({
  title: '',
  level: 1,
  status: 'planned',
  description: '',
})

const dialogTitle = computed(() => {
  if (props.mode === 'edit') return '编辑结构节点'
  if (props.mode === 'create-child') return '新增子节点'
  return '新增主干节点'
})

watch(
  () => props.initialValue,
  (value) => {
    localForm.title = value.title
    localForm.level = value.level
    localForm.status = value.status
    localForm.description = value.description
  },
  { immediate: true, deep: true },
)

function emitSubmit() {
  emit('submit', {
    title: localForm.title.trim(),
    level: localForm.level,
    status: localForm.status,
    description: localForm.description.trim(),
  })
}
</script>
