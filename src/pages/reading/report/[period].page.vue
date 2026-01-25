<template>
  <ReadingReportView :period="period" />
</template>

<script setup lang="ts">
import ReadingReportView from '@/modules/reading-stats/views/ReadingReportView.vue'

defineProps<{ period: string }>()
</script>

<route lang="json5">
{
  name: 'reading:report-period',
  props: true,
  meta: { title: '阅读报告', requiresAuth: true }
}
</route>
