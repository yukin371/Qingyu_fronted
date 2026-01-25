<template>
  <FollowListView type="following" :user-id="userId" />
</template>

<script setup lang="ts">
import FollowListView from '@/modules/social/views/FollowListView.vue'

defineProps<{ userId?: string }>()
</script>

<route lang="json5">
{
  name: 'social:following',
  props: true,
  meta: { title: '关注列表', requiresAuth: true }
}
</route>
