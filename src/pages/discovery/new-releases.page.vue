<template>
  <NewReleasesView />
</template>

<script setup lang="ts">
import NewReleasesView from '@/modules/discovery/views/NewReleasesView.vue'
</script>

<route lang="json5">
{
  name: 'discovery:new-releases',
  meta: { title: '新书抢先' }
}
</route>
