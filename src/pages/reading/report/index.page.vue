<template>
  <ReadingReportView />
</template>

<script setup lang="ts">
import ReadingReportView from '@/modules/reading-stats/views/ReadingReportView.vue'
</script>

<route lang="json5">
{
  name: 'reading:report',
  meta: { title: '阅读报告', requiresAuth: true }
}
</route>
