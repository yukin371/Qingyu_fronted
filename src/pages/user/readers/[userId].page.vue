<template>
  <ReaderProfile :user-id="userId" />
</template>

<script setup lang="ts">
import ReaderProfile from '@/modules/user/views/ReaderProfile.vue'

defineProps<{ userId: string }>()
</script>

<route lang="json5">
{
  name: 'user:reader-profile',
  props: true,
  meta: { title: '读者主页' }
}
</route>
