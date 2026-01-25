<template>
  <TopicPostsView :tag="tag" />
</template>

<script setup lang="ts">
import TopicPostsView from '@/modules/community/views/TopicPostsView.vue'

defineProps<{ tag: string }>()
</script>

<route lang="json5">
{
  name: 'community:topic-posts',
  props: true,
  meta: { title: '话题动态' }
}
</route>
