<template>
  <TopicDetailView :id="id" />
</template>

<script setup lang="ts">
import TopicDetailView from '@/modules/discovery/views/TopicDetailView.vue'

defineProps<{ id: string }>()
</script>

<route lang="json5">
{
  name: 'discovery:topic-detail',
  props: true,
  meta: { title: '话题详情' }
}
</route>
