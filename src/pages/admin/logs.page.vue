<template>
  <OperationLogs />
</template>

<script setup lang="ts">
import OperationLogs from '@/modules/admin/views/OperationLogs.vue'
</script>

<route lang="json5">
{
  name: 'admin:logs',
  meta: { title: '操作日志', requiresAuth: true, roles: ['admin'] }
}
</route>
