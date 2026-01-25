<template>
  <VIPPrivilegesView />
</template>

<script setup lang="ts">
import VIPPrivilegesView from '@/modules/vip/views/VIPPrivilegesView.vue'
</script>

<route lang="json5">
{
  name: 'vip:privileges',
  meta: { title: '会员权益' }
}
</route>
