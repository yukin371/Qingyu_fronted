<template>
  <AchievementRankingView />
</template>

<script setup lang="ts">
import AchievementRankingView from '@/modules/achievement/views/AchievementRankingView.vue'
</script>

<route lang="json5">
{
  name: 'achievements:ranking',
  meta: { title: '成就排行' }
}
</route>
