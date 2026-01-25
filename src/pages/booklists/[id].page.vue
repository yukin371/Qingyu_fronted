<template>
  <BookListDetailView :id="id" />
</template>

<script setup lang="ts">
import BookListDetailView from '@/modules/booklist/views/BookListDetailView.vue'

defineProps<{ id: string }>()
</script>

<route lang="json5">
{
  name: 'booklists:detail',
  props: true,
  meta: { title: '书单详情' }
}
</route>
