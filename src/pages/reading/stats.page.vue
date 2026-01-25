<template>
  <ReadingStatsView />
</template>

<script setup lang="ts">
import ReadingStatsView from '@/modules/reading-stats/views/ReadingStatsView.vue'
</script>

<route lang="json5">
{
  name: 'reading:stats',
  meta: { title: '阅读统计', requiresAuth: true }
}
</route>
