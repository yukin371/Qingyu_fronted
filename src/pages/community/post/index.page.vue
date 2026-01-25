<template>
  <CreatePostView />
</template>

<script setup lang="ts">
import CreatePostView from '@/modules/community/views/CreatePostView.vue'
</script>

<route lang="json5">
{
  name: 'community:create-post',
  meta: { title: '发布动态', requiresAuth: true }
}
</route>
