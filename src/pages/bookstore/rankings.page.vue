<template>
  <RankingsView />
</template>

<script setup lang="ts">
import RankingsView from '@/modules/bookstore/views/RankingsView.vue'
</script>

<route lang="json5">
{
  name: 'bookstore:rankings',
  meta: { title: '排行榜' }
}
</route>
