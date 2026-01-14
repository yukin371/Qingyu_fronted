# 统一错误处理机制实施指南

> **版本**: v1.0
> **最后更新**: 2025-01-14
> **实施计划**: [2025-01-14-unified-error-handling-implementation.md](../plans/2025-01-14-unified-error-handling-implementation.md)

## 概述

本文档说明如何在青羽写作平台中使用统一的错误处理机制。该机制已在前后端完全实现，提供一致的用户体验和开发体验。

## 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (Vue 3)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  组件层                                                        │
│  └──> useErrorHandler (composable)                           │
│                                                               │
│  API 层                                                       │
│  └──> httpService/apiClient (HTTP 服务)                      │
│      ├── 请求拦截器 (添加认证令牌)                              │
│      ├── 响应拦截器 (统一错误处理)                              │
│      └── 令牌自动刷新                                          │
│                                                               │
│  错误监控层                                                    │
│  └──> errorReporter (批量上报)                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/JSON
                            │ 标准错误响应
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       后端 (Go + Gin)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  中间件层                                                     │
│  ├──> ErrorHandler (错误处理)                                │
│  └──> PanicRecovery (Panic 捕获)                             │
│                                                               │
│  错误处理层                                                   │
│  └──> pkg/errors (错误类型和工厂)                             │
│      ├── ErrorCode (错误码枚举)                              │
│      ├── ErrorResponse (响应结构)                            │
│      └── 错误工厂函数                                         │
│                                                               │
│  日志层                                                       │
│  └──> middleware/logger.go (Zap Logger)                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 前端使用指南

### 1. 在组件中使用 useErrorHandler

```typescript
<script setup lang="ts">
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleApiError, createErrorHandler } = useErrorHandler()

// 方式 1: 直接处理错误
const fetchData = async () => {
  try {
    const data = await apiClient.get('/some/data')
    // 处理数据
  } catch (error) {
    handleApiError(error)
  }
}

// 方式 2: 使用预创建的处理器
const handleError = createErrorHandler('加载失败')

const loadData = async () => {
  try {
    const data = await apiClient.get('/data')
  } catch (error) {
    handleError(error)
  }
}
</script>
```

### 2. API 调用自动错误处理

所有使用 `apiClient` 或 `httpService` 的 API 调用都会自动通过拦截器处理错误：

```typescript
import { httpService } from '@/core/services/http.service'

export const userAPI = {
  getProfile: () => httpService.get<UserProfile>('/user/profile')
  // 错误会自动被拦截器处理：
  // - 显示用户友好的错误消息
  // - 处理认证错误（自动跳转登录或刷新令牌）
  // - 上报错误到监控系统
}
```

### 3. 错误码参考

| 模块 | 错误码范围 | 说明 |
|------|-----------|------|
| 通用/客户端 | 1000-1099 | 参数错误、未授权、禁止访问等 |
| 认证授权 | 1100-1199 | Token 过期、无效凭证等 |
| 业务逻辑 | 1200-1299 | 余额不足、内容未发布等 |
| 内容审核 | 1300-1399 | 内容待审核、被拒绝等 |
| 服务器 | 5000-5999 | 内部错误、数据库错误等 |

完整错误码列表: [错误码手册](./error-codes.md)

---

## 后端使用指南

### 1. 在处理器中使用统一错误

```go
package admin

import (
    "github.com/gin-gonic/gin"
    "Qingyu_backend/pkg/errors"
    "Qingyu_backend/api/v1/shared"
)

func (api *AnnouncementAPI) GetAnnouncements(c *gin.Context) {
    // 参数验证
    if err := c.ShouldBindJSON(&req); err != nil {
        shared.ErrorResponseWithCode(errors.InvalidParams, "请求参数错误", err)
        return
    }

    // 业务逻辑
    data, err := api.service.GetAnnouncements(req)
    if err != nil {
        // 使用统一的错误响应
        c.JSON(http.StatusOK, shared.ErrorResponseWithCode(
            errors.InternalError,
            "获取公告失败",
            err,
        ))
        return
    }

    // 成功响应
    c.JSON(http.StatusOK, shared.SuccessResponse(data, "获取成功"))
}
```

### 2. 使用错误工厂函数

```go
import "Qingyu_backend/pkg/errors"

// 参数错误
if len(title) > 100 {
    err := errors.InvalidParams("标题长度不能超过100个字符")
    // 使用 err...
}

// 资源不存在
if !announcementExists {
    err := errors.NotFound("公告不存在")
    // 使用 err...
}

// 权限错误
if !hasPermission {
    err := errors.Forbidden("您没有权限执行此操作")
    // 使用 err...
}
```

### 3. 中间件注册

在 `main.go` 或路由设置中：

```go
import "Qingyu_backend/middleware"

func main() {
    r := gin.Default()

    // 注册全局错误处理中间件
    r.Use(middleware.ErrorHandler("qingyu-api"))
    r.Use(middleware.PanicRecovery("qingyu-api"))

    // 注册路由
    // ...

    r.Run(":8080")
}
```

