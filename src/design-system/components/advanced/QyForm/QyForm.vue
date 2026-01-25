<template>
  <form :class="formClasses" @submit.prevent="handleSubmit">
    <slot />
  </form>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'
import type { QyFormProps, QyFormEmits } from './types'

// Props
const props = withDefaults(defineProps<QyFormProps>(), {
  modelValue: () => ({}),
  rules: () => ({}),
  labelWidth: '100px',
  labelPosition: 'top'
})

// Emits
const emit = defineEmits<QyFormEmits>()

// Provide form context to children
provide('qyForm', {
  model: props.modelValue,
  rules: props.rules,
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  updateModel: (field: string, value: any) => {
    const newModel = { ...props.modelValue, [field]: value }
    emit('update:modelValue', newModel)
  }
})

// Compute form classes
const formClasses = computed(() => {
  const classes = [
    'qy-form',
    `qy-form--${props.labelPosition}`
  ]
  return classes.join(' ')
})

// Validate all fields
const validate = () => {
  // This will be implemented by child QyFormItem components
  // For now, just emit validate event
  emit('validate', true)
  return true
}

// Handle form submit
const handleSubmit = () => {
  const isValid = validate()
  emit('validate', isValid)
}

// Expose methods
defineExpose({
  validate
})
</script>

<style scoped>
.qy-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qy-form--left {
  gap: 0.75rem;
}

.qy-form--top {
  gap: 1rem;
}

.qy-form--right {
  gap: 0.75rem;
}
</style>
