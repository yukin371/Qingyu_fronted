<template>
  <ReadingRankingView />
</template>

<script setup lang="ts">
import ReadingRankingView from '@/modules/reading-stats/views/ReadingRankingView.vue'
</script>

<route lang="json5">
{
  name: 'reading:ranking',
  meta: { title: '阅读排行' }
}
</route>
