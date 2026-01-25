<template>
  <RevenueView :book-id="bookId" />
</template>

<script setup lang="ts">
import RevenueView from '@/modules/writer/views/RevenueView.vue'

defineProps<{ bookId?: string }>()
</script>

<route lang="json5">
{
  name: 'writer:revenue',
  props: true,
  meta: { title: '稿费收入', layout: 'writer', requiresAuth: true, roles: ['writer', 'admin'] }
}
</route>
