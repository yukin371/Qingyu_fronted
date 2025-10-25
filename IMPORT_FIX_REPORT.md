# 导入问题修复报告

## 日期: 2025-10-25

## 修复的问题

### 1. ✅ src/stores/auth.ts
**问题**: 导入不存在的 `@/utils/storage`  
**修复**: 
- 更改为导入 `@core/services/storage.service`
- 使用 `storageService` API
- 更新所有 storage 调用:
  - `storage.getToken()` → `storageService.get(STORAGE_KEYS.AUTH_TOKEN)`
  - `storage.setToken()` → `storageService.set(STORAGE_KEYS.AUTH_TOKEN, token)`
  - 等等

### 2. ✅ 模块路由中的布局导入

**修复的文件**:
- `src/modules/admin/routes.ts`
  - `@/layouts/AdminLayout.vue` → `@shared/components/layout/AdminLayout.vue`
- `src/modules/bookstore/routes.ts`
  - 更新为 `@shared/components/layout/MainLayout.vue`
- `src/modules/reader/routes.ts`
  - 更新为 `@shared/components/layout/MainLayout.vue`
- `src/modules/user/routes.ts`
  - 更新为 `@shared/components/layout/MainLayout.vue`
- `src/modules/writer/routes.ts`
  - 更新为 `@shared/components/layout/MainLayout.vue`

## 验证

布局文件存在于:
- ✅ `src/shared/components/layout/AdminLayout.vue`
- ✅ `src/shared/components/layout/MainLayout.vue`

## 下一步

1. 重新启动开发服务器
2. 测试所有模块路由
3. 验证认证功能

## 状态

✅ 所有导入问题已修复

