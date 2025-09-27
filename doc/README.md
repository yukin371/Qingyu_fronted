# 青羽书城前端文档

## 项目介绍

**项目名称**：青羽书城前端（Qingyu Frontend）

青羽书城前端是基于 Vue 3 + Element Plus 构建的现代化书城展示系统，为用户提供优雅的书籍浏览、榜单查看和阅读体验。

**技术栈**
- **前端框架**：Vue 3 + Composition API
- **UI组件库**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router 4
- **HTTP客户端**：Axios
- **构建工具**：Vite
- **开发语言**：JavaScript (ES6+)
- **样式预处理**：CSS3 + PostCSS

## 文档架构

### 📋 总览文档
- [项目开发规范](./项目开发规范.md) - 前端开发规范和最佳实践
- [文档架构管理规范](./文档架构管理规范.md) - 文档组织和维护规范

### 🏗️ 架构设计
- [前端架构设计](./architecture/前端架构设计.md) - 整体架构设计和技术选型
- [组件架构设计](./architecture/组件架构设计.md) - 组件设计原则和规范

### 🎨 功能设计
- [组件设计文档](./design/components/) - 各组件的详细设计
  - [Banner轮播组件](./design/components/BannerCarousel.md)
  - [榜单展示组件](./design/components/RankingList.md)
  - [书籍网格组件](./design/components/BookGrid.md)
- [页面设计文档](./design/pages/) - 各页面的设计规范
  - [首页设计](./design/pages/HomePage.md)
  - [榜单页设计](./design/pages/RankingsPage.md)
- [API集成设计](./design/api/) - 前后端接口集成
  - [API集成规范](./design/api/API集成规范.md)
  - [状态管理设计](./design/api/状态管理设计.md)

### 🔧 工程化
- [代码规范](./engineering/代码规范.md) - 编码标准和规范
- [构建配置](./engineering/构建配置.md) - Vite构建配置说明
- [环境配置](./engineering/环境配置.md) - 开发环境配置指南

### 📖 实施指南
- [开发指南](./implementation/开发指南.md) - 开发流程和最佳实践
- [组件开发指南](./implementation/组件开发指南.md) - 组件开发规范
- [样式开发指南](./implementation/样式开发指南.md) - CSS开发规范

### 🧪 测试文档
- [测试策略](./testing/测试策略.md) - 测试方法和策略
- [单元测试指南](./testing/单元测试指南.md) - 组件单元测试
- [集成测试指南](./testing/集成测试指南.md) - 端到端测试

### 📚 使用指南
- [快速开始](./usage/快速开始.md) - 项目启动和基本使用
- [组件使用指南](./usage/组件使用指南.md) - 各组件的使用方法
- [API使用指南](./usage/API使用指南.md) - 接口调用示例

## 快速导航

### 🚀 新手入门
1. [快速开始](./usage/快速开始.md) - 了解如何启动项目
2. [项目开发规范](./项目开发规范.md) - 学习开发规范
3. [前端架构设计](./architecture/前端架构设计.md) - 理解项目架构

### 🛠️ 开发者指南
1. [开发指南](./implementation/开发指南.md) - 开发流程和规范
2. [组件开发指南](./implementation/组件开发指南.md) - 组件开发最佳实践
3. [API集成规范](./design/api/API集成规范.md) - 接口集成方法

### 🎯 设计参考
1. [组件设计文档](./design/components/) - 组件设计规范
2. [页面设计文档](./design/pages/) - 页面布局设计
3. [样式开发指南](./implementation/样式开发指南.md) - UI设计规范

## 项目状态

- ✅ **基础架构** - Vue 3 + Element Plus 项目搭建完成
- ✅ **核心组件** - Banner、榜单、书籍展示组件完成
- ✅ **状态管理** - Pinia状态管理集成完成
- ✅ **API集成** - 后端接口集成完成
- ✅ **路由配置** - 基础路由配置完成
- 🚧 **功能扩展** - 更多页面和功能开发中
- 📋 **测试覆盖** - 测试用例编写中
- 📋 **性能优化** - 性能优化待完善

## 贡献指南

1. 阅读 [项目开发规范](./项目开发规范.md)
2. 了解 [前端架构设计](./architecture/前端架构设计.md)
3. 遵循 [代码规范](./engineering/代码规范.md)
4. 参考 [开发指南](./implementation/开发指南.md)

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目仓库：[GitHub Repository]
- 文档反馈：提交 Issue 或 Pull Request

---

**最后更新时间**：2024年1月
**文档版本**：v1.0.0