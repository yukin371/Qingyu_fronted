# 青羽书城前端文档

## 📚 文档导航

欢迎来到青羽书城前端文档中心！本文档库包含了项目的完整技术文档，按照功能模块和文档类型进行了系统化组织。

## 项目介绍

**青羽书城前端** 是基于 Vue 3 + Element Plus 构建的现代化书城展示系统，为用户提供优雅的书籍浏览、榜单查看和阅读体验。

**技术栈**：Vue 3 + Composition API、Element Plus、Pinia、Vue Router 4、Axios、Vite

## 🗂️ 文档结构

### 📋 项目概览

- [项目开发规范](./项目开发规范.md) - 前端开发规范和最佳实践
- [文档架构管理规范](./文档架构管理规范.md) - 文档组织和维护规范
- [前端文档整理方案](./前端文档整理方案.md) - 文档整理完善方案

### 🏗️ 架构设计

**[架构文档导航](./architecture/README.md)**

- [前端架构设计](./architecture/前端架构设计.md) - 整体架构设计和技术选型
- [技术选型](./architecture/技术选型.md) - 技术栈选择和决策依据
- [组件架构设计](./architecture/组件架构设计.md) - 组件设计原则和规范
- [状态管理架构](./architecture/状态管理架构.md) - Pinia状态管理架构
- [路由架构设计](./architecture/路由架构设计.md) - Vue Router路由架构
- [性能优化架构](./architecture/性能优化架构.md) - 性能优化策略

### 🎨 功能设计

**[设计文档导航](./design/README.md)**

#### 组件设计
- [组件设计总览](./design/components/README.md) - 组件设计体系概述
  - [通用组件](./design/components/common/) - 基础通用组件
  - [业务组件](./design/components/business/) - 业务相关组件
  - [布局组件](./design/components/layout/) - 布局相关组件

#### 页面设计
- [页面设计总览](./design/pages/README.md)
  - [首页设计](./design/pages/HomePage设计.md)
  - [榜单页设计](./design/pages/RankingsPage设计.md)

#### 功能模块设计
- [功能模块总览](./design/features/README.md)
  - [用户认证设计](./design/features/用户认证设计.md)
  - [书籍搜索设计](./design/features/书籍搜索设计.md)
  - [书架管理设计](./design/features/书架管理设计.md)

#### UI/UX设计
- [UI/UX设计总览](./design/ui-ux/README.md)
  - [设计系统](./design/ui-ux/设计系统.md)
  - [主题定制](./design/ui-ux/主题定制.md)
  - [响应式设计](./design/ui-ux/响应式设计.md)
  - [无障碍设计](./design/ui-ux/无障碍设计.md)

#### API集成设计
- [API集成规范](./design/api/API集成规范.md)
- [状态管理设计](./design/api/状态管理设计.md)

### 🔌 API文档

**[API文档导航](./api/README.md)**

- [接口集成规范](./api/API集成规范.md) - API集成标准规范
- [接口调用指南](./api/接口调用指南.md) - 如何正确调用接口
- [错误处理指南](./api/错误处理指南.md) - 统一错误处理机制

#### 模块API
- [书城模块API](./api/bookstore/) - 首页、榜单、书籍列表等接口
- [用户模块API](./api/user/) - 认证、个人信息等接口
- [阅读器模块API](./api/reader/) - 章节、书签、阅读进度等接口
- [共享服务API](./api/shared/) - 文件上传、搜索等接口

### 🛠️ 实施指南

**[实施文档导航](./implementation/README.md)**

#### 快速开始
- [环境搭建](./implementation/quick-start/环境搭建.md)
- [项目启动](./implementation/quick-start/项目启动.md)
- [开发工作流](./implementation/quick-start/开发工作流.md)

#### 开发指南 ⭐
- [组件开发指南](./implementation/development/组件开发指南.md) - 组件开发完整教程
- [页面开发指南](./implementation/development/页面开发指南.md) - 页面开发实战指南
- [API集成指南](./implementation/development/API集成指南.md) - API调用与集成
- [状态管理指南](./implementation/development/状态管理指南.md) - Pinia状态管理

#### 最佳实践
- [性能优化实践](./implementation/best-practices/性能优化实践.md)
- [代码复用实践](./implementation/best-practices/代码复用实践.md)
- [错误处理实践](./implementation/best-practices/错误处理实践.md)
- [安全实践](./implementation/best-practices/安全实践.md)

#### 故障排除
- [常见问题](./implementation/troubleshooting/常见问题.md)
- [调试技巧](./implementation/troubleshooting/调试技巧.md)
- [问题案例库](./implementation/troubleshooting/问题案例库.md)

### 📊 软件工程

**[工程文档导航](./engineering/README.md)**

- [前端需求分析](./engineering/前端需求分析.md) - 前端功能需求分析
- [代码规范](./engineering/代码规范.md) - JavaScript/Vue代码规范
- [Git工作流规范](./engineering/Git工作流规范.md) - Git分支和提交规范
- [代码审查规范](./engineering/代码审查规范.md) - Code Review流程
- [构建配置](./engineering/构建配置.md) - Vite构建配置
- [环境配置](./engineering/环境配置.md) - 环境变量配置
- [依赖管理](./engineering/依赖管理.md) - npm包管理
- [CI-CD配置](./engineering/CI-CD配置.md) - 持续集成和部署

