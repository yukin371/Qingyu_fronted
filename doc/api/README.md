# API文档导航

## 📋 概述

本目录包含青羽书城前端所有API接口的详细文档，涵盖前后端数据交互、接口调用规范和错误处理指南。

## 📁 文档结构

### 📖 接口规范
- [接口集成规范](./API集成规范.md) - API集成的标准规范和最佳实践
- [接口调用指南](./接口调用指南.md) - 如何正确调用各类接口
- [错误处理指南](./错误处理指南.md) - 统一的错误处理机制

### 📚 模块API

#### 书城模块 (Bookstore)
- [首页接口](./bookstore/首页接口.md) - 首页数据获取接口
- [榜单接口](./bookstore/榜单接口.md) - 各类榜单数据接口
- [书籍列表接口](./bookstore/书籍列表接口.md) - 书籍列表查询接口
- [书籍详情接口](./bookstore/书籍详情接口.md) - 书籍详细信息接口

#### 用户模块 (User)
- [认证接口](./user/认证接口.md) - 用户登录、注册、登出
- [个人信息接口](./user/个人信息接口.md) - 用户信息管理
- [偏好设置接口](./user/偏好设置接口.md) - 用户偏好配置

#### 阅读器模块 (Reader)
- [章节接口](./reader/章节接口.md) - 章节内容获取
- [书签接口](./reader/书签接口.md) - 书签管理
- [阅读进度接口](./reader/阅读进度接口.md) - 阅读进度同步
- [笔记接口](./reader/笔记接口.md) - 阅读笔记管理

#### 共享服务 (Shared)
- [文件上传接口](./shared/文件上传接口.md) - 文件上传服务
- [图片处理接口](./shared/图片处理接口.md) - 图片裁剪、缩放等
- [搜索接口](./shared/搜索接口.md) - 全局搜索服务

## 🚀 快速开始

### 基本配置

```javascript
// 配置API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// 创建axios实例
import axios from 'axios'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### 请求拦截器

```javascript
api.interceptors.request.use(
  config => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)
```

### 响应拦截器

```javascript
api.interceptors.response.use(
  response => response.data,
  error => {
    // 统一错误处理
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
```

## 📝 接口规范

### 请求格式

所有API请求遵循RESTful规范：

- **GET** - 获取资源
- **POST** - 创建资源
- **PUT** - 更新资源
- **DELETE** - 删除资源

### 响应格式

统一的响应格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## 🔗 相关文档

- [后端API文档](../../../Qingyu_backend/doc/api/) - 后端API设计文档
- [状态管理设计](../design/api/状态管理设计.md) - 前端状态管理方案
- [API集成指南](../implementation/development/API集成指南.md) - 实施指南

---

**最后更新**：2025年10月13日

