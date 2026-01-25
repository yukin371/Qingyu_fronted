<script setup lang="ts">
/**
 * ConfigProvider 全局配置组件
 *
 * 为所有子组件提供全局配置上下文
 * 使用 Vue 的 provide/inject 机制实现配置共享
 * 组件自身 props 优先级高于 ConfigProvider 提供的配置
 */

import { provide, computed } from 'vue'
import type { ConfigProviderProps, ConfigProviderContext } from './types'
import { configProviderDefaults, CONFIG_PROVIDER_KEY } from './types'

// 组件 Props
const props = withDefaults(defineProps<ConfigProviderProps>(), {
  size: () => configProviderDefaults.size as ConfigProviderProps['size'],
  namespace: () => configProviderDefaults.namespace as string,
  direction: () => configProviderDefaults.direction as ConfigProviderProps['direction'],
  button: () => configProviderDefaults.button as ConfigProviderProps['button'],
  zIndex: () => configProviderDefaults.zIndex as ConfigProviderProps['zIndex'],
})

// 组件 Emits
const emit = defineEmits<{}>()

// 计算配置上下文
const configContext = computed<ConfigProviderContext>(() => ({
  size: props.size,
  namespace: props.namespace,
  locale: props.locale,
  direction: props.direction,
  button: props.button,
  zIndex: props.zIndex,
}))

// 提供配置上下文给所有子组件
provide(CONFIG_PROVIDER_KEY, configContext)

// 定义暴露给父组件的属性和方法
defineExpose({
  config: configContext,
})
</script>

<template>
  <!-- ConfigProvider 不渲染任何 DOM 结构，只作为配置提供者 -->
  <slot />
</template>
