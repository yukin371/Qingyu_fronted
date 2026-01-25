<template>
  <LevelInfoView />
</template>

<script setup lang="ts">
import LevelInfoView from '@/modules/achievement/views/LevelInfoView.vue'
</script>

<route lang="json5">
{
  name: 'achievements:level',
  meta: { title: '等级信息', requiresAuth: true }
}
</route>
