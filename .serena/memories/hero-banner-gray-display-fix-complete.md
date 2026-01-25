# 主页轮播图灰色显示问题修复报告

## 任务时间
2026-01-25

## 问题描述
主页hero-banner区域显示为完全灰色，没有轮播图展示。

## 根本原因
自定义的Skeleton组件（`src/design-system/base/Skeleton/Skeleton.vue`）**没有实现**：
1. `loading` prop来控制骨架屏/内容切换
2. slot机制来显示实际内容

这导致使用方式：
```vue
<Skeleton :loading="loading">
  <BannerCarousel ... />  <!-- 永远不会渲染！ -->
</Skeleton>
```

BannerCarousel永远不会被渲染，一直显示灰色骨架屏。

## 修复方案
将Skeleton组件替换为v-if/v-else条件渲染。

## 修复的文件
`src/modules/bookstore/views/HomeView.vue`

### 1. 替换Skeleton组件（第49-61行）

**修改前**：
```vue
<Skeleton width="100%" height="400px" :loading="loading" animated variant="image">
  <div class="banner-wrapper">
    <BannerCarousel ... />
  </div>
</Skeleton>
```

**修改后**：
```vue
<!-- Loading state -->
<div v-if="loading" class="banner-skeleton" 
     style="width: 100%; height: 400px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 24px;">
</div>

<!-- Content -->
<div v-else class="banner-wrapper">
  <BannerCarousel :banners="banners" height="420px" indicator-position="none"
    @banner-click="handleBannerClick" class="premium-carousel" />
  <div class="glow-effect"></div>
</div>
```

### 2. 移除Skeleton导入（第194行）

**修改前**：
```javascript
import { Button, Divider, Skeleton, Image } from '@/design-system'
```

**修改后**：
```javascript
import { Button, Divider, Image } from '@/design-system'
```

### 3. 从组件列表中移除Skeleton（第201-210行）

### 4. 添加shimmer动画CSS（第982-985行）

```scss
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## 验证结果

✅ hero-banner区域正常显示
✅ banner-wrapper可见（bannerWrapperVisible: true）
✅ el-carousel轮播组件正确渲染
✅ loading状态完成后显示实际内容
✅ 不会一直卡在灰色骨架屏

## 最终状态
轮播图区域现在会：
- 加载时显示带shimmer动画的灰色骨架屏
- 加载完成后显示BannerCarousel组件
- 正确响应loading状态的变化

如需显示实际轮播图，需要在store中提供banners数据。
