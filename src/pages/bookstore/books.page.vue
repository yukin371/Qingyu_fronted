<template>
  <BooksView />
</template>

<script setup lang="ts">
import BooksView from '@/modules/bookstore/views/BooksView.vue'
</script>

<route lang="json5">
{
  name: 'bookstore:books',
  meta: {
    title: '书库',
    requiresAuth: false
  }
}
</route>
