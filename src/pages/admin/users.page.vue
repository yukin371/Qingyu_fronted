<template>
  <UserManagement />
</template>

<script setup lang="ts">
import UserManagement from '@/modules/admin/views/UserManagement.vue'
</script>

<route lang="json5">
{
  name: 'admin:users',
  meta: { title: '用户管理', requiresAuth: true, roles: ['admin'] }
}
</route>
