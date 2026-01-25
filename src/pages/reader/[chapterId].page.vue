<template>
  <ReaderView :chapter-id="chapterId" />
</template>

<script setup lang="ts">
import ReaderView from '@/modules/reader/views/ReaderView.vue'

defineProps<{ chapterId: string }>()
</script>

<route lang="json5">
{
  name: 'reader:chapter',
  props: true,
  meta: { title: '阅读器' }
}
</route>