### 🧪 测试文档

**[测试文档导航](./testing/README.md)**

- [测试策略](./testing/测试策略.md) - 整体测试策略和方法
- [单元测试指南](./testing/单元测试指南.md) - Vitest单元测试
- [组件测试指南](./testing/组件测试指南.md) - Vue组件测试
- [集成测试指南](./testing/集成测试指南.md) - 集成测试方法
- [E2E测试指南](./testing/E2E测试指南.md) - 端到端测试
- [性能测试指南](./testing/性能测试指南.md) - 前端性能测试
- [可访问性测试](./testing/可访问性测试.md) - 无障碍测试

### 📖 使用指南

**[使用文档导航](./usage/README.md)**

- [快速开始](./usage/快速开始.md) - 项目快速启动
- [组件使用指南](./usage/组件使用指南.md) - 组件使用方法
- [API使用指南](./usage/API使用指南.md) - API调用示例
- [主题定制指南](./usage/主题定制指南.md) - 主题定制方法
- [插件使用指南](./usage/插件使用指南.md) - 插件使用说明
- [常见问题FAQ](./usage/常见问题FAQ.md) - 常见问题解答
- [示例代码](./usage/examples/) - 各种使用示例

### 🚀 运维文档

**[运维文档导航](./ops/README.md)**

- [部署指南](./ops/部署指南.md) - 应用部署流程
- [Docker部署](./ops/Docker部署.md) - Docker容器化部署
- [Nginx配置](./ops/Nginx配置.md) - Nginx服务器配置
- [性能监控](./ops/性能监控.md) - 性能监控方案
- [错误日志](./ops/错误日志.md) - 日志管理
- [维护手册](./ops/维护手册.md) - 日常维护操作

### 📝 文档模板

**[模板导航](./templates/README.md)**

- [组件设计模板](./templates/组件设计模板.md)
- [页面设计模板](./templates/页面设计模板.md)
- [API文档模板](./templates/API文档模板.md)
- [测试文档模板](./templates/测试文档模板.md)
- [实施文档模板](./templates/实施文档模板.md)

## 🚀 快速开始

### 新手入门

1. **环境准备** - 阅读 [环境搭建](./implementation/quick-start/环境搭建.md)
2. **启动项目** - 参考 [项目启动](./implementation/quick-start/项目启动.md)
3. **了解规范** - 学习 [项目开发规范](./项目开发规范.md)
4. **理解架构** - 查看 [前端架构设计](./architecture/前端架构设计.md)

### 开发者指南

1. **组件开发** - 参考 [组件开发指南](./implementation/development/组件开发指南.md)
2. **页面开发** - 参考 [页面开发指南](./implementation/development/页面开发指南.md)
3. **API集成** - 参考 [API集成指南](./implementation/development/API集成指南.md)
4. **状态管理** - 参考 [状态管理指南](./implementation/development/状态管理指南.md)

### API使用

1. **接口规范** - 查看 [接口集成规范](./api/API集成规范.md)
2. **接口文档** - 参考各模块API文档
3. **使用示例** - 查看 [API使用指南](./usage/API使用指南.md)

## 📊 项目状态

- ✅ **基础架构** - Vue 3 + Element Plus 项目搭建完成
- ✅ **核心组件** - Banner、榜单、书籍展示组件完成
- ✅ **状态管理** - Pinia状态管理集成完成
- ✅ **API集成** - 后端接口集成完成
- ✅ **路由配置** - 基础路由配置完成
- 🚧 **功能扩展** - 更多页面和功能开发中
- 📋 **测试覆盖** - 测试用例编写中
- 📋 **性能优化** - 性能优化待完善

## 📝 文档贡献

在创建或修改文档时，请遵循以下原则：

1. 遵循 [文档架构管理规范](./文档架构管理规范.md)
2. 使用统一的Markdown格式
3. 参考对应的 [文档模板](./templates/)
4. 保持文档内容的准确性和时效性
5. 及时更新相关链接和引用

## 🔗 相关链接

- [后端项目文档](../../Qingyu_backend/doc/) - Go语言后端服务文档
- [Light Feather Studio](../../Light-Feather-Studio/) - 写作端项目
- [项目根目录](../../) - 项目根目录

## 📅 文档历史

### v2.1.0 (2025-10-13)
- ✅ 完成开发指南文档（组件、页面、API、状态管理）
- ✅ 完成快速开始文档（环境搭建、项目启动、开发工作流）
- ✅ 完成架构设计文档（技术选型、组件架构、状态管理、路由、性能优化）

### v2.0.0 (2025-10-13)
- 📁 重构文档目录结构
- ✨ 新增API、运维、模板等文档目录
- 📝 完善各目录README导航文档
- 🎨 优化文档组织方式，对标后端文档

### v1.0.0 (2025-09)
- 🎉 初始版本发布
- 📝 创建基础文档结构

---

**文档版本**：v2.0.0  
**最后更新**：2025年10月13日  
**维护团队**：前端开发团队
