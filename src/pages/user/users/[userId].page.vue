<template>
  <AuthorProfile :user-id="userId" />
</template>

<script setup lang="ts">
import AuthorProfile from '@/modules/user/views/AuthorProfile.vue'

defineProps<{ userId: string }>()
</script>

<route lang="json5">
{
  name: 'user:author-profile',
  props: true,
  meta: { title: '作者主页' }
}
</route>
