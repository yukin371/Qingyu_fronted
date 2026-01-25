<template>
  <PostDetailView :id="id" />
</template>

<script setup lang="ts">
import PostDetailView from '@/modules/community/views/PostDetailView.vue'

defineProps<{ id: string }>()
</script>

<route lang="json5">
{
  name: 'community:post-detail',
  props: true,
  meta: { title: '动态详情' }
}
</route>
