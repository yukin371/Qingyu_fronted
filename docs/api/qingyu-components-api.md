# Qingyu 组件库 - API 参考文档

本文档提供了 Qingyu 组件库所有组件的完整 API 参考。

## 目录

- [基础组件](#基础组件)
  - [QyButton](#qybutton)
  - [QyCard](#qycard)
  - [QyInput](#qyinput)
  - [QyBadge](#qybadge)
  - [QyAvatar](#qyavatar)
- [导航组件](#导航组件)
  - [QyTopNav](#qytopnav)
  - [QyBottomDock](#qybottomdock)
  - [QyTabBar](#qytabbar)

## 基础组件

### QyButton

按钮组件,支持多种变体、尺寸和状态。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | 按钮变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `loading` | `boolean` | `false` | 加载状态(显示旋转图标并禁用按钮) |
| `icon` | `string` | `undefined` | SVG 图标字符串 |
| `iconPosition` | `'left' \| 'right'` | `'left'` | 图标位置 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `MouseEvent` | 按钮被点击时触发 |

#### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 按钮内容 |

#### TypeScript 类型

```typescript
import type { QyButtonProps, QyButtonEmits } from '@/design-system/components'

type QyButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type QyButtonSize = 'sm' | 'md' | 'lg'

interface QyButtonProps {
  variant?: QyButtonVariant
  size?: QyButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
}

interface QyButtonEmits {
  (e: 'click', event: MouseEvent): void
}
```

#### 使用示例

```vue
<template>
  <!-- 基础用法 -->
  <QyButton>点击我</QyButton>

  <!-- 不同变体 -->
  <QyButton variant="primary">主要</QyButton>
  <QyButton variant="secondary">次要</QyButton>
  <QyButton variant="danger">危险</QyButton>
  <QyButton variant="ghost">幽灵</QyButton>

  <!-- 不同尺寸 -->
  <QyButton size="sm">小</QyButton>
  <QyButton size="md">中</QyButton>
  <QyButton size="lg">大</QyButton>

  <!-- 加载状态 -->
  <QyButton loading>加载中...</QyButton>

  <!-- 带图标 -->
  <QyButton :icon="homeIcon">首页</QyButton>

  <!-- 禁用状态 -->
  <QyButton disabled>禁用</QyButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyButton } from '@/design-system/components'

const homeIcon = ref('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>')
</script>
```

---

### QyCard

卡片组件,采用玻璃拟态设计,支持悬停效果。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hoverable` | `boolean` | `false` | 是否可悬停(启用上浮效果和点击) |
| `shadow` | `boolean` | `true` | 是否显示阴影 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `MouseEvent` | 卡片被点击时触发(仅在 hoverable=true 时) |

#### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 卡片主要内容 |
| `title` | 卡片标题 |
| `footer` | 卡片页脚 |

#### TypeScript 类型

```typescript
import type { QyCardProps, QyCardEmits, QyCardSlots } from '@/design-system/components'

interface QyCardProps {
  hoverable?: boolean
  shadow?: boolean
}

interface QyCardEmits {
  (e: 'click', event: MouseEvent): void
}

interface QyCardSlots {
  default?: () => any
  title?: () => any
  footer?: () => any
}
```

#### 使用示例

```vue
<template>
  <!-- 基础卡片 -->
  <QyCard>
    <p>卡片内容</p>
  </QyCard>

  <!-- 带标题和页脚 -->
  <QyCard>
    <template #title>
      <h2 class="text-xl font-bold">标题</h2>
    </template>
    <p>内容</p>
    <template #footer>
      <QyButton>操作</QyButton>
    </template>
  </QyCard>

  <!-- 可悬停卡片 -->
  <QyCard hoverable @click="handleClick">
    <p>点击我</p>
  </QyCard>

  <!-- 无阴影 -->
  <QyCard :shadow="false">
    <p>无阴影卡片</p>
  </QyCard>
</template>
```

---

### QyInput

输入框组件,支持文本、搜索和多行输入。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'text' \| 'search' \| 'textarea'` | `'text'` | 输入框类型 |
| `placeholder` | `string` | `''` | 占位符文本 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `modelValue` | `string` | `''` | 输入值(v-model) |
| `rows` | `number` | `3` | 多行文本的行数(仅 textarea 类型) |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `string` | 更新输入值(v-model) |
| `input` | `string` | 输入事件 |
| `focus` | `FocusEvent` | 获得焦点时触发 |
| `blur` | `FocusEvent` | 失去焦点时触发 |

#### TypeScript 类型

```typescript
import type { QyInputProps, QyInputEmits } from '@/design-system/components'

type QyInputType = 'text' | 'search' | 'textarea'

interface QyInputProps {
  type?: QyInputType
  placeholder?: string
  disabled?: boolean
  modelValue?: string
  rows?: number
}

interface QyInputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}
```

#### 使用示例

```vue
<template>
  <!-- 文本输入 -->
  <QyInput v-model="text" placeholder="请输入..." />

  <!-- 搜索框 -->
  <QyInput v-model="search" type="search" placeholder="搜索..." />

  <!-- 多行文本 -->
  <QyInput v-model="message" type="textarea" :rows="4" placeholder="请输入消息..." />

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

---

### QyBadge

徽章组件,支持计数、状态和圆点三种类型。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'count' \| 'status' \| 'dot'` | `'count'` | 徽章类型 |
| `color` | `'cyan' \| 'blue' \| 'green' \| 'red' \| 'yellow'` | `'cyan'` | 徽章颜色 |
| `value` | `number` | `0` | 徽章数值(count 类型) |
| `max` | `number` | `99` | 最大显示值(count 类型,超出显示 99+) |
| `text` | `string` | `''` | 徽章文本(status 类型) |
| `dotSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | 圆点大小(dot 类型) |

#### Slots

| 插槽 | 说明 |
|------|------|
| `default` | 徽章内容(仅 status 类型) |

#### TypeScript 类型

```typescript
import type { QyBadgeProps } from '@/design-system/components'

type QyBadgeType = 'count' | 'status' | 'dot'
type QyBadgeColor = 'cyan' | 'blue' | 'green' | 'red' | 'yellow'

interface QyBadgeProps {
  type?: QyBadgeType
  color?: QyBadgeColor
  value?: number
  max?: number
  text?: string
  dotSize?: 'sm' | 'md' | 'lg'
}
```

#### 使用示例

```vue
<template>
  <!-- 计数徽章 -->
  <div class="relative inline-block">
    <QyButton>消息</QyButton>
    <QyBadge type="count" :value="5" color="cyan" />
  </div>

  <!-- 大数值 -->
  <div class="relative inline-block">
    <QyButton>通知</QyButton>
    <QyBadge type="count" :value="999" :max="99" color="red" />
  </div>

  <!-- 状态徽章 -->
  <QyBadge type="status" color="green">在线</QyBadge>
  <QyBadge type="status" color="yellow">离开</QyBadge>
  <QyBadge type="status" color="red">忙碌</QyBadge>

  <!-- 圆点徽章 -->
  <div class="flex items-center space-x-2">
    <QyBadge type="dot" color="green" />
    <span>服务器正常</span>
  </div>

  <!-- 不同尺寸的圆点 -->
  <QyBadge type="dot" size="sm" color="blue" />
  <QyBadge type="dot" size="md" color="blue" />
  <QyBadge type="dot" size="lg" color="blue" />
</template>
```

---

### QyAvatar

头像组件,支持图片、文本和群组三种类型。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'image' \| 'text' \| 'group'` | `'image'` | 头像类型 |
| `src` | `string` | `''` | 图片 URL(image 类型) |
| `text` | `string` | `''` | 头像文本(text 类型) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 头像尺寸 |
| `alt` | `string` | `'Avatar'` | 图片替代文本 |
| `color` | `'cyan' \| 'blue' \| 'green' \| 'red' \| 'yellow' \| 'purple' \| 'pink'` | `'cyan'` | 背景颜色(text 类型) |
| `avatars` | `Array<{ src?: string; text?: string; alt?: string }>` | `[]` | 群组头像数组(group 类型) |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `MouseEvent` | 头像被点击时触发 |

#### TypeScript 类型

```typescript
import type { QyAvatarProps, QyAvatarEmits } from '@/design-system/components'

type QyAvatarType = 'image' | 'text' | 'group'
type QyAvatarSize = 'sm' | 'md' | 'lg'

interface QyAvatarProps {
  type?: QyAvatarType
  src?: string
  text?: string
  size?: QyAvatarSize
  alt?: string
  color?: 'cyan' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink'
  avatars?: Array<{ src?: string; text?: string; alt?: string }>
}

interface QyAvatarEmits {
  (e: 'click', event: MouseEvent): void
}
```

#### 使用示例

```vue
<template>
  <!-- 图片头像 -->
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

  <!-- 不同尺寸 -->
  <QyAvatar type="text" text="小" size="sm" />
  <QyAvatar type="text" text="中" size="md" />
  <QyAvatar type="text" text="大" size="lg" />
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

---

## 导航组件

### QyTopNav

顶部导航栏组件,支持响应式设计。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `logo` | `string` | `''` | Logo 文本或图片 URL |
| `links` | `QyTopNavLink[]` | `[]` | 导航链接数组 |
| `userMenu` | `QyTopNavUserMenuItem[]` | `[]` | 用户菜单项(仅 PC) |
| `avatarUrl` | `string` | `''` | 头像 URL |
| `fixed` | `boolean` | `true` | 是否固定定位 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `link-click` | `QyTopNavLink` | 导航链接被点击时触发 |
| `user-menu-click` | `QyTopNavUserMenuItem` | 用户菜单项被点击时触发 |
| `avatar-click` | - | 头像被点击时触发 |

#### Slots

| 插槽 | 说明 |
|------|------|
| `logo` | 自定义 Logo |
| `default` | 自定义导航链接 |
| `actions` | 自定义操作区 |

#### TypeScript 类型

```typescript
import type { QyTopNavProps, QyTopNavEmits } from '@/design-system/components'

interface QyTopNavLink {
  label: string
  path: string
  active?: boolean
}

interface QyTopNavUserMenuItem {
  label: string
  action: string
  icon?: string
}

interface QyTopNavProps {
  logo?: string
  links?: QyTopNavLink[]
  userMenu?: QyTopNavUserMenuItem[]
  avatarUrl?: string
  fixed?: boolean
}

interface QyTopNavEmits {
  (e: 'link-click', link: QyTopNavLink): void
  (e: 'user-menu-click', item: QyTopNavUserMenuItem): void
  (e: 'avatar-click'): void
}
```

#### 使用示例

```vue
<template>
  <QyTopNav
    :links="links"
    :avatar-url="avatarUrl"
    @link-click="handleLinkClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyTopNav } from '@/design-system/components'
import type { QyTopNavLink } from '@/design-system/components'

const links = ref<QyTopNavLink[]>([
  { label: '首页', path: '/', active: true },
  { label: '书架', path: '/bookshelf' },
  { label: '发现', path: '/discover' }
])

const avatarUrl = ref('https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')

const handleLinkClick = (link: QyTopNavLink) => {
  console.log('导航到:', link.path)
}
</script>
```

---

### QyBottomDock

底部 Dock 导航组件,支持浮动和底部两种位置模式。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `QyBottomDockItem[]` | `[]` | Dock 项数组(必需) |
| `position` | `'bottom' \| 'floating'` | `'floating'` | 位置模式 |
| `showLabels` | `boolean` | `true` | 是否显示标签(移动端) |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `item-click` | `QyBottomDockItem, index` | Dock 项被点击时触发 |

#### TypeScript 类型

```typescript
import type { QyBottomDockProps, QyBottomDockEmits } from '@/design-system/components'

type QyBottomDockPosition = 'bottom' | 'floating'

interface QyBottomDockItem {
  icon: string
  label: string
  active?: boolean
  highlight?: boolean
  badge?: number
  disabled?: boolean
}

interface QyBottomDockProps {
  items: QyBottomDockItem[]
  position?: QyBottomDockPosition
  showLabels?: boolean
}

interface QyBottomDockEmits {
  (e: 'item-click', item: QyBottomDockItem, index: number): void
}
```

#### 使用示例

```vue
<template>
  <QyBottomDock
    :items="dockItems"
    position="floating"
    @item-click="handleDockClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyBottomDock } from '@/design-system/components'
import type { QyBottomDockItem } from '@/design-system/components'

const dockItems = ref<QyBottomDockItem[]>([
  {
    icon: '<svg>...</svg>',
    label: '首页',
    active: true
  },
  {
    icon: '<svg>...</svg>',
    label: '发现',
    highlight: true,
    badge: 5
  },
  {
    icon: '<svg>...</svg>',
    label: '我的'
  }
])

const handleDockClick = (item: QyBottomDockItem, index: number) => {
  console.log('点击:', item.label, index)
}
</script>
```

---

### QyTabBar

标签栏组件,支持 v-model 双向绑定,优化移动端体验。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabs` | `QyTabBarTab[]` | `[]` | 标签数组(必需) |
| `modelValue` | `string` | - | 当前激活标签的 key(v-model,必需) |
| `position` | `'bottom' \| 'top'` | `'bottom'` | 位置 |
| `showIcons` | `boolean` | `true` | 是否显示图标 |
| `showLabels` | `boolean` | `true` | 是否显示标签 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `string` | 更新当前激活标签(v-model) |
| `tab-click` | `QyTabBarTab, index` | 标签被点击时触发 |
| `tab-change` | `QyTabBarTab, index` | 标签切换时触发 |

#### TypeScript 类型

```typescript
import type { QyTabBarProps, QyTabBarEmits } from '@/design-system/components'

type QyTabBarPosition = 'bottom' | 'top'

interface QyTabBarTab {
  key: string
  label: string
  icon?: string
  badge?: number
  disabled?: boolean
}

interface QyTabBarProps {
  tabs: QyTabBarTab[]
  modelValue: string
  position?: QyTabBarPosition
  showIcons?: boolean
  showLabels?: boolean
}

interface QyTabBarEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'tab-click', tab: QyTabBarTab, index: number): void
  (e: 'tab-change', tab: QyTabBarTab, index: number): void
}
```

#### 使用示例

```vue
<template>
  <QyTabBar
    v-model="activeTab"
    :tabs="tabs"
    @tab-change="handleTabChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QyTabBar } from '@/design-system/components'
import type { QyTabBarTab } from '@/design-system/components'

const activeTab = ref('home')

const tabs = ref<QyTabBarTab[]>([
  { key: 'home', label: '首页', icon: '<svg>...</svg>' },
  { key: 'books', label: '书籍', icon: '<svg>...</svg>', badge: 3 },
  { key: 'profile', label: '我的', icon: '<svg>...</svg>' }
])

const handleTabChange = (tab: QyTabBarTab, index: number) => {
  console.log('切换到:', tab.label)
}
</script>
```

---

## 通用类型定义

### 导入所有类型

```typescript
// 导入所有组件类型
import type {
  QyButtonProps,
  QyCardProps,
  QyInputProps,
  QyBadgeProps,
  QyAvatarProps,
  QyTopNavProps,
  QyBottomDockProps,
  QyTabBarProps
} from '@/design-system/components'
```

### 导入特定类型

```typescript
// 按钮类型
import type { QyButtonVariant, QyButtonSize } from '@/design-system/components'

// 徽章类型
import type { QyBadgeType, QyBadgeColor } from '@/design-system/components'

// 导航类型
import type { QyTopNavLink, QyBottomDockItem, QyTabBarTab } from '@/design-system/components'
```

---

## 更多资源

- 📖 [快速开始](../guides/qingyu-components-quickstart.md)
- 🔄 [迁移指南](../guides/qingyu-migration-guide.md)
- 🎨 [设计系统](../design-system/qingyu-design-system.md)
- 💻 [组件示例](../../src/views/demo/QingyuComponentsDemo.vue)

---

**最后更新**: 2026-01-25  
**版本**: v1.0.0
