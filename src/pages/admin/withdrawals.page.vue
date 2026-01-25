<template>
  <WithdrawalManagement />
</template>

<script setup lang="ts">
import WithdrawalManagement from '@/modules/admin/views/WithdrawalManagement.vue'
</script>

<route lang="json5">
{
  name: 'admin:withdrawals',
  meta: { title: '提现审核', requiresAuth: true, roles: ['admin'] }
}
</route>
