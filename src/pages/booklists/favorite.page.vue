<template>
  <FavoriteBookListsView />
</template>

<script setup lang="ts">
import FavoriteBookListsView from '@/modules/booklist/views/FavoriteBookListsView.vue'
</script>

<route lang="json5">
{
  name: 'booklists:favorite',
  meta: { title: '收藏的书单', requiresAuth: true }
}
</route>
