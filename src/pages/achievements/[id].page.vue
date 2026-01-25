<template>
  <AchievementDetailView :id="id" />
</template>

<script setup lang="ts">
import AchievementDetailView from '@/modules/achievement/views/AchievementDetailView.vue'

defineProps<{ id: string }>()
</script>

<route lang="json5">
{
  name: 'achievements:detail',
  props: true,
  meta: { title: '成就详情' }
}
</route>
