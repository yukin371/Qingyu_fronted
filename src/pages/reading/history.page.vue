<template>
  <ReadingHistoryDetailView />
</template>

<script setup lang="ts">
import ReadingHistoryDetailView from '@/modules/reading-stats/views/ReadingHistoryDetailView.vue'
</script>

<route lang="json5">
{
  name: 'reading:history-detail',
  meta: { title: '阅读历史', requiresAuth: true }
}
</route>
