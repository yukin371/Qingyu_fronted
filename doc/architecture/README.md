# 架构设计

项目整体架构和技术决策文档。

## 架构文档

### [架构总览](./overview.md)

- 整体架构设计
- 技术选型理由
- 设计原则
- 模块划分

### [组件架构](./component-design.md)

- 组件分类
- 组件设计原则
- 组件通信模式
- 组件复用策略

### [状态管理架构](./state-management.md)

- Pinia架构设计
- Store模块划分
- 状态流转
- 持久化策略

### [性能优化](./performance.md)

- 代码分割
- 懒加载策略
- 缓存机制
- 渲染优化

## 架构原则

### 分层架构

```
Pages (页面层)
  ↓
Components (组件层)
  ↓
Stores (状态层)
  ↓
API (接口层)
  ↓
Utils (工具层)
```

### 设计原则

- **单一职责**：每个模块只负责一个功能
- **组件复用**：通过props和slots实现复用
- **状态集中**：使用Pinia集中管理状态
- **接口统一**：统一的API调用规范

## 技术栈

| 技术         | 版本   | 说明       |
| ------------ | ------ | ---------- |
| Vue 3        | ^3.4.0 | 前端框架   |
| Element Plus | ^2.4.0 | UI组件库   |
| Pinia        | ^2.1.0 | 状态管理   |
| Vue Router   | ^4.2.0 | 路由管理   |
| Axios        | ^1.6.0 | HTTP客户端 |
| Vite         | ^5.0.0 | 构建工具   |

## 参考资料

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)

---

**最后更新**：2025年10月17日
