<template>
  <FollowListView type="followers" :user-id="userId" />
</template>

<script setup lang="ts">
import FollowListView from '@/modules/social/views/FollowListView.vue'

defineProps<{ userId?: string }>()
</script>

<route lang="json5">
{
  name: 'social:followers',
  props: true,
  meta: { title: '粉丝列表', requiresAuth: true }
}
</route>
