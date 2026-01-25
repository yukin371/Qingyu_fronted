<template>
  <StatisticsView :book-id="bookId" />
</template>

<script setup lang="ts">
import StatisticsView from '@/modules/writer/views/StatisticsView.vue'

defineProps<{ bookId?: string }>()
</script>

<route lang="json5">
{
  name: 'writer:statistics',
  props: true,
  meta: { title: '数据分析', layout: 'writer', requiresAuth: true, roles: ['writer', 'admin'] }
}
</route>
