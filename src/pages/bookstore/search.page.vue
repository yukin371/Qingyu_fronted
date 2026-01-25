<template>
  <SearchView />
</template>

<script setup lang="ts">
import SearchView from '@/modules/bookstore/views/SearchView.vue'
</script>

<route lang="json5">
{
  name: 'bookstore:search',
  meta: { title: '搜索' }
}
</route>
