<template>
  <DiscoveryView />
</template>

<script setup lang="ts">
import DiscoveryView from '@/modules/discovery/views/DiscoveryView.vue'
</script>

<route lang="json5">
{
  name: 'discovery:home',
  meta: { title: '发现' }
}
</route>