---

## 常见错误处理场景

### 场景 1: 表单验证

**前端:**

```typescript
const submitForm = async (formData: FormData) => {
  try {
    await httpService.post('/user/profile', formData)
    ElMessage.success('保存成功')
  } catch (error) {
    // 拦截器会自动显示 1001 参数错误
    // 无需手动处理
  }
}
```

**后端:**

```go
func UpdateProfile(c *gin.Context) {
    var req UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusOK, shared.ErrorResponseWithCode(
            errors.InvalidParams,
            "请求参数格式错误",
            err,
        ))
        return
    }

    if len(req.Nickname) > 50 {
        c.JSON(http.StatusOK, shared.ErrorResponseWithCode(
            errors.InvalidParams,
            "昵称不能超过50个字符",
            nil,
        ))
        return
    }

    // 更新逻辑...
}
```

### 场景 2: 文件上传

**前端:**

```typescript
const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('avatar', file)

  try {
    const result = await httpService.post<{ url: string }>('/user/avatar', formData)
    return result.url
  } catch (error) {
    // 拦截器会处理文件上传错误
    return null
  }
}
```

**后端:**

```go
func UploadAvatar(c *gin.Context) {
    file, err := c.FormFile("avatar")
    if err != nil {
        c.JSON(http.StatusOK, shared.ErrorResponseWithCode(
            errors.InvalidParams,
            "缺少文件参数",
            err,
        ))
        return
    }

    // 验证文件大小
    if file.Size > 5*1024*1024 { // 5MB
        c.JSON(http.StatusOK, shared.ErrorResponseWithCode(
            errors.InvalidParams,
            "文件大小不能超过5MB",
            nil,
        ))
        return
    }

    // 保存文件...
}
```

### 场景 3: 分页查询

**前端:**

```typescript
const fetchList = async (page: number, pageSize: number) => {
  try {
    const result = await httpService.get<{
      items: Item[]
      pagination: Pagination
    }>('/books', {
      params: { page, pageSize }
    })
    return result
  } catch (error) {
    handleApiError(error)
    return { items: [], pagination: { total: 0, page: 1, pageSize: 20 } }
  }
}
```

**后端:**

```go
func GetBookList(c *gin.Context) {
    page := c.DefaultQuery("page", "1")
    pageSize := c.DefaultQuery("pageSize", "20")

    // 验证分页参数
    pageNum, _ := strconv.Atoi(page)
    if pageNum < 1 {
        c.JSON(http.StatusOK, shared.ErrorResponseWithCode(
            errors.InvalidParams,
            "页码必须大于0",
            nil,
        ))
        return
    }

    // 查询逻辑...
}
```

---

## 错误监控和日志

### 前端错误上报

前端自动上报所有 API 错误到后端监控系统：

- 批量上报（每 10 个或 30 秒）
- 页面卸载时自动上报
- 包含用户 ID、URL、错误详情等

### 后端日志

后端使用 Zap Logger 记录所有错误：

```go
import "Qingyu_backend/pkg/errors"

// 记录带字段的错误
logger.Log.Error("API error",
    zap.Int("code", appErr.Code),
    zap.String("error", appErr.Error),
    zap.String("message", appErr.Message),
    zap.String("path", c.Request.URL.Path),
    zap.String("method", c.Request.Method),
)
```

---

## 最佳实践

1. **统一使用**: 所有 API 调用都应使用 `httpService` 或 `apiClient`
2. **错误日志**: 后端所有错误都应记录到日志系统
3. **用户友好**: 错误信息应该清晰易懂，提供解决建议
4. **安全优先**: 生产环境不暴露敏感的系统信息
5. **及时上报**: 使用 `errorReporter` 上报前端错误

---

## 故障排查

### 问题 1: 认证错误没有自动跳转登录

**原因**: 令牌刷新失败或后端返回了错误的错误码

**解决方案**:
- 检查后端是否返回正确的错误码（1102 表示 Token 过期）
- 确认 `/api/v1/auth/refresh` 端点可用

### 问题 2: 错误信息显示不正确

**原因**: 前端错误码与后端不一致

**解决方案**:
- 使用 `pkg/errors` 包中的错误码常量
- 不要在代码中硬编码错误码数字

### 问题 3: 错误没有被上报

**原因**: 仅在生产环境启动错误上报

**解决方案**:
- 检查 `import.meta.env.PROD` 的值
- 开发环境下可以通过浏览器控制台查看错误

---

## 相关文档

- [错误码手册](./error-codes.md) - 完整错误码参考
- [最佳实践](./best-practices.md) - 错误处理最佳实践
- [快速参考](../quick-reference/) - 各模块 API 快速参考
- [实施计划](../plans/2025-01-14-unified-error-handling-implementation.md) - 完整实施计划

---

**实施状态**: ✅ 完成
**最后验证**: 2025-01-14
**负责人**: Claude Code
