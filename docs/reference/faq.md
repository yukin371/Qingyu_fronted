# 常见问题FAQ

## 环境搭建

**Q: Node.js版本要求是什么？**

A: 最低要求Node.js 16.x，推荐使用18.x LTS版本。

**Q: 使用npm还是pnpm？**

A: 推荐使用pnpm，安装更快，占用空间更小。

## 开发问题

**Q: 如何创建新页面？**

A:

1. 在`src/views/`创建页面组件
2. 在`router/index.js`添加路由
3. 参考[页面开发指南](../guide/page-guide.md)

**Q: 如何调用后端API？**

A:

1. 在`api/`目录定义接口
2. 在Store中调用API
3. 在组件中使用Store
4. 参考[API集成指南](../guide/api-integration.md)

**Q: 组件间如何传递数据？**

A:

- 父子组件：使用Props和Events
- 跨组件：使用Pinia Store
- 参考[组件开发指南](../guide/component-guide.md)

**Q: 如何管理全局状态？**

A: 使用Pinia，参考[状态管理指南](../guide/state-management.md)

## 样式问题

**Q: 如何覆盖Element Plus样式？**

A:

```vue
<style>
/* 不使用scoped */
.el-button {
  border-radius: 4px;
}
</style>

<!-- 或使用:deep() -->
<style scoped>
:deep(.el-button) {
  border-radius: 4px;
}
</style>
```

**Q: 样式不生效怎么办？**

A:

1. 检查scoped是否影响子组件
2. 检查选择器优先级
3. 使用浏览器开发工具检查

## 路由问题

**Q: 如何实现路由守卫？**

A: 参考[路由配置](../guide/routing.md)的路由守卫章节

**Q: 如何传递路由参数？**

A:

```javascript
// 动态路由
router.push(`/books/${id}`)

// 查询参数
router.push({ name: 'Search', query: { q: keyword } })
```

## 调试问题

**Q: 如何调试Vue组件？**

A:

1. 安装Vue DevTools
2. 使用console.log
3. 使用debugger断点
4. 参考[调试指南](../guide/debugging.md)

**Q: 接口请求失败怎么排查？**

A:

1. 查看Network面板
2. 检查请求URL和参数
3. 查看响应状态码和内容
4. 检查请求拦截器

## 性能问题

**Q: 如何优化首屏加载？**

A:

- 路由懒加载
- 代码分割
- 图片懒加载
- 使用CDN

**Q: 列表渲染慢怎么办？**

A:

- 使用虚拟滚动
- 分页加载
- 使用v-memo优化

## 构建部署

**Q: 如何构建生产版本？**

A:

```bash
pnpm build
# 输出在dist/目录
```

**Q: 如何配置环境变量？**

A: 创建`.env.local`文件，参考[环境配置](../deployment/env-config.md)

---

**最后更新**：2025年10月17日
