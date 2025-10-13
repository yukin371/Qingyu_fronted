# 通用组件使用文档

> **创建日期**: 2025-10-12  
> **组件版本**: v1.0  
> **状态**: ✅ 已完成

---

## 📋 组件概览

本目录包含项目的通用组件，这些组件可以在整个应用中复用，提供一致的用户体验。

| 组件名 | 描述 | 文件 | 状态 |
|--------|------|------|------|
| **Loading** | 加载状态组件 | `Loading.vue` | ✅ 已完成 |
| **Empty** | 空状态组件 | `Empty.vue` | ✅ 已完成 |

---

## 🔄 Loading 组件

### 功能说明

Loading组件用于显示加载状态，支持全屏加载、局部加载和骨架屏三种模式。

### 使用示例

#### 1. 基础用法（局部加载）

```vue
<template>
  <div>
    <Loading :visible="loading" text="正在加载..." />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Loading from '@/components/common/Loading.vue'

const loading = ref(true)

// 模拟加载完成
setTimeout(() => {
  loading.value = false
}, 2000)
</script>
```

#### 2. 全屏加载

```vue
<template>
  <Loading 
    :visible="loading" 
    fullscreen 
    text="加载中，请稍候..." 
    :size="50"
  />
</template>

<script setup>
import { ref } from 'vue'
import Loading from '@/components/common/Loading.vue'

const loading = ref(true)
</script>
```

#### 3. 骨架屏模式

```vue
<template>
  <Loading 
    :visible="loading" 
    skeleton 
    :skeleton-rows="5"
  />
</template>

<script setup>
import { ref } from 'vue'
import Loading from '@/components/common/Loading.vue'

const loading = ref(true)
</script>
```

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | Boolean | `true` | 是否显示加载状态 |
| `fullscreen` | Boolean | `false` | 是否全屏显示 |
| `text` | String | `'加载中...'` | 加载提示文本 |
| `size` | Number | `40` | 图标大小（px） |
| `skeleton` | Boolean | `false` | 是否使用骨架屏模式 |
| `skeletonRows` | Number | `5` | 骨架屏行数 |

### 特性

- ✨ 支持全屏和局部两种模式
- ✨ 支持骨架屏加载效果
- ✨ 可自定义加载文本和图标大小
- ✨ 响应式设计，适配移动端
- ✨ 支持深色模式

---

## 📦 Empty 组件

### 功能说明

Empty组件用于显示空状态，提供多种预设类型和自定义选项。

### 使用示例

#### 1. 基础用法

```vue
<template>
  <Empty 
    type="default" 
    title="暂无内容" 
    description="还没有任何内容哦"
  />
</template>

<script setup>
import Empty from '@/components/common/Empty.vue'
</script>
```

#### 2. 搜索无结果

```vue
<template>
  <Empty 
    type="search" 
    :show-action="true"
    action-text="清除搜索"
    @action="handleClearSearch"
  />
</template>

<script setup>
import Empty from '@/components/common/Empty.vue'

const handleClearSearch = () => {
  console.log('清除搜索')
}
</script>
```

#### 3. 无数据状态

```vue
<template>
  <Empty 
    type="data" 
    title="暂无数据"
    description="目前还没有任何数据"
    :show-action="true"
    action-text="刷新数据"
    @action="refreshData"
  />
</template>

<script setup>
import Empty from '@/components/common/Empty.vue'

const refreshData = () => {
  console.log('刷新数据')
}
</script>
```

#### 4. 错误状态

```vue
<template>
  <Empty 
    type="error" 
    title="加载失败"
    description="数据加载出错，请稍后重试"
    :show-action="true"
    action-text="重新加载"
    @action="reload"
  />
</template>

<script setup>
import Empty from '@/components/common/Empty.vue'

const reload = () => {
  window.location.reload()
}
</script>
```

#### 5. 自定义插槽

```vue
<template>
  <Empty type="folder">
    <template #default>
      <el-button type="primary">上传文件</el-button>
    </template>
  </Empty>
</template>

<script setup>
import Empty from '@/components/common/Empty.vue'
</script>
```

### Props

| 参数 | 类型 | 默认值 | 可选值 | 说明 |
|------|------|--------|--------|------|
| `type` | String | `'default'` | `default`, `search`, `data`, `folder`, `error` | 空状态类型 |
| `title` | String | 根据type自动生成 | - | 标题文本 |
| `description` | String | 根据type自动生成 | - | 描述文本 |
| `iconSize` | Number | `80` | - | 图标大小（px） |
| `showAction` | Boolean | `false` | - | 是否显示操作按钮 |
| `actionText` | String | `'返回首页'` | - | 操作按钮文本 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `action` | - | 点击操作按钮时触发 |

### Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 自定义内容区域 |

### 类型说明

| 类型 | 图标 | 默认标题 | 默认描述 | 适用场景 |
|------|------|----------|----------|----------|
| `default` | Box | 暂无内容 | - | 通用空状态 |
| `search` | Search | 没有找到相关内容 | 换个关键词试试吧 | 搜索无结果 |
| `data` | Document | 暂无数据 | 暂时还没有数据哦 | 数据为空 |
| `folder` | FolderOpened | 文件夹为空 | 还没有上传任何文件 | 文件夹空 |
| `error` | WarnTriangleFilled | 出错了 | 请稍后再试 | 错误状态 |

### 特性

- ✨ 5种预设类型，覆盖常见场景
- ✨ 支持自定义标题、描述和图标大小
- ✨ 可选的操作按钮
- ✨ 支持自定义插槽
- ✨ 响应式设计，适配移动端
- ✨ 支持深色模式

---

## 🎨 样式定制

### 全局样式变量

可以在项目的全局样式文件中覆盖组件的默认样式：

```css
/* 自定义Loading颜色 */
.loading-icon {
  color: #your-color !important;
}

/* 自定义Empty图标颜色 */
.empty-icon {
  color: #your-color !important;
}
```

### 深色模式

组件自动适配深色模式，会根据系统设置自动切换样式。

---

## 📝 实践建议

### Loading组件

1. **API请求**: 在发起请求时显示，请求完成后隐藏
2. **页面加载**: 使用全屏模式显示整页加载
3. **数据加载**: 使用骨架屏提升用户体验
4. **按钮操作**: 在按钮内显示小型加载动画

### Empty组件

1. **列表为空**: 使用`data`类型显示无数据状态
2. **搜索无结果**: 使用`search`类型，提供清除操作
3. **错误处理**: 使用`error`类型，提供重试操作
4. **文件管理**: 使用`folder`类型，提供上传操作

---

## 🔧 完整示例

### 数据列表页面

```vue
<template>
  <div class="list-page">
    <!-- 加载中 -->
    <Loading v-if="loading" skeleton :skeleton-rows="6" />
    
    <!-- 数据列表 -->
    <div v-else-if="list.length > 0" class="list-container">
      <div v-for="item in list" :key="item.id" class="list-item">
        {{ item.name }}
      </div>
    </div>
    
    <!-- 空状态 -->
    <Empty 
      v-else 
      type="data"
      :show-action="true"
      action-text="刷新数据"
      @action="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

const loading = ref(true)
const list = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    // 模拟API请求
    const response = await fetch('/api/data')
    list.value = await response.json()
  } catch (error) {
    console.error('获取数据失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
```

### 搜索页面

```vue
<template>
  <div class="search-page">
    <el-input 
      v-model="keyword" 
      placeholder="请输入搜索关键词"
      @keyup.enter="handleSearch"
    />
    
    <Loading v-if="searching" text="搜索中..." />
    
    <div v-else-if="results.length > 0" class="search-results">
      <div v-for="item in results" :key="item.id">
        {{ item.title }}
      </div>
    </div>
    
    <Empty 
      v-else-if="keyword"
      type="search"
      :show-action="true"
      action-text="清除搜索"
      @action="clearSearch"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

const keyword = ref('')
const searching = ref(false)
const results = ref([])

const handleSearch = async () => {
  if (!keyword.value) return
  
  searching.value = true
  try {
    // 搜索逻辑
    const response = await fetch(`/api/search?q=${keyword.value}`)
    results.value = await response.json()
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  keyword.value = ''
  results.value = []
}
</script>
```

---

## 🐛 常见问题

### Q: Loading组件全屏模式不工作？

A: 确保没有其他元素的z-index高于9999，或者检查父元素是否设置了`overflow: hidden`。

### Q: Empty组件图标不显示？

A: 确认已经正确引入Element Plus Icons，并在main.js中注册。

### Q: 如何自定义Empty组件的图标？

A: 目前支持5种预设类型。如需完全自定义，可以使用插槽：

```vue
<Empty>
  <template #default>
    <el-icon :size="80"><YourIcon /></el-icon>
    <p>自定义内容</p>
  </template>
</Empty>
```

---

## 📚 相关资源

- [Element Plus 文档](https://element-plus.org/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus Icons](https://element-plus.org/zh-CN/component/icon.html)

---

**文档版本**: v1.0  
**最后更新**: 2025年10月12日  
**维护者**: 青羽开发团队







