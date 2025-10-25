# 批量导入修复总结

## 策略

由于有大量文件需要更新导入路径，采用渐进式修复策略：

### 阶段 1: 修复已迁移的组件和 Store (当前)
1. ✅ Bookstore 组件: BannerCarousel, RankingList, BookGrid → `@bookstore/components/`
2. ✅ Reader 组件: RatingSection, CommentItem → `@reader/components/`
3. ✅ Admin 组件: StatCard, ChartCard, ReviewCard → `@admin/components/`
4. ✅ Bookstore Store: `@/stores/bookstore` → `@bookstore/stores/bookstore.store`

### 阶段 2: 保留旧路径（暂不修复）
以下路径保持不变，等新架构稳定后再迁移：
- `@/stores/auth` - 认证 store
- `@/stores/reader` - 阅读器 store  
- `@/stores/user` - 用户 store
- `@/api/reading/*` - 阅读相关 API
- `@/api/shared/*` - 共享 API
- `@/utils/*` - 工具函数
- `@/composables/*` - 组合函数
- `@/types/*` - 类型定义

### 理由

1. **渐进式迁移**: 一次性修改所有导入可能导致大量错误
2. **保持稳定**: 核心功能（auth, API）保持在原位置确保稳定性
3. **优先可见**: 先修复页面级别的组件导入，因为这些是用户直接看到的

### 下一步

项目应该可以正常启动。如果仍有错误：
1. 检查具体错误信息
2. 定位到具体文件
3. 按需修复该文件的导入

## 已修复文件列表

1. ✅ `src/stores/auth.ts` - 更新 storage 导入
2. ✅ `src/modules/bookstore/views/HomeView.vue` - 更新组件和 store 导入
3. ✅ `src/modules/bookstore/views/BookDetailView.vue` - 更新组件导入
4. ✅ `src/modules/admin/views/DashboardView.vue` - 更新组件导入
5. ✅ `src/modules/admin/views/ReviewManagement.vue` - 更新组件导入
6. ✅ 所有模块路由文件 - 更新布局组件导入

## 验证步骤

1. 运行 `npm run dev`
2. 访问首页 (Bookstore)
3. 测试书籍详情页
4. 检查是否还有导入错误

如果成功，项目已完成核心架构重构！

