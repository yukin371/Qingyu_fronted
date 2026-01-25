<template>
  <AchievementsView />
</template>

<script setup lang="ts">
import AchievementsView from '@/modules/achievement/views/AchievementsView.vue'
</script>

<route lang="json5">
{
  name: 'achievements:list',
  meta: { title: '成就', requiresAuth: true }
}
</route>
