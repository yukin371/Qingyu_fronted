# Qingyu 组件库 - 快速开始指南

本指南将帮助您快速上手 Qingyu 组件库,并在项目中使用青羽风格的组件。

## 目录

- [安装](#安装)
- [导入组件](#导入组件)
- [基础使用](#基础使用)
- [主题配置](#主题配置)
- [常见模式](#常见模式)
- [最佳实践](#最佳实践)
- [下一步](#下一步)

## 安装

Qingyu 组件库已集成到项目中,位于 `src/design-system` 目录,无需额外安装。

```bash
# 组件库位置
src/design-system/
├── components/     # 组件源码
├── base/          # 基础组件实现
├── tokens/        # 设计令牌
└── utils/         # 工具函数
```

## 导入组件

### 方式 1: 导入单个组件

```vue
<script setup lang="ts">
import { QyButton } from '@/design-system/components/basic/QyButton'
import { QyCard } from '@/design-system/components/basic/QyCard'
</script>
```

### 方式 2: 导入多个组件

```vue
<script setup lang="ts">
import { QyButton, QyCard, QyInput } from '@/design-system/components'
</script>
```

### 方式 3: 导入类型

```typescript
import type { 
  QyButtonProps, 
  QyCardProps,
  QyInputProps 
} from '@/design-system/components'
```

## 基础使用

### 按钮 (QyButton)

QyButton 提供四种变体和三种尺寸:

```vue
<template>
  <div class="space-x-2">
    <!-- 变体 -->
    <QyButton variant="primary">主要按钮</QyButton>
    <QyButton variant="secondary">次要按钮</QyButton>
    <QyButton variant="danger">危险按钮</QyButton>
    <QyButton variant="ghost">幽灵按钮</QyButton>
    
    <!-- 尺寸 -->
    <QyButton size="sm">小按钮</QyButton>
    <QyButton size="md">中按钮</QyButton>
    <QyButton size="lg">大按钮</QyButton>
    
    <!-- 状态 -->
    <QyButton loading>加载中...</QyButton>
    <QyButton disabled>禁用状态</QyButton>
    
    <!-- 带图标 -->
    <QyButton :icon="homeIcon">返回首页</QyButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyButton } from '@/design-system/components'

const homeIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>')
</script>
```

### 卡片 (QyCard)

QyCard 提供玻璃拟态效果和可选的悬停动画:

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- 基础卡片 -->
    <QyCard>
      <h3 class="text-lg font-semibold">卡片标题</h3>
      <p>这是卡片内容</p>
    </QyCard>
    
    <!-- 带标题和页脚 -->
    <QyCard>
      <template #title>
        <h2 class="text-xl font-bold">卡片标题</h2>
      </template>
      
      <p class="mb-4">这是主要内容</p>
      
      <template #footer>
        <div class="flex justify-between">
          <QyButton variant="ghost">取消</QyButton>
          <QyButton>确认</QyButton>
        </div>
      </template>
    </QyCard>
    
    <!-- 可悬停卡片 -->
    <QyCard hoverable @click="handleClick">
      <h3 class="text-lg font-semibold">点击我</h3>
      <p>这个卡片可以点击</p>
    </QyCard>
    
    <!-- 无阴影卡片 -->
    <QyCard :shadow="false">
      <p>无阴影卡片</p>
    </QyCard>
  </div>
</template>

<script setup lang="ts">
import { QyCard, QyButton } from '@/design-system/components'

const handleClick = () => {
  console.log('卡片被点击')
}
</script>
```

### 输入框 (QyInput)

QyInput 支持文本、搜索和多行输入:

```vue
<template>
  <div class="space-y-4">
    <!-- 文本输入 -->
    <QyInput 
      v-model="text" 
      placeholder="请输入内容..."
      @input="handleInput"
    />
    
    <!-- 搜索框 -->
    <QyInput 
      v-model="searchText"
      type="search"
      placeholder="搜索..."
      @input="handleSearch"
    />
    
    <!-- 多行文本 -->
    <QyInput 
      v-model="message"
      type="textarea"
      :rows="4"
      placeholder="请输入消息..."
    />
    
    <!-- 禁用状态 -->
    <QyInput 
      v-model="disabledText"
      disabled
      placeholder="禁用的输入框"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyInput } from '@/design-system/components'

const text = ref('')
const searchText = ref('')
const message = ref('')
const disabledText = ref('禁用内容')

const handleInput = (value: string) => {
  console.log('输入:', value)
}

const handleSearch = (value: string) => {
  console.log('搜索:', value)
}
</script>
```

### 徽章 (QyBadge)

QyBadge 提供计数、状态和圆点三种类型:

```vue
<template>
  <div class="space-4">
    <!-- 计数徽章 -->
    <div class="relative inline-block">
      <QyButton>消息</QyButton>
      <QyBadge 
        type="count" 
        :value="5" 
        color="cyan"
      />
    </div>
    
    <!-- 大数值 -->
    <div class="relative inline-block">
      <QyButton>通知</QyButton>
      <QyBadge 
        type="count" 
        :value="999" 
        :max="99"
        color="red"
      />
    </div>
    
    <!-- 状态徽章 -->
    <QyBadge type="status" color="green">
      在线
    </QyBadge>
    <QyBadge type="status" color="yellow">
      离开
    </QyBadge>
    <QyBadge type="status" color="red">
      忙碌
    </QyBadge>
    
    <!-- 圆点徽章 -->
    <div class="flex items-center space-x-2">
      <QyBadge type="dot" color="green" />
      <span>服务器正常</span>
    </div>
    
    <!-- 不同尺寸的圆点 -->
    <div class="flex items-center space-x-2">
      <QyBadge type="dot" size="sm" color="blue" />
      <QyBadge type="dot" size="md" color="blue" />
      <QyBadge type="dot" size="lg" color="blue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { QyBadge, QyButton } from '@/design-system/components'
</script>
```

### 头像 (QyAvatar)

QyAvatar 支持图片、文本和群组三种类型:

```vue
<template>
  <div class="space-y-6">
    <!-- 图片头像 -->
    <div class="flex items-center space-x-4">
      <QyAvatar 
        type="image" 
        :src="avatarUrl" 
        size="sm"
      />
      <QyAvatar 
        type="image" 
        :src="avatarUrl" 
        size="md"
      />
      <QyAvatar 
        type="image" 
        :src="avatarUrl" 
        size="lg"
      />
    </div>
    
    <!-- 文本头像 -->
    <div class="flex items-center space-x-4">
      <QyAvatar 
        type="text" 
        text="张三" 
        color="cyan"
        size="md"
      />
      <QyAvatar 
        type="text" 
        text="李四" 
        color="blue"
        size="md"
      />
      <QyAvatar 
        type="text" 
        text="王五" 
        color="purple"
        size="md"
      />
    </div>
    
    <!-- 群组头像 -->
    <QyAvatar 
      type="group" 
      :avatars="groupAvatars"
      :max="3"
      size="lg"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyAvatar } from '@/design-system/components'

const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

const groupAvatars = ref([
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5'
])
</script>
```

## 主题配置

### 使用主题令牌

Qingyu 组件库使用 Tailwind CSS 和自定义主题令牌:

```typescript
// src/design-system/tokens/theme.ts
export const theme = {
  colors: {
    primary: 'cyan-600',
    secondary: 'blue-600',
    // ...
  }
}
```

### 主题切换

组件库支持亮色/暗色主题切换:

```vue
<template>
  <div>
    <ThemeSwitcher />
    <!-- 你的内容 -->
  </div>
</template>

<script setup lang="ts">
import ThemeSwitcher from '@/design-system/other/ThemeSwitcher.vue'
</script>
```

### 自定义颜色

你可以在组件中覆盖默认样式:

```vue
<template>
  <!-- 使用自定义样式类 -->
  <QyButton class="from-purple-600 to-pink-500">
    自定义按钮
  </QyButton>
</template>
```

## 常见模式

### 表单布局

```vue
<template>
  <QyCard>
    <template #title>
      <h2 class="text-xl font-bold">用户信息</h2>
    </template>
    
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">用户名</label>
        <QyInput v-model="form.username" placeholder="请输入用户名" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">邮箱</label>
        <QyInput v-model="form.email" type="text" placeholder="请输入邮箱" />
      </div>
      
      <div>
        <label class="block text-sm font-medium mb-2">个人简介</label>
        <QyInput 
          v-model="form.bio" 
          type="textarea" 
          :rows="4"
          placeholder="请输入个人简介"
        />
      </div>
      
      <div class="flex justify-end space-x-2">
        <QyButton variant="ghost" @click="handleCancel">取消</QyButton>
        <QyButton @click="handleSubmit">提交</QyButton>
      </div>
    </div>
  </QyCard>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { QyCard, QyInput, QyButton } from '@/design-system/components'

const form = reactive({
  username: '',
  email: '',
  bio: ''
})

const handleCancel = () => {
  // 取消逻辑
}

const handleSubmit = () => {
  // 提交逻辑
}
</script>
```

### 卡片网格

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <QyCard 
      v-for="item in items" 
      :key="item.id"
      hoverable
      @click="handleCardClick(item)"
    >
      <template #title>
        <h3 class="text-lg font-semibold">{{ item.title }}</h3>
      </template>
      
      <p class="text-gray-600 mb-4">{{ item.description }}</p>
      
      <div class="flex items-center justify-between">
        <QyBadge type="status" :color="item.statusColor">
          {{ item.status }}
        </QyBadge>
        <QyButton size="sm">查看详情</QyButton>
      </div>
    </QyCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyCard, QyBadge, QyButton } from '@/design-system/components'

const items = ref([
  { id: 1, title: '项目 A', description: '项目描述', status: '进行中', statusColor: 'green' },
  { id: 2, title: '项目 B', description: '项目描述', status: '已完成', statusColor: 'blue' },
  // ...
])

const handleCardClick = (item: any) => {
  console.log('点击卡片:', item)
}
</script>
```

### 操作按钮组

```vue
<template>
  <div class="flex items-center space-x-2">
    <QyButton 
      variant="ghost" 
      :icon="editIcon"
      @click="handleEdit"
    >
      编辑
    </QyButton>
    
    <QyButton 
      variant="ghost" 
      :icon="shareIcon"
      @click="handleShare"
    >
      分享
    </QyButton>
    
    <QyButton 
      variant="danger" 
      :icon="deleteIcon"
      @click="handleDelete"
    >
      删除
    </QyButton>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyButton } from '@/design-system/components'

const editIcon = ref('<svg>...</svg>')
const shareIcon = ref('<svg>...</svg>')
const deleteIcon = ref('<svg>...</svg>')

const handleEdit = () => { /* ... */ }
const handleShare = () => { /* ... */ }
const handleDelete = () => { /* ... */ }
</script>
```

## 最佳实践

### 1. 使用合适的组件尺寸

根据使用场景选择合适的尺寸:

```vue
<!-- 密集布局使用小尺寸 -->
<QyButton size="sm">操作</QyButton>

<!-- 常规使用中等尺寸 -->
<QyButton size="md">确认</QyButton>

<!-- 重要操作使用大尺寸 -->
<QyButton size="lg">提交</QyButton>
```

### 2. 正确使用按钮变体

```vue
<!-- 主要操作 -->
<QyButton variant="primary">确认</QyButton>

<!-- 次要操作 -->
<QyButton variant="secondary">取消</QyButton>

<!-- 危险操作 -->
<QyButton variant="danger">删除</QyButton>

<!-- 低优先级操作 -->
<QyButton variant="ghost">查看详情</QyButton>
```

### 3. 合理使用加载状态

```vue
<template>
  <QyButton 
    :loading="isSubmitting" 
    :disabled="isSubmitting"
    @click="handleSubmit"
  >
    {{ isSubmitting ? '提交中...' : '提交' }}
  </QyButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await submitForm()
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

### 4. 响应式布局

```vue
<template>
  <!-- 移动端单列,平板双列,桌面三列 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <QyCard v-for="item in items" :key="item.id">
      {{ item.content }}
    </QyCard>
  </div>
</template>
```

### 5. 无障碍访问

```vue
<template>
  <!-- 使用语义化标签 -->
  <button 
    class="qy-button"
    aria-label="关闭对话框"
    @click="handleClose"
  >
    <CloseIcon />
  </button>
</template>
```

## 下一步

- 📚 查看 [API 参考](../api/qingyu-components-api.md) 了解完整的组件 API
- 🔄 阅读 [迁移指南](../guides/qingyu-migration-guide.md) 从 Element Plus 迁移
- 🎨 探索 [设计系统](../design-system/qingyu-design-system.md) 了解设计规范
- 💻 查看 [组件示例](../../src/views/demo/QingyuComponentsDemo.vue) 学习更多用法

## 常见问题

### Q: 如何自定义组件样式?

A: 你可以通过传递自定义 class 来覆盖样式:

```vue
<QyButton class="custom-button">自定义按钮</QyButton>

<style scoped>
.custom-button {
  /* 自定义样式 */
}
</style>
```

### Q: 组件支持 SSR 吗?

A: 是的,所有组件都支持服务端渲染。

### Q: 如何报告问题或请求新功能?

A: 请在项目仓库提交 issue 或联系维护团队。

---

**需要帮助?** 查看 [完整文档](../README.md) 或联系技术支持喵~
