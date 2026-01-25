<template>
  <CategoriesView />
</template>

<script setup lang="ts">
import CategoriesView from '@/modules/bookstore/views/CategoriesView.vue'
</script>

<route lang="json5">
{
  name: 'bookstore:categories',
  meta: { title: '分类' }
}
</route>
