<template>
  <HomeView />
</template>

<script setup lang="ts">
import HomeView from '@/modules/bookstore/views/HomeView.vue'
</script>

<route lang="json5">
{
  name: 'bookstore:home',
  meta: {
    title: '首页',
    requiresAuth: false,
    layout: 'main'
  }
}
</route>
