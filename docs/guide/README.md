# 开发指南

欢迎阅读青羽书城前端开发指南！本指南将帮助你快速上手项目开发。

## 🚀 快速开始

### 新手入门

1. **[快速开始](./quick-start.md)** ⭐
   - 环境搭建
   - 克隆项目
   - 启动开发服务器
   - VS Code配置

2. **[项目结构](./project-structure.md)**
   - 目录组织
   - 文件命名
   - 模块划分

## 📚 核心概念

### 组件开发

3. **[组件开发指南](./component-guide.md)** ⭐
   - 组件类型
   - Props/Events/Slots
   - 组合式API
   - 组件测试

4. **[页面开发指南](./page-guide.md)**
   - 页面结构
   - 数据获取
   - 路由配置
   - 性能优化

### 状态与数据

5. **[状态管理](./state-management.md)** ⭐
   - Pinia Store设计
   - State/Getters/Actions
   - 多Store协作
   - 持久化

6. **[API集成](./api-integration.md)** ⭐
   - HTTP客户端封装
   - API模块定义
   - 错误处理
   - 请求优化

### 样式与路由

7. **[样式开发](./styling.md)**
   - BEM命名
   - Scoped样式
   - CSS变量
   - 响应式设计

8. **[路由配置](./routing.md)**
   - 路由定义
   - 动态路由
   - 路由守卫
   - 导航控制

## 🔧 开发工具

### 调试与优化

9. **[调试与故障排查](./debugging.md)**
   - 开发工具使用
   - 常见问题排查
   - 性能调试
   - 错误追踪

## 📖 学习路径

### 新手路径（0-2周）

```
第1天：快速开始 → 项目结构
第2-3天：组件开发指南
第4-5天：页面开发指南
第6-7天：状态管理
第8-9天：API集成
第10天：调试与故障排查
第11-14天：实践项目
```

**目标**：能够独立开发简单页面和组件

### 进阶路径（2-4周）

```
第1周：深入学习组件开发（Props、Slots、组合式API）
第2周：掌握状态管理（复杂Store设计、模块化）
第3周：样式与路由（主题定制、路由守卫）
第4周：性能优化与最佳实践
```

**目标**：能够设计和实现复杂功能模块

### 全栈路径（4周+）

```
前端开发（本指南） + 后端对接 + 部署运维
```

**目标**：全栈开发能力

## 🎯 常见任务

### 创建新页面

1. 在 `src/views/` 创建页面组件
2. 在 `router/index.js` 添加路由
3. 创建对应的Store（如需要）
4. 实现页面逻辑和样式

参考：[页面开发指南](./page-guide.md)

### 开发新组件

1. 在 `src/components/` 创建组件
2. 定义Props、Events、Slots
3. 实现组件逻辑和样式
4. 编写组件测试

参考：[组件开发指南](./component-guide.md)

### 集成新API

1. 在 `api/` 添加API定义
2. 在Store中调用API
3. 在组件中使用Store
4. 处理加载和错误状态

参考：[API集成](./api-integration.md)

### 添加新Store

1. 在 `stores/` 创建Store文件
2. 定义State、Getters、Actions
3. 在组件中使用Store

参考：[状态管理](./state-management.md)

## 💡 最佳实践速查

### 组件开发

- ✅ 使用`<script setup>`语法
- ✅ Props要有完整类型定义
- ✅ 事件使用kebab-case命名
- ✅ 样式使用BEM命名
- ✅ 添加组件注释

### 状态管理

- ✅ 按功能模块划分Store
- ✅ State保持简单扁平
- ✅ 副作用放在Actions中
- ✅ 使用`storeToRefs`解构状态

### API调用

- ✅ 统一封装HTTP客户端
- ✅ 在Store中调用API
- ✅ 统一错误处理
- ✅ 显示Loading状态

### 代码规范

- ✅ 遵循ESLint规则
- ✅ 使用Prettier格式化
- ✅ 提交前运行lint
- ✅ 编写清晰的注释

## 🔗 相关资源

### 项目文档

- [架构设计](../architecture/README.md)
- [开发规范](../standards/README.md)
- [API文档](../api/README.md)
- [组件文档](../components/README.md)

### 外部资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)

## ❓ 需要帮助？

- 查看 [常见问题](../reference/faq.md)
- 查看 [调试指南](./debugging.md)
- 联系团队成员

---

**最后更新**：2025年10月17日
