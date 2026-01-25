<template>
  <ThemeSettingsView />
</template>

<script setup lang="ts">
import ThemeSettingsView from '@/modules/reader/views/ThemeSettingsView.vue'
</script>

<route lang="json5">
{
  name: 'reading:theme-settings',
  meta: { title: '主题设置', requiresAuth: true }
}
</route>
