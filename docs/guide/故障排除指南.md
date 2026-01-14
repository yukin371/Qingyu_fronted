# 故障排查指南

## 问题: 首页显示空白

### 可能原因和解决方案

#### 1. 检查浏览器控制台错误

打开浏览器开发者工具 (F12) 并查看：

**Console 标签页:**
- 是否有 JavaScript 错误？
- 是否有导入错误？
- 是否有 404 错误（文件未找到）？

**Network 标签页:**
- 是否所有资源都成功加载？
- 是否有失败的 HTTP 请求？

#### 2. 常见问题检查

**A. 路由配置问题**
```bash
# 检查路由是否正确导出
- src/modules/bookstore/routes.ts
- src/modules/reader/routes.ts
- src/modules/user/routes.ts
- src/modules/writer/routes.ts
- src/modules/admin/routes.ts
```

**B. 组件导入错误**
可能还有未更新的组件导入路径

**C. Store 初始化错误**
检查 Pinia store 是否正确初始化

#### 3. 快速测试步骤

1. 访问: http://localhost:5175/
2. 打开控制台 (F12)
3. 查看是否有错误信息
4. 尝试访问其他路由:
   - http://localhost:5175/books
   - http://localhost:5175/auth

#### 4. 临时调试方法

在 `src/App.vue` 中添加调试信息：

```vue
<template>
  <div>
    <p>App Loading...</p>
    <router-view />
  </div>
</template>
```

#### 5. 检查入口文件

确认 `src/main.ts` 正确加载所有依赖：
- ✅ Vue
- ✅ Pinia
- ✅ Element Plus
- ✅ Router
- ✅ 全局样式

#### 6. 清除缓存

```bash
# 清除 node_modules 和重新安装
rm -rf node_modules package-lock.json
npm install

# 清除 Vite 缓存
rm -rf node_modules/.vite

# 重启开发服务器
npm run dev
```

### 下一步操作

请提供：
1. 浏览器控制台中的错误信息（如果有）
2. Network 标签中失败的请求（如果有）
3. 浏览器版本和操作系统信息

