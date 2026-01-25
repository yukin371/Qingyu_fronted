<template>
  <FollowListView type="mutual" :user-id="userId" />
</template>

<script setup lang="ts">
import FollowListView from '@/modules/social/views/FollowListView.vue'

defineProps<{ userId?: string }>()
</script>

<route lang="json5">
{
  name: 'social:mutual',
  props: true,
  meta: { title: '互关列表', requiresAuth: true }
}
</route>
