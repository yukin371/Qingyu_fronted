<template>
  <TopicsView />
</template>

<script setup lang="ts">
import TopicsView from '@/modules/discovery/views/TopicsView.vue'
</script>

<route lang="json5">
{
  name: 'discovery:topics',
  meta: { title: '话题广场' }
}
</route>
