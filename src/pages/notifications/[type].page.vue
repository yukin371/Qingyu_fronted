<template>
  <NotificationCenter :type="type" />
</template>

<script setup lang="ts">
import NotificationCenter from '@/modules/notification/views/NotificationCenter.vue'

defineProps<{ type: string }>()
</script>

<route lang="json5">
{
  name: 'notifications:by-type',
  props: true,
  meta: { title: '消息列表', requiresAuth: true }
}
</route>
