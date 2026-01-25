<template>
  <ProfileView />
</template>

<script setup lang="ts">
import ProfileView from '@/modules/user/views/ProfileView.vue'
</script>

<route lang="json5">
{
  name: 'user:profile',
  meta: { title: '个人中心', requiresAuth: true }
}
</route>
