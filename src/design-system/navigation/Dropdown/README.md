# Dropdown 下拉菜单组件

通用的下拉菜单组件，支持多种触发方式和位置。

## 特性

- ✅ 4 种触发方式 (click, hover, focus, contextmenu)
- ✅ 12 个位置选项 (top, bottom, left, right 及其组合)
- ✅ 支持嵌套下拉菜单
- ✅ 可选的箭头指示器
- ✅ 菜单项图标支持
- ✅ 分割线支持
- ✅ 禁用状态
- ✅ 3 种尺寸预设 (small, medium, large)
- ✅ 完整的键盘导航支持
- ✅ 可访问性 (ARIA) 兼容

## 使用方法

### 基础用法

```vue
<script setup>
import Dropdown from '@/design-system/navigation/Dropdown/Dropdown.vue'
import DropdownItem from '@/design-system/navigation/Dropdown/DropdownItem.vue'

const handleCommand = (command) => {
  console.log('Command:', command)
}
</script>

<template>
  <Dropdown @command="handleCommand">
    <template #trigger>
      <button>Click Me</button>
    </template>
    <DropdownItem command="profile">Profile</DropdownItem>
    <DropdownItem command="settings">Settings</DropdownItem>
    <DropdownItem command="logout">Logout</DropdownItem>
  </Dropdown>
</template>
```

### 触发方式

```vue
<template>
  <!-- 点击触发 -->
  <Dropdown trigger="click" @command="handleCommand">
    <template #trigger>
      <button>Click</button>
    </template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <!-- 悬停触发 -->
  <Dropdown trigger="hover" @command="handleCommand">
    <template #trigger>
      <button>Hover</button>
    </template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <!-- 焦点触发 -->
  <Dropdown trigger="focus" @command="handleCommand">
    <template #trigger>
      <button>Focus</button>
    </template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <!-- 右键菜单 -->
  <Dropdown trigger="contextmenu" @command="handleCommand">
    <template #trigger>
      <button>Right Click</button>
    </template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>
</template>
```

### 位置

```vue
<template>
  <Dropdown placement="top" @command="handleCommand">
    <template #trigger><button>Top</button></template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <Dropdown placement="bottom-start" @command="handleCommand">
    <template #trigger><button>Bottom Start</button></template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <Dropdown placement="right" @command="handleCommand">
    <template #trigger><button>Right</button></template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>
</template>
```

### 带图标

```vue
<template>
  <Dropdown @command="handleCommand">
    <template #trigger>
      <button>Menu</button>
    </template>
    <DropdownItem command="profile">
      <template #icon>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </template>
      Profile
    </DropdownItem>
    <DropdownItem command="settings">
      <template #icon>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </template>
      Settings
    </DropdownItem>
  </Dropdown>
</template>
```

### 分割线

```vue
<script setup>
import Dropdown from '@/design-system/navigation/Dropdown/Dropdown.vue'
import DropdownItem from '@/design-system/navigation/Dropdown/DropdownItem.vue'
import DropdownDivider from '@/design-system/navigation/Dropdown/DropdownDivider.vue'
</script>

<template>
  <Dropdown @command="handleCommand">
    <template #trigger>
      <button>Menu</button>
    </template>
    <DropdownItem command="new">New</DropdownItem>
    <DropdownItem command="open">Open</DropdownItem>
    <DropdownItem command="save" divided>Save</DropdownItem>
    <DropdownItem command="print">Print</DropdownItem>
    <DropdownDivider />
    <DropdownItem command="exit">Exit</DropdownItem>
  </Dropdown>
</template>
```

### 禁用状态

```vue
<template>
  <!-- 禁用整个下拉菜单 -->
  <Dropdown :disabled="true" @command="handleCommand">
    <template #trigger>
      <button>Disabled Menu</button>
    </template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <!-- 禁用单个菜单项 -->
  <Dropdown @command="handleCommand">
    <template #trigger>
      <button>Menu</button>
    </template>
    <DropdownItem command="edit">Edit</DropdownItem>
    <DropdownItem command="paste" :disabled="true">Paste (Disabled)</DropdownItem>
  </Dropdown>
</template>
```

### 尺寸

```vue
<template>
  <Dropdown size="small" @command="handleCommand">
    <template #trigger><button>Small</button></template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <Dropdown size="medium" @command="handleCommand">
    <template #trigger><button>Medium</button></template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>

  <Dropdown size="large" @command="handleCommand">
    <template #trigger><button>Large</button></template>
    <DropdownItem command="1">Item 1</DropdownItem>
  </Dropdown>
</template>
```

### 嵌套下拉

```vue
<template>
  <Dropdown @command="handleCommand">
    <template #trigger>
      <button>Menu</button>
    </template>
    <DropdownItem command="file">File</DropdownItem>
    <DropdownItem command="edit">Edit</DropdownItem>
    <DropdownItem command="view">
      <Dropdown placement="right-start" @command="handleCommand">
        <template #trigger>
          <span class="flex items-center">
            View
            <svg class="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </template>
        <DropdownItem command="zoom-in">Zoom In</DropdownItem>
        <DropdownItem command="zoom-out">Zoom Out</DropdownItem>
      </Dropdown>
    </DropdownItem>
  </Dropdown>
</template>
```

### 带箭头

```vue
<template>
  <Dropdown :show-arrow="true" placement="top" @command="handleCommand">
    <template #trigger>
      <button>Top with Arrow</button>
    </template>
    <DropdownItem command="1">Item 1</DropdownItem>
    <DropdownItem command="2">Item 2</DropdownItem>
    <DropdownItem command="3">Item 3</DropdownItem>
  </Dropdown>
</template>
```

