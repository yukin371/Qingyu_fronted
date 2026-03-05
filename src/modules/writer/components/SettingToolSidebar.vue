<template>
  <div class="setting-tool-sidebar">
    <div class="sidebar-header">
      <h3>设定工具</h3>
      <p>同一侧栏下切换功能，不打断阅读流</p>
    </div>

    <div class="sidebar-list">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="sidebar-item"
        :class="{ 'is-active': modelValue === item.key }"
        @click="$emit('update:modelValue', item.key)"
      >
        <QyIcon :name="item.icon" :size="16" class="item-icon" />
        <div class="item-body">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-desc">{{ item.desc }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyIcon } from '@/design-system/components'

export type SettingSidebarView = 'relations' | 'encyclopedia'

interface Props {
  modelValue: SettingSidebarView
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: SettingSidebarView]
}>()

const items: Array<{ key: SettingSidebarView; title: string; desc: string; icon: string }> = [
  {
    key: 'relations',
    title: '人物关系图',
    desc: '可平移缩放，查看角色网络',
    icon: 'Share'
  },
  {
    key: 'encyclopedia',
    title: '设定百科卡片',
    desc: '管理角色与地点详情信息',
    icon: 'Collection'
  }
]
</script>

<style scoped lang="scss">
.setting-tool-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #dbe4f0;
}

.sidebar-header {
  padding: 14px 14px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
  }

  p {
    margin: 6px 0 0;
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
  }
}

.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.sidebar-item {
  border: 1px solid #d9e1ee;
  border-radius: 10px;
  background: #fff;
  text-align: left;
  width: 100%;
  padding: 10px 10px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: #94a3b8;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  }

  &.is-active {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.25);
    background: #f0f7ff;

    .item-title {
      color: #1d4ed8;
    }
  }
}

.item-icon {
  color: #475569;
  margin-top: 1px;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.item-desc {
  margin-top: 3px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}
</style>
