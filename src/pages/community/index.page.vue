<template>
  <CommunityFeedView />
</template>

<script setup lang="ts">
import CommunityFeedView from '@/modules/community/views/CommunityFeedView.vue'
</script>

<route lang="json5">
{
  name: 'community:feed',
  meta: { title: '社区' }
}
</route>
