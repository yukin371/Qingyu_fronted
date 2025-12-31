<template>
  <el-dialog
    v-model="dialogVisible"
    title="充值"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="充值金额" prop="amount">
        <el-input-number
          v-model="form.amount"
          :min="1"
          :max="10000"
          :precision="2"
          :step="100"
          style="width: 100%"
        />
        <div class="amount-tips">
          <el-tag
            v-for="item in quickAmounts"
            :key="item"
            size="small"
            @click="selectAmount(item)"
            style="cursor: pointer; margin-right: 8px; margin-top: 8px"
          >
            ¥{{ item }}
          </el-tag>
        </div>
      </el-form-item>

      <el-form-item label="支付方式" prop="method">
        <el-radio-group v-model="form.method">
          <el-radio value="alipay">
            <span class="payment-option">
              <i class="el-icon-money"></i>
              支付宝
            </span>
          </el-radio>
          <el-radio value="wechat">
            <span class="payment-option">
              <i class="el-icon-chat-dot-round"></i>
              微信支付
            </span>
          </el-radio>
          <el-radio value="bank">
            <span class="payment-option">
              <i class="el-icon-bank-card"></i>
              银行卡
            </span>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-alert
        title="充值说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        <template #default>
          <ul style="margin: 0; padding-left: 20px">
            <li>单笔充值金额：1-10000元</li>
            <li>充值后余额实时到账</li>
            <li>充值金额不支持退款</li>
          </ul>
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">
        确认充值
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { RechargeRequest } from '@/types/shared'

interface Props {
  modelValue: boolean
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: RechargeRequest): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()

// 快速充值金额
const quickAmounts = [10, 50, 100, 200, 500, 1000]

// 表单数据
const form = ref<RechargeRequest>({
  amount: 100,
  method: 'alipay'
})

// 表单验证规则
const rules: FormRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      max: 10000,
      message: '充值金额必须在1-10000之间',
      trigger: 'blur'
    }
  ],
  method: [{ required: true, message: '请选择支付方式', trigger: 'change' }]
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    dialogVisible.value = val
  },
  { immediate: true }
)

// 选择快速金额
const selectAmount = (amount: number) => {
  form.value.amount = amount
}

// 确认充值
const handleConfirm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', { ...form.value })
    }
  })
}

// 关闭对话框
const handleClose = () => {
  emit('update:modelValue', false)
  formRef.value?.resetFields()
}
</script>

<style scoped lang="scss">
.amount-tips {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-option {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-radio) {
  margin-right: 0;
  height: auto;
}
</style>

