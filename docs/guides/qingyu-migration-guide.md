# Qingyu 组件迁移指南

从 Element Plus 迁移到 Qingyu 组件库的完整指南。

## 目录

- [概述](#概述)
- [组件映射](#组件映射)
- [迁移示例](#迁移示例)
- [Props 映射](#props-映射)
- [常见问题](#常见问题)
- [最佳实践](#最佳实践)
- [分步迁移](#分步迁移)

## 概述

Qingyu 组件库是专为 Qingyu 项目设计的青羽风格组件库,采用玻璃拟态设计和青蓝渐变主题。本指南将帮助你从 Element Plus 平滑迁移到 Qingyu 组件库。

### 为什么要迁移?

- 🎨 **统一的设计语言** - 青蓝渐变主题,玻璃拟态效果
- ⚡️ **更好的性能** - 轻量级组件,基于 Tailwind CSS
- 📱 **优秀的移动端体验** - 专为移动端优化
- 🔒 **类型安全** - 完整的 TypeScript 支持
- 🎯 **项目定制** - 专为 Qingyu 项目设计

### 迁移前准备

1. 备份当前代码
2. 确保项目依赖已更新
3. 熟悉 Qingyu 组件库的基本用法
4. 阅读本迁移指南

## 组件映射

### 基础组件

| Element Plus | Qingyu | 迁移难度 | 说明 |
|--------------|--------|----------|------|
| `el-button` | `QyButton` | ⭐ 简单 | Props 名称略有不同 |
| `el-card` | `QyCard` | ⭐ 简单 | Slot 名称不同 |
| `el-input` | `QyInput` | ⭐ 简单 | API 基本一致 |
| `el-badge` | `QyBadge` | ⭐⭐ 中等 | 类型系统不同 |
| `el-avatar` | `QyAvatar` | ⭐⭐ 中等 | 类型系统不同 |

### 导航组件

| Element Plus | Qingyu | 迁移难度 | 说明 |
|--------------|--------|----------|------|
| `el-menu` | `QyTopNav` | ⭐⭐⭐ 复杂 | 设计理念不同 |
| `el-tabs` | `QyTabBar` | ⭐⭐ 中等 | 移动端优化 |
| 无 | `QyBottomDock` | - | 新增组件 |

### 未实现组件

以下 Element Plus 组件尚未在 Qingyu 中实现,可以继续使用:

- `el-table` → 使用基础 `table` 或等待 Qingyu 实现
- `el-select` → 继续使用 `el-select` 或等待 Qingyu 实现
- `el-date-picker` → 继续使用 `el-date-picker` 或等待 Qingyu 实现
- `el-form` → 继续使用 `el-form` 或等待 Qingyu 实现

## 迁移示例

### 1. Button (按钮)

#### Element Plus

```vue
<template>
  <!-- 类型 -->
  <el-button type="primary">主要按钮</el-button>
  <el-button type="success">成功按钮</el-button>
  <el-button type="warning">警告按钮</el-button>
  <el-button type="danger">危险按钮</el-button>
  <el-button type="info">信息按钮</el-button>

  <!-- 尺寸 -->
  <el-button size="small">小按钮</el-button>
  <el-button size="default">默认按钮</el-button>
  <el-button size="large">大按钮</el-button>

  <!-- 状态 -->
  <el-button :loading="loading">加载中</el-button>
  <el-button disabled>禁用</el-button>

  <!-- 图标 -->
  <el-button :icon="Search">搜索</el-button>
  <el-button>
    搜索
    <template #icon>
      <Search />
    </template>
  </el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

const loading = ref(false)
</script>
```

#### Qingyu

```vue
<template>
  <!-- 变体 (variant 替代 type) -->
  <QyButton variant="primary">主要按钮</QyButton>
  <QyButton variant="secondary">次要按钮</QyButton>
  <QyButton variant="primary">成功按钮</QyButton>
  <QyButton variant="danger">危险按钮</QyButton>
  <QyButton variant="ghost">信息按钮</QyButton>

  <!-- 尺寸 -->
  <QyButton size="sm">小按钮</QyButton>
  <QyButton size="md">默认按钮</QyButton>
  <QyButton size="lg">大按钮</QyButton>

  <!-- 状态 -->
  <QyButton :loading="loading">加载中</QyButton>
  <QyButton disabled>禁用</QyButton>

  <!-- 图标 (使用 SVG 字符串) -->
  <QyButton :icon="searchIcon">搜索</QyButton>
  <QyButton :icon="searchIcon" icon-position="right">
    搜索
  </QyButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyButton } from '@/design-system/components'

const loading = ref(false)
const searchIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>')
</script>
```

#### 关键变化

1. **Props 名称**: `type` → `variant`
2. **尺寸值**: `small/default/large` → `sm/md/lg`
3. **图标**: 使用 SVG 字符串而不是组件
4. **变体**: `success/warning/info` → `secondary/primary/ghost`

---

### 2. Card (卡片)

#### Element Plus

```vue
<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>卡片名称</span>
      </div>
    </template>
    <p>卡片内容</p>
  </el-card>

  <!-- 可悬停卡片 -->
  <el-card shadow="hover" @click="handleClick">
    <p>点击我</p>
  </el-card>
</template>
```

#### Qingyu

```vue
<template>
  <!-- 使用 title slot 替代 header -->
  <QyCard>
    <template #title>
      <h2 class="text-xl font-bold">卡片名称</h2>
    </template>
    <p>卡片内容</p>
  </QyCard>

  <!-- 可悬停卡片 (hoverable 替代 shadow="hover") -->
  <QyCard hoverable @click="handleClick">
    <p>点击我</p>
  </QyCard>
</template>

<script setup lang="ts">
import { QyCard } from '@/design-system/components'

const handleClick = () => {
  console.log('卡片被点击')
}
</script>
```

#### 关键变化

1. **Slot 名称**: `header` → `title`
2. **悬停效果**: `shadow="hover"` → `hoverable`
3. **样式**: 自动应用玻璃拟态效果

---

### 3. Input (输入框)

#### Element Plus

```vue
<template>
  <!-- 文本输入 -->
  <el-input v-model="text" placeholder="请输入内容" />

  <!-- 搜索框 -->
  <el-input v-model="search" placeholder="搜索">
    <template #prefix>
      <el-icon><Search /></el-icon>
    </template>
  </el-input>

  <!-- 文本域 -->
  <el-input
    v-model="message"
    type="textarea"
    :rows="4"
    placeholder="请输入消息"
  />

  <!-- 禁用状态 -->
  <el-input v-model="disabledText" disabled />
</template>
```

#### Qingyu

```vue
<template>
  <!-- 文本输入 -->
  <QyInput v-model="text" placeholder="请输入内容" />

  <!-- 搜索框 (使用 type="search") -->
  <QyInput v-model="search" type="search" placeholder="搜索" />

  <!-- 文本域 -->
  <QyInput
    v-model="message"
    type="textarea"
    :rows="4"
    placeholder="请输入消息"
  />

  <!-- 禁用状态 -->
  <QyInput v-model="disabledText" disabled placeholder="禁用的输入框" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyInput } from '@/design-system/components'

const text = ref('')
const search = ref('')
const message = ref('')
const disabledText = ref('')
</script>
```

#### 关键变化

1. **搜索框**: 使用 `type="search"` 而不是 prefix slot
2. **API 基本一致**: `v-model`, `placeholder`, `disabled` 保持不变
3. **样式**: 自动应用青蓝焦点效果

---

### 4. Badge (徽章)

#### Element Plus

```vue
<template>
  <!-- 计数徽章 -->
  <el-badge :value="12" :max="99">
    <el-button>消息</el-button>
  </el-badge>

  <!-- 状态徽章 -->
  <el-tag type="success">成功</el-tag>
  <el-tag type="warning">警告</el-tag>
  <el-tag type="danger">危险</el-tag>

  <!-- 圆点徽章 -->
  <el-badge is-dot>
    <el-button>查询</el-button>
  </el-badge>
</template>
```

#### Qingyu

```vue
<template>
  <!-- 计数徽章 (需要手动定位) -->
  <div class="relative inline-block">
    <QyButton>消息</QyButton>
    <QyBadge type="count" :value="12" :max="99" color="cyan" />
  </div>

  <!-- 状态徽章 (使用 type="status") -->
  <QyBadge type="status" color="green">成功</QyBadge>
  <QyBadge type="status" color="yellow">警告</QyBadge>
  <QyBadge type="status" color="red">危险</QyBadge>

  <!-- 圆点徽章 -->
  <div class="relative inline-block">
    <QyButton>查询</QyButton>
    <QyBadge type="dot" color="cyan" />
  </div>
</template>

<script setup lang="ts">
import { QyBadge, QyButton } from '@/design-system/components'
</script>

<style scoped>
/* 相对定位容器 */
.relative {
  position: relative;
}
</style>
```

#### 关键变化

1. **定位**: 需要手动添加 `relative` 容器
2. **状态徽章**: `el-tag` → `QyBadge type="status"`
3. **颜色**: 使用 `color` 属性而不是 `type`
4. **圆点**: `is-dot` → `type="dot"`

---

### 5. Avatar (头像)

#### Element Plus

```vue
<template>
  <!-- 图片头像 -->
  <el-avatar :src="avatarUrl" />

  <!-- 文本头像 -->
  <el-avatar>张三</el-avatar>

  <!-- 群组头像 -->
  <el-avatar-group :max="3">
    <el-avatar v-for="url in urls" :key="url" :src="url" />
  </el-avatar-group>
</template>
```

#### Qingyu

```vue
<template>
  <!-- 图片头像 (需要指定 type) -->
  <QyAvatar type="image" :src="avatarUrl" size="md" />

  <!-- 文本头像 -->
  <QyAvatar type="text" text="张三" color="cyan" size="md" />

  <!-- 群组头像 -->
  <QyAvatar 
    type="group" 
    :avatars="groupAvatars"
    :max="3"
    size="lg"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyAvatar } from '@/design-system/components'

const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

const groupAvatars = ref([
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4'
])
</script>
```

#### 关键变化

1. **必须指定 type**: `type="image/text/group"`
2. **文本头像**: 使用 `text` 属性而不是默认 slot
3. **群组头像**: 使用 `avatars` 数组而不是嵌套组件
4. **尺寸**: 需要显式指定 `size`

## Props 映射

### Button Props 映射

| Element Plus | Qingyu | 说明 |
|--------------|--------|------|
| `type="primary"` | `variant="primary"` | 主要按钮 |
| `type="success"` | `variant="primary"` | 成功按钮(合并到 primary) |
| `type="warning"` | `variant="primary"` | 警告按钮(合并到 primary) |
| `type="danger"` | `variant="danger"` | 危险按钮 |
| `type="info"` | `variant="ghost"` | 信息按钮 |
| `size="small"` | `size="sm"` | 小尺寸 |
| `size="default"` | `size="md"` | 默认尺寸 |
| `size="large"` | `size="lg"` | 大尺寸 |
| `icon="xxx"` | `:icon="svgString"` | 图标(SVG 字符串) |
| `loading` | `loading` | 加载状态 |
| `disabled` | `disabled` | 禁用状态 |

### Card Props 映射

| Element Plus | Qingyu | 说明 |
|--------------|--------|------|
| `shadow="hover"` | `hoverable` | 可悬停 |
| `shadow="always"` | `:shadow="true"` | 总是显示阴影 |
| `shadow="never"` | `:shadow="false"` | 不显示阴影 |
| `#header` | `#title` | 标题插槽 |
| `#default` | `#default` | 内容插槽 |
| 无 | `#footer` | 页脚插槽(新增) |

### Input Props 映射

| Element Plus | Qingyu | 说明 |
|--------------|--------|------|
| `type="text"` | `type="text"` | 文本输入 |
| 无 | `type="search"` | 搜索框(新增) |
| `type="textarea"` | `type="textarea"` | 多行文本 |
| `placeholder` | `placeholder` | 占位符 |
| `disabled` | `disabled` | 禁用状态 |
| `rows` | `rows` | 行数(textarea) |
| `#prefix` | 无 | 前缀(搜索框用 type="search") |
| `#suffix` | 无 | 后缀 |

### Badge Props 映射

| Element Plus | Qingyu | 说明 |
|--------------|--------|------|
| `:value="12"` | `type="count" :value="12"` | 计数徽章 |
| `:max="99"` | `:max="99"` | 最大值 |
| `is-dot` | `type="dot"` | 圆点徽章 |
| 无 | `type="status"` | 状态徽章(新增) |
| 无 | `color="cyan"` | 颜色(新增) |

### Avatar Props 映射

| Element Plus | Qingyu | 说明 |
|--------------|--------|------|
| `:src="url"` | `type="image" :src="url"` | 图片头像 |
| 默认内容 | `type="text" text="xxx"` | 文本头像 |
| `el-avatar-group` | `type="group"` | 群组头像 |
| `:size="small"` | `size="sm"` | 小尺寸 |
| `:size="default"` | `size="md"` | 默认尺寸 |
| `:size="large"` | `size="lg"` | 大尺寸 |

## 常见问题

### Q1: 如何使用图标?

Element Plus 使用图标组件,Qingyu 使用 SVG 字符串:

```vue
<!-- Element Plus -->
<el-button :icon="Search">搜索</el-button>

<!-- Qingyu -->
<template>
  <QyButton :icon="searchIcon">搜索</QyButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>')
</script>
```

**获取 SVG 图标**:
1. 访问 [Heroicons](https://heroicons.com/) 或其他图标库
2. 选择图标,复制 SVG 代码
3. 移除 `width` 和 `height` 属性
4. 作为字符串使用

### Q2: 样式不生效怎么办?

确保 Tailwind CSS 已正确配置:

```vue
<template>
  <!-- 可以添加自定义类 -->
  <QyButton class="from-purple-600 to-pink-500">
    自定义按钮
  </QyButton>
</template>
```

### Q3: 如何处理未实现的组件?

对于尚未实现的组件,可以继续使用 Element Plus:

```vue
<template>
  <!-- 使用 Qingyu 组件 -->
  <QyButton>确认</QyButton>

  <!-- 继续使用 Element Plus -->
  <el-table :data="tableData">
    <el-table-column prop="name" label="名称" />
  </el-table>
</template>

<script setup lang="ts">
import { QyButton } from '@/design-system/components'
import { ElTable, ElTableColumn } from 'element-plus'
</script>
```

### Q4: 如何处理表单验证?

Qingyu 尚未实现完整的表单组件,可以继续使用 Element Plus 的表单:

```vue
<template>
  <!-- 混合使用 -->
  <el-form :model="form" :rules="rules">
    <el-form-item label="用户名" prop="username">
      <QyInput v-model="form.username" />
    </el-form-item>
    
    <el-form-item label="邮箱" prop="email">
      <QyInput v-model="form.email" type="text" />
    </el-form-item>
  </el-form>
</template>
```

### Q5: 如何处理响应式设计?

Qingyu 组件已经内置响应式设计,无需额外配置:

```vue
<template>
  <!-- QyTopNav 自动适配移动端和桌面端 -->
  <QyTopNav :links="links" />

  <!-- QyBottomDock 自动切换浮动/底部模式 -->
  <QyBottomDock :items="dockItems" />
</template>
```

## 最佳实践

### 1. 渐进式迁移

不要一次性迁移所有组件,按以下顺序进行:

1. **第一阶段**: 迁移基础组件(Button, Card, Input)
2. **第二阶段**: 迁移导航组件(TopNav, TabBar)
3. **第三阶段**: 迁移其他组件(Badge, Avatar)
4. **第四阶段**: 处理未实现的组件

### 2. 保持一致性

在整个项目中使用一致的组件和样式:

```vue
<!-- ✅ 推荐: 使用 Qingyu 组件 -->
<QyButton variant="primary">确认</QyButton>
<QyCard>内容</QyCard>

<!-- ❌ 避免: 混用 Element Plus -->
<el-button type="primary">确认</el-button>
<QyCard>内容</QyCard>
```

### 3. 利用插槽

充分利用 Qingyu 组件的插槽功能:

```vue
<template>
  <QyCard>
    <template #title>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">卡片标题</h2>
        <QyButton size="sm">操作</QyButton>
      </div>
    </template>
    
    <p>卡片内容</p>
    
    <template #footer>
      <div class="flex justify-end space-x-2">
        <QyButton variant="ghost">取消</QyButton>
        <QyButton>确认</QyButton>
      </div>
    </template>
  </QyCard>
</template>
```

### 4. 组合使用组件

组合多个组件创建复杂 UI:

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <QyCard 
      v-for="item in items" 
      :key="item.id"
      hoverable
      @click="handleClick(item)"
    >
      <template #title>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ item.title }}</h3>
          <QyBadge type="status" :color="item.statusColor">
            {{ item.status }}
          </QyBadge>
        </div>
      </template>
      
      <p class="text-gray-600 mb-4">{{ item.description }}</p>
      
      <div class="flex items-center space-x-2">
        <QyAvatar type="image" :src="item.avatar" size="sm" />
        <span class="text-sm">{{ item.author }}</span>
      </div>
    </QyCard>
  </div>
</template>
```

### 5. 处理边缘情况

对于特殊的业务需求,可以扩展 Qingyu 组件:

```vue
<template>
  <!-- 使用自定义类覆盖样式 -->
  <QyButton 
    class="custom-primary-button"
    @click="handleClick"
  >
    自定义按钮
  </QyButton>
</template>

<style scoped>
.custom-primary-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
```

## 分步迁移

### Step 1: 安装和配置

确保 Qingyu 组件库已正确集成:

```bash
# 组件库已存在于 src/design-system 目录
# 无需额外安装
```

### Step 2: 更新导入

将 Element Plus 导入替换为 Qingyu:

```typescript
// 之前
import { ElButton, ElCard } from 'element-plus'

// 之后
import { QyButton, QyCard } from '@/design-system/components'
```

### Step 3: 更新组件标签

```vue
<!-- 之前 -->
<el-button>点击</el-button>
<el-card>内容</el-card>

<!-- 之后 -->
<QyButton>点击</QyButton>
<QyCard>内容</QyCard>
```

### Step 4: 更新 Props

根据 Props 映射表更新属性名称和值:

```vue
<!-- 之前 -->
<el-button type="primary" size="small">确认</el-button>

<!-- 之后 -->
<QyButton variant="primary" size="sm">确认</QyButton>
```

### Step 5: 更新 Slots

根据 Slots 映射更新插槽名称:

```vue
<!-- 之前 -->
<el-card>
  <template #header>标题</template>
  内容
</el-card>

<!-- 之后 -->
<QyCard>
  <template #title>标题</template>
  内容
</QyCard>
```

### Step 6: 测试

1. 功能测试: 确保所有交互正常
2. 视觉测试: 检查样式是否符合预期
3. 响应式测试: 验证移动端和桌面端显示
4. 性能测试: 确认性能有所提升

### Step 7: 清理

删除不再使用的 Element Plus 导入:

```typescript
// 删除这些
import { ElButton, ElCard } from 'element-plus'
```

## 检查清单

完成迁移后,使用以下清单验证:

- [ ] 所有 Element Plus 组件已替换为 Qingyu 组件
- [ ] Props 已正确更新
- [ ] Slots 已正确更新
- [ ] 图标使用 SVG 字符串
- [ ] 样式符合青羽设计规范
- [ ] 响应式设计正常工作
- [ ] 功能测试通过
- [ ] 性能有所提升
- [ ] 代码中无 Element Plus 导入(未实现的组件除外)
- [ ] 文档已更新

## 获取帮助

如果在迁移过程中遇到问题:

1. 查阅 [API 参考](../api/qingyu-components-api.md)
2. 参考 [快速开始](../guides/qingyu-components-quickstart.md)
3. 查看 [设计系统](../design-system/qingyu-design-system.md)
4. 联系技术支持团队

---

**最后更新**: 2026-01-25  
**版本**: v1.0.0  
**状态**: Phase 1 & 2 组件迁移完成