### 事件处理

```vue
<script setup>
const handleCommand = (command) => {
  console.log('Command:', command)
  alert(`You clicked: ${command}`)
}

const handleClick = (event) => {
  console.log('Dropdown clicked!', event)
}

const handleVisibleChange = (visible) => {
  console.log('Dropdown visible:', visible)
}
</script>

<template>
  <Dropdown
    @command="handleCommand"
    @click="handleClick"
    @visible-change="handleVisibleChange"
  >
    <template #trigger>
      <button>Events Demo</button>
    </template>
    <DropdownItem command="option1">Option 1</DropdownItem>
    <DropdownItem command="option2">Option 2</DropdownItem>
  </Dropdown>
</template>
```

## API

### Dropdown Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `trigger` | `'click' \| 'hover' \| 'focus' \| 'contextmenu' \| DropdownTrigger[]` | `'click'` | 触发方式 |
| `placement` | `DropdownPlacement` | `'bottom'` | 下拉菜单出现的位置 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `hideOnClick` | `boolean` | `true` | 是否在点击菜单项后隐藏菜单 |
| `triggerClass` | `string` | - | 触发器的自定义类名 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 下拉菜单的尺寸 |
| `maxWidth` | `number` | `240` | 下拉菜单的最大宽度（px） |
| `disableScroll` | `boolean` | `false` | 是否在菜单打开时禁用页面滚动 |
| `showTimeout` | `number` | `150` | 菜单显示的延迟时间（ms，仅对 hover 触发有效） |
| `hideTimeout` | `number` | `150` | 菜单隐藏的延迟时间（ms，仅对 hover 触发有效） |
| `offset` | `number` | `8` | 菜单距离触发器的偏移量（px） |
| `showArrow` | `boolean` | `false` | 是否显示箭头 |
| `class` | `any` | - | 自定义类名 |

### Dropdown Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `command` | `(command: DropdownCommand)` | 点击菜单项时触发 |
| `visible-change` | `(visible: boolean)` | 菜单显示/隐藏时触发 |
| `click` | `(event: MouseEvent)` | 点击触发器时触发 |

### Dropdown Slots

| 插槽 | 说明 |
|------|------|
| `trigger` | 触发器内容 |
| `default` | 下拉菜单内容 |

### DropdownItem Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `command` | `DropdownCommand` | - | 命令值 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `divided` | `boolean` | `false` | 是否显示分割线 |
| `icon` | `string` | - | 图标类名 |
| `class` | `any` | - | 自定义类名 |

### DropdownItem Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `click` | `(event: MouseEvent, command: DropdownCommand)` | 点击事件 |

### DropdownItem Slots

| 插槽 | 说明 |
|------|------|
| `default` | 菜单项内容 |
| `icon` | 图标内容 |

### DropdownDivider Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `class` | `any` | - | 自定义类名 |

### 暴露的方法

| 方法 | 说明 |
|------|------|
| `show()` | 显示下拉菜单 |
| `hide()` | 隐藏下拉菜单 |
| `toggle()` | 切换下拉菜单显示状态 |

## 可访问性

- 支持键盘导航 (`Enter`, `Space`, `Escape`, 方向键)
- 正确的 ARIA 属性 (`aria-haspopup`, `aria-expanded`, `aria-disabled`)
- 禁用状态正确处理
- 焦点管理

## 设计规范

### 尺寸规范

| 尺寸 | 最小宽度 | 字体大小 | 内边距 |
|------|---------|---------|--------|
| small | 120px | 12px | 6px 8px |
| medium | 160px | 14px | 8px 12px |
| large | 200px | 16px | 10px 16px |

### 颜色规范

| 元素 | 背景色 | 文字色 | 悬停色 |
|------|--------|--------|--------|
| 菜单容器 | white | slate-900 | - |
| 菜单项 | transparent | slate-700 | slate-100 |
| 菜单项（禁用） | transparent | slate-400 | - |
| 分割线 | transparent | slate-200 | - |

### 位置选项

- `top` - 上方居中
- `top-start` - 上方左侧
- `top-end` - 上方右侧
- `bottom` - 下方居中
- `bottom-start` - 下方左侧
- `bottom-end` - 下方右侧
- `left` - 左侧居中
- `left-start` - 左侧上方
- `left-end` - 左侧下方
- `right` - 右侧居中
- `right-start` - 右侧上方
- `right-end` - 右侧下方

## 示例

### 用户菜单

```vue
<template>
  <Dropdown @command="handleCommand">
    <template #trigger>
      <div class="flex items-center gap-2 cursor-pointer">
        <img src="/avatar.jpg" class="w-8 h-8 rounded-full" alt="Avatar" />
        <span>John Doe</span>
      </div>
    </template>
    <DropdownItem command="profile">
      <template #icon>
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </template>
      Profile
    </DropdownItem>
    <DropdownItem command="settings">Settings</DropdownItem>
    <DropdownDivider />
    <DropdownItem command="logout">Logout</DropdownItem>
  </Dropdown>
</template>
```

### 操作菜单

```vue
<template>
  <Dropdown trigger="click" @command="handleCommand">
    <template #trigger>
      <button class="p-2 hover:bg-slate-100 rounded">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </template>
    <DropdownItem command="edit">Edit</DropdownItem>
    <DropdownItem command="duplicate">Duplicate</DropdownItem>
    <DropdownItem command="delete" divided>Delete</DropdownItem>
  </Dropdown>
</template>
```
