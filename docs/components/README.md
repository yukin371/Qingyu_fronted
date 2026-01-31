# 组件文档

项目组件库使用说明。

## 组件分类

### 通用组件（Common）

无业务逻辑的纯UI组件：

- **Loading** - 加载指示器
- **Empty** - 空状态展示
- **Button** - 按钮组件

### 业务组件（Business）

包含业务逻辑的组件：

- **BannerCarousel** - Banner轮播
- **BookGrid** - 书籍网格
- **BookCard** - 书籍卡片
- **RankingList** - 榜单列表

### 表单组件（Form）

表单相关组件：

- **LoginForm** - 登录表单
- **RegisterForm** - 注册表单
- **ForgotPasswordForm** - 忘记密码表单

## 使用指南

查看 [组件开发指南](../guide/component-guide.md) 了解如何开发和使用组件。

## 组件规范

### Props定义

```javascript
defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  }
})
```

### Events定义

```javascript
const emit = defineEmits(['click', 'change'])
```

### Slots使用

```vue
<template>
  <slot />
  <slot name="footer" :data="data" />
</template>
```

## 组件开发流程

```
需求分析 → API设计 → 编写代码 → 测试 → 文档
```

---

**最后更新**：2025年10月17日
