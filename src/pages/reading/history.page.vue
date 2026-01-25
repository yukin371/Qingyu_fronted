<template>
  <ReadingHistoryView />
</template>

<script setup lang="ts">
import ReadingHistoryView from '@/modules/reader/views/ReadingHistoryView.vue'
</script>

<route lang="json5">
{
  name: 'reading:history',
  meta: { title: '阅读历史', requiresAuth: true }
}
</route>
