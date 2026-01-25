<template>
  <MembershipView />
</template>

<script setup lang="ts">
import MembershipView from '@/modules/finance/views/MembershipView.vue'
</script>

<route lang="json5">
{
  name: 'finance:membership',
  meta: { title: '会员中心', requiresAuth: true }
}
</route>
