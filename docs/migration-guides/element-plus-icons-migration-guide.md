# Element Plus 图标迁移指南

## 概述

本文档说明如何将 Element Plus 图标迁移到 Qingyu 自定义图标系统（QyIcon）。

## 迁移原因

1. **减少依赖**：移除对 `@element-plus/icons-vue` 的依赖
2. **统一设计**：使用符合 Qingyu 设计规范的图标
3. **更好的性能**：内联 SVG，无需额外的包体积
4. **类型安全**：完整的 TypeScript 支持

## 迁移前后对比

### 迁移前

```vue
<script setup lang="ts">
import { Search, Plus, Edit } from '@element-plus/icons-vue'
</script>

<template>
  <div>
    <Search :size="16" />
    <Plus />
    <Edit :size="20" />
  </div>
</template>
```

### 迁移后

```vue
<script setup lang="ts">
import { QyIcon } from '@/design-system/components'
</script>

<template>
  <div>
    <QyIcon name="Search" :size="16" />
    <QyIcon name="Plus" />
    <QyIcon name="Edit" :size="20" />
  </div>
</template>
```

## 迁移步骤

### 步骤 1：替换导入语句

**之前：**
```ts
import { Search, Plus, Edit } from '@element-plus/icons-vue'
```

**之后：**
```ts
import { QyIcon } from '@/design-system/components'
```

### 步骤 2：替换图标使用

**之前：**
```vue
<Search :size="16" />
<Plus />
<Edit :size="20" color="red" />
```

**之后：**
```vue
<QyIcon name="Search" :size="16" />
<QyIcon name="Plus" />
<QyIcon name="Edit" :size="20" color="red" />
```

### 步骤 3：删除旧的导入

删除所有 `@element-plus/icons-vue` 相关的导入。

## 常见迁移模式

### 模式 1：简单图标使用

```vue
<!-- 迁移前 -->
<Search />

<!-- 迁移后 -->
<QyIcon name="Search" />
```

### 模式 2：带属性的图标

```vue
<!-- 迁移前 -->
<Star :size="24" color="gold" />

<!-- 迁移后 -->
<QyIcon name="Star" :size="24" color="#FFD700" />
```

### 模式 3：动态图标

```vue
<!-- 迁移前 -->
<component :is="Icons[iconName]" :size="20" />

<!-- 迁移后 -->
<QyIcon :name="iconName" :size="20" />
```

### 模式 4：批量导入

```vue
<!-- 迁移前 -->
<script setup>
import * as Icons from '@element-plus/icons-vue'
</script>

<template>
  <component :is="Icons.Search" />
</template>

<!-- 迁移后 -->
<script setup>
import { QyIcon } from '@/design-system/components'
</script>

<template>
  <QyIcon name="Search" />
</template>
```

### 模式 5：按钮中的图标

```vue
<!-- 迁移前 -->
<el-button :icon="Search">搜索</el-button>

<!-- 迁移后 -->
<el-button>
  <template #icon>
    <QyIcon name="Search" :size="16" />
  </template>
  搜索
</el-button>
```

## 图标名称映射

大多数图标名称保持一致，但有一些需要注意的：

| Element Plus | QyIcon | 说明 |
|-------------|--------|------|
| `Search` | `Search` | 相同 |
| `Plus` | `Plus` | 相同 |
| `Close` | `Close` | 相同 |
| `Star` | `Star` | 相同 |
| `User` | `User` | 相同 |
| `UserFilled` | `UserFilled` | 相同 |
| `View` | `View` | 相同 |
| `Picture` | `Picture` | 相同 |

## 注意事项

### 1. 大小写敏感

QyIcon 的 `name` 属性是大小写敏感的，但会自动处理常见的大小写变体：

```vue
<!-- 这些都可以工作 -->
<QyIcon name="Search" />
<QyIcon name="search" />
<QyIcon name="SEARCH" />
```

### 2. 颜色属性

Element Plus 图标的 `color` 属性直接映射：

```vue
<!-- 迁移前 -->
<Star color="gold" />

<!-- 迁移后 -->
<QyIcon name="Star" color="#FFD700" />
```

### 3. 事件处理

如果图标有点击事件，保持不变：

```vue
<!-- 迁移前 -->
<Search @click="handleSearch" />

<!-- 迁移后 -->
<QyIcon name="Search" @click="handleSearch" />
```

### 4. 类名绑定

`class` 属性保持不变：

```vue
<!-- 迁移前 -->
<Search class="text-red-500" />

<!-- 迁移后 -->
<QyIcon name="Search" class="text-red-500" />
```

## 验证清单

迁移完成后，请检查：

- [ ] 文件中没有 `@element-plus/icons-vue` 的导入
- [ ] 所有图标都使用 `<QyIcon>` 组件
- [ ] 图标名称正确（使用驼峰命名）
- [ ] 没有 TypeScript 错误
- [ ] 图标在页面上正确显示
- [ ] 图标大小和颜色正确

## 常见问题

### Q: 某个图标找不到怎么办？

A: 检查图标名称是否正确。可以在 `src/design-system/assets/icons.ts` 中查看所有可用的图标。

### Q: 如何添加新图标？

A: 在 `src/design-system/assets/icons.ts` 中添加新的 SVG 字符串。

### Q: 图标样式不对怎么办？

A: 检查 `color` 属性和 CSS 类。确保使用正确的颜色值。

### Q: 动态图标怎么处理？

A: 使用 `name` 属性的动态绑定：

```vue
<QyIcon :name="dynamicIconName" />
```

## 批量迁移脚本

如果你需要批量迁移多个文件，可以使用以下搜索和替换模式：

### 搜索模式
```
from '@element-plus/icons-vue'
```

### 替换为
```
from '@/design-system/components'
```

### 然后手动调整
1. 将具体的图标导入改为 `QyIcon`
2. 在模板中将 `<IconName />` 改为 `<QyIcon name="IconName" />`

## 示例文件

查看 `src/views/demo/QyIconDemo.vue` 了解完整的使用示例。

## 支持

如果遇到问题，请查看：
- `src/design-system/components/basic/QyIcon/README.md`
- `src/design-system/assets/icons.ts`
- `src/design-system/utils/icon-mapper.ts`
