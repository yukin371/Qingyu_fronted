<template>
  <EditorsPickView />
</template>

<script setup lang="ts">
import EditorsPickView from '@/modules/discovery/views/EditorsPickView.vue'
</script>

<route lang="json5">
{
  name: 'discovery:editors-pick',
  meta: { title: '编辑推荐' }
}
</route>
