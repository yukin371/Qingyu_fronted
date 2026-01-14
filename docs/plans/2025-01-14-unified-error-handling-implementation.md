# 统一错误处理机制实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在前后端实现统一的错误处理机制，包括错误码体系、错误响应格式、错误拦截器和错误监控，提供一致的用户体验和开发体验。

**Architecture:**
- **前端**: 基于 Axios 拦截器实现统一的错误捕获和处理，创建 composable hook 提供错误处理能力
- **后端**: 基于 Go 实现统一的错误类型定义和 Gin 中间件，确保所有 API 返回标准化的错误响应
- **监控**: 集成前端错误上报和后端日志系统，实现完整的错误追踪链路

**Tech Stack:**
- **前端**: Vue 3, TypeScript, Axios, Element Plus, Pinia
- **后端**: Go 1.21+, Gin, Zap Logger
- **文档**: 已完成的 API 文档位于 `docs/api/`

---

## 前置条件

**阅读以下文档以了解设计规范:**
- `docs/api/error-handling/error-codes.md` - 错误码完整参考
- `docs/api/error-handling/best-practices.md` - 错误处理最佳实践
- `docs/api/quick-reference/*.md` - 各模块 API 快速参考

**项目结构:**
```
Qingyu_fronted/          # 前端项目
├── src/
│   ├── core/
│   │   └── services/    # HTTP 服务层
│   ├── composables/     # Vue Composables
│   └── types/           # TypeScript 类型定义

Qingyu_backend/          # 后端项目
├── pkg/
│   └── errors/          # 错误处理包
├── middleware/          # Gin 中间件
└── internal/            # 内部实现
```

---

## Part 1: 前端错误处理实现

### Task 1: 创建错误类型定义

**Files:**
- Create: `src/types/error.types.ts`

**Step 1: 创建错误类型定义文件**

```typescript
// src/types/error.types.ts

/**
 * 标准错误响应接口
 */
export interface ErrorResponse {
  code: number
  message: string
  error: string
  details?: Record<string, unknown>
  timestamp: string
}

/**
 * 模块码枚举
 */
export enum ModuleCode {
  SUCCESS = 0,
  GENERAL = 1,      // 通用/基础
  AUTH = 2,         // 认证授权
  BOOKSTORE = 3,    // 书城模块
  READER = 4,       // 阅读器模块
  WRITER = 5,       // 写作模块
  USER = 6,         // 用户模块
  SOCIAL = 7,       // 社交模块
}

/**
 * 错误类别枚举
 */
export enum ErrorCategory {
  SUCCESS = 0,      // 成功
  PARAM = 1,        // 参数错误
  PERMISSION = 2,   // 权限错误
  NOT_FOUND = 3,    // 资源不存在
  BUSINESS = 4,     // 业务逻辑错误
  SYSTEM = 5,       // 系统错误
}

/**
 * 构建错误码
 */
export function buildErrorCode(module: ModuleCode, category: ErrorCategory, specific: number): number {
  return module * 1000 + category * 100 + specific
}
```

**Step 2: 保存文件**

运行: 手动保存文件 `src/types/error.types.ts`
预期: 文件创建成功

**Step 3: 提交**

```bash
git add src/types/error.types.ts
git commit -m "feat(types): add error type definitions

- 定义 ErrorResponse 接口
- 添加 ModuleCode 和 ErrorCategory 枚举
- 提供 buildErrorCode 工具函数
```

---

### Task 2: 创建 HTTP 服务（含 Axios 拦截器）

**Files:**
- Create: `src/core/services/http.service.ts`

**Step 1: 创建 HTTP 服务文件**

```typescript
// src/core/services/http.service.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'
import type { ErrorResponse } from '@/types/error.types'

// 创建 axios 实例
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证令牌
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 令牌刷新队列
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}>[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 统一返回 data 字段
    return response.data
  },
  async (error: AxiosError<ErrorResponse>) => {
    const { response, config } = error

    // 网络错误处理
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请检查网络连接')
      } else {
        ElMessage.error('网络连接失败，请检查网络')
      }
      return Promise.reject(error)
    }

    const { code, message, error: errorType } = response.data

    // 处理令牌过期 - 尝试刷新
    if (code === 2005 && config) {
      // TOKEN_EXPIRED
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(config)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const res = await axios.post('/api/v1/auth/refresh', { token: refreshToken })

        const { token: newToken } = res.data.data
        localStorage.setItem('token', newToken)

        processQueue(null, newToken)

        return apiClient(config)
      } catch (err) {
        processQueue(err, null)
        handleAuthError()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // 根据错误码分类处理
    switch (code) {
      // 认证错误 - 跳转登录
      case 1003: // UNAUTHORIZED
      case 2006: // TOKEN_INVALID
      case 2007: // REFRESH_TOKEN_EXPIRED
        handleAuthError()
        break

      // 权限错误
      case 1004: // FORBIDDEN
      case 2008: // PERMISSION_DENIED
        ElMessage.error('您没有权限执行此操作')
        break

      // 参数错误
      case 1001: // INVALID_PARAM
      case 1002: // MISSING_PARAM
        ElMessage.warning(message || '参数错误，请检查输入')
        break

      // 资源不存在
      case 1005: // NOT_FOUND
        ElMessage.warning(message || '请求的资源不存在')
        break

      // 业务逻辑错误
      case 4001: // RATE_LIMIT_EXCEEDED
        ElMessage.error('操作过于频繁，请稍后再试')
        break

      // 系统错误
      case 5001: // INTERNAL_ERROR
        ElMessage.error('服务器内部错误，请稍后重试')
        break

      default:
        ElMessage.error(message || '请求失败，请稍后重试')
    }

    return Promise.reject(error)
  }
)

// 处理认证错误
function handleAuthError() {
  ElMessage.warning('登录已过期，请重新登录')
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')

  // 延迟跳转，避免路由拦截器问题
  setTimeout(() => {
    const router = require('@/router').default as Router
    router.push('/login')
  }, 1000)
}

// 导出实例供模块使用
export default apiClient
```

**Step 2: 保存文件**

运行: 手动保存文件 `src/core/services/http.service.ts`
预期: 文件创建成功

**Step 3: 提交**

```bash
git add src/core/services/http.service.ts
git commit -m "feat(core): implement HTTP service with Axios interceptors

- 创建 apiClient 实例
- 实现请求拦截器添加认证令牌
- 实现响应拦截器统一错误处理
- 支持令牌自动刷新机制
- 根据错误码分类处理各种错误场景
"
```

---

### Task 3: 创建错误处理 Composable

**Files:**
- Create: `src/composables/useErrorHandler.ts`

**Step 1: 创建错误处理 composable**

```typescript
// src/composables/useErrorHandler.ts

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ErrorResponse } from '@/types/error.types'

/**
 * 错误处理状态
 */
interface ErrorState {
  error: ErrorResponse | null
  visible: boolean
}

/**
 * 错误处理 Composable
 */
export function useErrorHandler() {
  const state = ref<ErrorState>({
    error: null,
    visible: false
  })

  /**
   * 显示错误信息
   */
  const showError = (error: ErrorResponse, duration = 3000) => {
    state.value.error = error
    state.value.visible = true

    ElMessage.error(error.message)

    // 自动隐藏
    if (duration > 0) {
      setTimeout(() => {
        state.value.visible = false
      }, duration)
    }
  }

  /**
   * 处理 API 错误响应
   */
  const handleApiError = (error: unknown): ErrorResponse | null => {
    if (!error) return null

    // Axios 错误
    if ('response' in error && 'data' in (error as { response: { data: unknown } })) {
      const errorResponse = (error as { response: { data: ErrorResponse } }).response.data
      showError(errorResponse)
      return errorResponse
    }

    // 标准错误对象
    if (error instanceof Error) {
      const errorResponse: ErrorResponse = {
        code: 5001,
        message: error.message,
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      }
      showError(errorResponse)
      return errorResponse
    }

    // 字符串错误
    if (typeof error === 'string') {
      const errorResponse: ErrorResponse = {
        code: 5001,
        message: error,
        error: 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
      }
      showError(errorResponse)
      return errorResponse
    }

    return null
  }

  /**
   * 清除错误状态
   */
  const clearError = () => {
    state.value.error = null
    state.value.visible = false
  }

  /**
   * 创建错误处理器
   */
  const createErrorHandler = (fallbackMessage = '操作失败') => {
    return (error: unknown) => {
      const handled = handleApiError(error)
      if (!handled) {
        ElMessage.error(fallbackMessage)
      }
    }
  }

  return {
    state,
    showError,
    handleApiError,
    clearError,
    createErrorHandler
  }
}
```

**Step 2: 保存文件**

运行: 手动保存文件 `src/composables/useErrorHandler.ts`
预期: 文件创建成功

**Step 3: 提交**

```bash
git add src/composables/useErrorHandler.ts
git commit -m "feat(composable): add error handler composable

- 提供 showError 显示错误信息
- 提供 handleApiError 处理 API 错误
- 提供 createErrorHandler 创建错误处理函数
- 管理错误状态
"
```

---

### Task 4: 更新 API 模块使用统一 HTTP 服务

**Files:**
- Modify: `src/modules/user/api/user.api.ts`

**Step 1: 读取现有用户 API 文件**

```bash
cat src/modules/user/api/user.api.ts
```

**Step 2: 更新导入语句，使用统一的 HTTP 服务**

在文件顶部添加或修改：

```typescript
import apiClient from '@/core/services/http.service'
import type { ErrorResponse } from '@/types/error.types'
```

将所有 `axios` 调用替换为 `apiClient`。

例如，如果原代码是：

```typescript
import axios from 'axios'

export const userAPI = {
  getProfile: () => axios.get('/user/profile')
}
```

修改为：

```typescript
export const userAPI = {
  getProfile: () => apiClient.get('/user/profile')
}
```

**Step 3: 测试 API 调用**

运行: `npm run dev` 并在浏览器中测试用户信息获取
预期: API 调用正常，错误统一由拦截器处理

**Step 4: 提交**

```bash
git add src/modules/user/api/user.api.ts
git commit -m "refactor(user): use unified HTTP service

- 替换 axios 为 apiClient
- 移除模块级别的错误处理逻辑
- 统一由 HTTP 拦截器处理错误
"
```

---

### Task 5: 创建错误上报服务

**Files:**
- Create: `src/core/services/error-reporter.ts`

**Step 1: 创建错误上报服务**

```typescript
// src/core/services/error-reporter.ts

import type { ErrorResponse } from '@/types/error.types'

/**
 * 错误上报数据
 */
interface ErrorReport {
  errorCode: number
  errorMessage: string
  errorType: string
  url: string
  userAgent: string
  userId?: string
  timestamp: string
  stack?: string
  details?: Record<string, unknown>
}

/**
 * 错误上报服务
 */
class ErrorReporter {
  private endpoint = '/api/v1/errors/report'
  private queue: ErrorReport[] = []
  private maxQueueSize = 10
  private flushInterval = 30000 // 30 秒

  /**
   * 上报错误
   */
  report(error: ErrorResponse, context?: { userId?: string; url?: string }) {
    const report: ErrorReport = {
      errorCode: error.code,
      errorMessage: error.message,
      errorType: error.error,
      url: context?.url || window.location.href,
      userAgent: navigator.userAgent,
      userId: context?.userId || this.getUserId(),
      timestamp: error.timestamp || new Date().toISOString(),
      details: error.details
    }

    this.queue.push(report)

    // 达到批量上报阈值
    if (this.queue.length >= this.maxQueueSize) {
      this.flush()
    }
  }

  /**
   * 立即上报队列中的错误
   */
  async flush() {
    if (this.queue.length === 0) return

    const errors = [...this.queue]
    this.queue = []

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ errors }),
        keepalive: true // 使用 keepalive 确保页面关闭时也能上报
      })
    } catch (err) {
      // 上报失败，重新加入队列
      this.queue.unshift(...errors)
      console.error('Failed to report errors:', err)
    }
  }

  /**
   * 获取用户 ID
   */
  private getUserId(): string | undefined {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
      }
    } catch {
      // 忽略错误
    }
    return undefined
  }

  /**
   * 启动定时上报
   */
  start() {
    // 页面卸载时上报
    window.addEventListener('beforeunload', () => {
      this.flush()
    })

    // 定时上报
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }
}

// 导出单例
export const errorReporter = new ErrorReporter()

// 自动启动
if (import.meta.env.PROD) {
  errorReporter.start()
}
```

**Step 2: 在 HTTP 服务中集成错误上报**

修改 `src/core/services/http.service.ts`，在响应拦截器的错误处理部分添加错误上报：

```typescript
import { errorReporter } from './error-reporter'

// 在响应拦截器的错误处理部分
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<ErrorResponse>) => {
    const { response } = error

    if (!response) {
      // ... 网络错误处理
      return Promise.reject(error)
    }

    const errorData = response.data

    // 上报错误
    errorReporter.report(errorData)

    // ... 其他错误处理逻辑
  }
)
```

**Step 3: 提交**

```bash
git add src/core/services/error-reporter.ts src/core/services/http.service.ts
git commit -m "feat(core): add error reporting service

- 实现错误批量上报机制
- 支持定时和页面卸载时上报
- 集成到 HTTP 拦截器自动上报
"
```

---

## Part 2: 后端错误处理实现

### Task 6: 创建错误类型定义

**Files:**
- Create: `pkg/errors/errors.go`

**Step 1: 创建 Go 错误类型定义**

```go
// pkg/errors/errors.go

package errors

import (
	"fmt"
	"net/http"
)

// AppError 应用错误结构
type AppError struct {
	Code       int         `json:"code"`
	Message    string      `json:"message"`
	Error      string      `json:"error,omitempty"`
	Details    interface{} `json:"details,omitempty"`
	HTTPStatus int         `json:"-"`
}

// Error 实现 error 接口
func (e *AppError) Error() string {
	return fmt.Sprintf("[%d] %s: %s", e.Code, e.Error, e.Message)
}

// 错误码常量
const (
	ErrSuccess      = 0
	ErrParam        = 1001 // 通用参数错误
	ErrMissingParam = 1002
	ErrUnauthorized = 1003
	ErrForbidden    = 1004
	ErrNotFound     = 1005
	ErrInternal     = 5001
)

// 错误辅助函数

// InvalidParam 参数错误
func InvalidParam(format string, args ...interface{}) *AppError {
	return &AppError{
		Code:       ErrParam,
		Message:    fmt.Sprintf(format, args...),
		Error:      "INVALID_PARAM",
		HTTPStatus: http.StatusBadRequest,
	}
}

// MissingParam 缺少参数
func MissingParam(param string) *AppError {
	return &AppError{
		Code:       ErrMissingParam,
		Message:    fmt.Sprintf("缺少必需参数: %s", param),
		Error:      "MISSING_PARAM",
		HTTPStatus: http.StatusBadRequest,
	}
}

// Unauthorized 未授权
func Unauthorized(message string) *AppError {
	return &AppError{
		Code:       ErrUnauthorized,
		Message:    message,
		Error:      "UNAUTHORIZED",
		HTTPStatus: http.StatusUnauthorized,
	}
}

// Forbidden 无权限
func Forbidden(message string) *AppError {
	return &AppError{
		Code:       ErrForbidden,
		Message:    message,
		Error:      "FORBIDDEN",
		HTTPStatus: http.StatusForbidden,
	}
}

// NotFound 资源不存在
func NotFound(resource string) *AppError {
	return &AppError{
		Code:       ErrNotFound,
		Message:    fmt.Sprintf("%s 不存在", resource),
		Error:      "NOT_FOUND",
		HTTPStatus: http.StatusNotFound,
	}
}

// Internal 内部错误
func Internal(message string) *AppError {
	return &AppError{
		Code:       ErrInternal,
		Message:    message,
		Error:      "INTERNAL_ERROR",
		HTTPStatus: http.StatusInternalServerError,
	}
}
```

**Step 2: 保存文件**

运行: 手动保存文件 `pkg/errors/errors.go`
预期: 文件创建成功

**Step 3: 初始化 Go module**

```bash
cd Qingyu_backend
go mod init github.com/yukin/Qingyu_backend  # 如果还没初始化
go mod tidy
```

**Step 4: 提交**

```bash
git add pkg/errors/errors.go
git commit -m "feat(errors): define unified error types

- 定义 AppError 结构体
- 实现标准错误码常量
- 提供错误创建辅助函数
"
```

---

### Task 7: 创建错误处理中间件

**Files:**
- Create: `middleware/error_handler.go`

**Step 1: 创建 Gin 错误处理中间件**

```go
// middleware/error_handler.go

package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yukin/Qingyu_backend/pkg/errors"
)

// ErrorResponse 统一错误响应
type ErrorResponse struct {
	Code      int         `json:"code"`
	Message   string      `json:"message"`
	Error     string      `json:"error,omitempty"`
	Details   interface{} `json:"details,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// ErrorHandler 全局错误处理中间件
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// 捕获 panic
				c.JSON(http.StatusInternalServerError, ErrorResponse{
					Code:      errors.ErrInternal,
					Message:   "服务器内部错误",
					Error:     "INTERNAL_ERROR",
					Timestamp: currentTime(),
				})
				c.Abort()
			}
		}()

		c.Next()

		// 检查是否有错误
		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err

			// 处理 AppError
			if appErr, ok := err.(*errors.AppError); ok {
				c.JSON(appErr.HTTPStatus, ErrorResponse{
					Code:      appErr.Code,
					Message:   appErr.Message,
					Error:     appErr.Error,
					Details:   appErr.Details,
					Timestamp: currentTime(),
				})
				c.Abort()
				return
			}

			// 处理其他错误
			c.JSON(http.StatusInternalServerError, ErrorResponse{
				Code:      errors.ErrInternal,
				Message:   "服务器内部错误",
				Error:     "INTERNAL_ERROR",
				Timestamp: currentTime(),
			})
			c.Abort()
		}
	}
}

// AbortWithError 中止请求并返回错误
func AbortWithError(c *gin.Context, err *errors.AppError) {
	c.Error(err)
	c.Abort()
}

// currentTime 获取当前时间字符串
func currentTime() string {
	return time.Now().Format(time.RFC3339)
}
```

**Step 2: 修复导入（需要添加 time 包）**

在文件顶部添加：

```go
import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yukin/Qingyu_backend/pkg/errors"
)
```

**Step 3: 注册中间件到 Gin**

修改或创建 `cmd/server/main.go`：

```go
package main

import (
	"github.com/gin-gonic/gin"
	"github.com/yukin/Qingyu_backend/middleware"
)

func main() {
	r := gin.Default()

	// 注册全局错误处理中间件
	r.Use(middleware.ErrorHandler())

	// 注册路由
	// ...

	r.Run(":8080")
}
```

**Step 4: 测试中间件**

运行: `go run cmd/server/main.go`

在另一个终端测试：

```bash
curl http://localhost:8080/api/v1/test
```

预期: 返回标准错误响应

**Step 5: 提交**

```bash
git add middleware/error_handler.go cmd/server/main.go
git commit -m "feat(middleware): add global error handler

- 实现 ErrorHandler 中间件
- 捕获 panic 并返回标准错误响应
- 提供 AbortWithError 辅助函数
- 注册到 Gin 引擎
"
```

---

### Task 8: 更新 API 处理器使用统一错误处理

**Files:**
- Modify: 选择一个现有的 API 处理器文件，例如 `api/v1/user/user_api.go`

**Step 1: 读取现有用户 API 文件**

```bash
cat Qingyu_backend/api/v1/user/user_api.go
```

**Step 2: 更新处理器使用统一错误处理**

示例：假设原代码是：

```go
func GetProfile(c *gin.Context) {
    userID := c.Query("user_id")
    if userID == "" {
        c.JSON(400, gin.H{"error": "missing user_id"})
        return
    }
    // ...
}
```

修改为：

```go
package user

import (
	"github.com/gin-gonic/gin"
	"github.com/yukin/Qingyu_backend/pkg/errors"
	"github.com/yukin/Qingyu_backend/middleware"
)

func GetProfile(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		middleware.AbortWithError(c, errors.MissingParam("user_id"))
		return
	}

	// 获取用户信息逻辑
	user, err := userService.GetProfile(userID)
	if err != nil {
		middleware.AbortWithError(c, errors.NotFound("用户"))
		return
	}

	c.JSON(200, gin.H{
		"code": 0,
		"message": "成功",
		"data": user,
	})
}
```

**Step 3: 测试更新后的 API**

运行: `go run cmd/server/main.go`

测试：

```bash
curl http://localhost:8080/api/v1/user/profile
```

预期: 返回标准错误响应（缺少参数）

**Step 4: 提交**

```bash
git add api/v1/user/user_api.go
git commit -m "refactor(user): use unified error handling

- 替换直接返回错误为使用 middleware.AbortWithError
- 使用 pkg/errors 包的标准错误类型
- 统一错误响应格式
"
```

---

### Task 9: 添加错误日志记录

**Files:**
- Create: `pkg/logger/logger.go`

**Step 1: 创建日志包**

```go
// pkg/logger/logger.go

package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.Logger

// Init 初始化日志
func Init(env string) error {
	var config zap.Config

	if env == "production" {
		// 生产环境配置
		config = zap.Config{
			Level:       zap.NewAtomicLevelAt(zapcore.InfoLevel),
			Development: false,
			Sampling: &zap.SamplingConfig{
				Initial:    100,
				Thereafter: 100,
			},
			Encoding: "json",
			EncoderConfig: zapcore.EncoderConfig{
				TimeKey:        "timestamp",
				LevelKey:       "level",
				NameKey:        "logger",
				CallerKey:      "caller",
				MessageKey:     "msg",
				StacktraceKey:  "stacktrace",
				LineEnding:     zapcore.DefaultLineEnding,
				EncodeLevel:    zapcore.LowercaseLevelEncoder,
				EncodeTime:     zapcore.ISO8601TimeEncoder,
				EncodeDuration: zapcore.SecondsDurationEncoder,
				EncodeCaller:   zapcore.ShortCallerEncoder,
			},
			OutputPaths:      []string{"stdout", "/var/log/qingyu/app.log"},
			ErrorOutputPaths: []string{"stderr"},
		}
	} else {
		// 开发环境配置
		config = zap.Config{
			Level:            zap.NewAtomicLevelAt(zapcore.DebugLevel),
			Development:      true,
			Encoding:         "console",
			EncoderConfig:    zap.NewDevelopmentEncoderConfig(),
			OutputPaths:      []string{"stdout"},
			ErrorOutputPaths: []string{"stderr"},
		}
	}

	var err error
	Log, err = config.Build()
	if err != nil {
		return err
	}

	return nil
}

// Sync 同步日志
func Sync() {
	if Log != nil {
		_ = Log.Sync()
	}
}

// ErrorWithFields 记录带字段的错误
func ErrorWithFields(msg string, err error, fields ...zap.Field) {
	fields = append(fields, zap.Error(err))
	Log.Error(msg, fields...)
}

// InfoWithFields 记录带字段的信息
func InfoWithFields(msg string, fields ...zap.Field) {
	Log.Info(msg, fields...)
}
```

**Step 2: 安装依赖**

```bash
cd Qingyu_backend
go get -u go.uber.org/zap
go mod tidy
```

**Step 3: 在中间件中集成日志**

修改 `middleware/error_handler.go`：

```go
import (
	"github.com/yukin/Qingyu_backend/pkg/logger"
)

// 在 ErrorHandler 中添加日志记录
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Log.Error("panic recovered",
					zap.Any("error", err),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
				)
				// ... 返回错误响应
			}
		}()

		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err

			// 记录错误日志
			if appErr, ok := err.(*errors.AppError); ok {
				logger.Log.Error("API error",
					zap.Int("code", appErr.Code),
					zap.String("error", appErr.Error),
					zap.String("message", appErr.Message),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
				)
			}
			// ... 返回错误响应
		}
	}
}
```

**Step 4: 初始化日志**

修改 `cmd/server/main.go`：

```go
package main

import (
	"log"
	"os"

	"github.com/yukin/Qingyu_backend/pkg/logger"
)

func main() {
	// 初始化日志
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	if err := logger.Init(env); err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	// ... 其他初始化
}
```

**Step 5: 提交**

```bash
git add pkg/logger/logger.go middleware/error_handler.go cmd/server/main.go
git commit -m "feat(logger): add zap logger integration

- 实现 logger 包
- 在错误处理中间件中集成日志
- 在应用启动时初始化日志
- 支持开发和生产环境配置
"
```

---

## Part 3: 测试与文档

### Task 10: 编写错误处理测试

**Files:**
- Create: `src/composables/__tests__/useErrorHandler.spec.ts`
- Create: `pkg/errors/errors_test.go`

**Step 1: 编写前端 composable 测试**

```typescript
// src/composables/__tests__/useErrorHandler.spec.ts

import { describe, it, expect, vi } from 'vitest'
import { useErrorHandler } from '../useErrorHandler'
import type { ErrorResponse } from '@/types/error.types'

describe('useErrorHandler', () => {
  it('should handle API error correctly', () => {
    const { handleApiError } = useErrorHandler()

    const mockError: ErrorResponse = {
      code: 1001,
      message: '参数错误',
      error: 'INVALID_PARAM',
      timestamp: '2025-01-14T00:00:00Z'
    }

    const result = handleApiError({
      response: {
        data: mockError
      }
    } as unknown)

    expect(result).toEqual(mockError)
  })

  it('should handle standard Error', () => {
    const { handleApiError } = useErrorHandler()

    const error = new Error('Test error')
    const result = handleApiError(error)

    expect(result).not.toBeNull()
    expect(result?.message).toBe('Test error')
    expect(result?.code).toBe(5001)
  })

  it('should handle string error', () => {
    const { handleApiError } = useErrorHandler()

    const result = handleApiError('String error')

    expect(result).not.toBeNull()
    expect(result?.message).toBe('String error')
  })

  it('should clear error state', () => {
    const { state, showError, clearError } = useErrorHandler()

    const mockError: ErrorResponse = {
      code: 1001,
      message: 'Test',
      error: 'TEST',
      timestamp: '2025-01-14T00:00:00Z'
    }

    showError(mockError, 0)
    expect(state.value.error).not.toBeNull()

    clearError()
    expect(state.value.error).toBeNull()
  })
})
```

**Step 2: 编写后端错误测试**

```go
// pkg/errors/errors_test.go

package errors

import (
	"net/http"
	"testing"
)

func TestInvalidParam(t *testing.T) {
	err := InvalidParam("test %s", "param")

	if err.Code != ErrParam {
		t.Errorf("Expected code %d, got %d", ErrParam, err.Code)
	}

	if err.Message != "test param" {
		t.Errorf("Expected message 'test param', got '%s'", err.Message)
	}

	if err.Error != "INVALID_PARAM" {
		t.Errorf("Expected error type 'INVALID_PARAM', got '%s'", err.Error)
	}

	if err.HTTPStatus != http.StatusBadRequest {
		t.Errorf("Expected status %d, got %d", http.StatusBadRequest, err.HTTPStatus)
	}
}

func TestNotFound(t *testing.T) {
	err := NotFound("用户")

	if err.Code != ErrNotFound {
		t.Errorf("Expected code %d, got %d", ErrNotFound, err.Code)
	}

	if err.Message != "用户 不存在" {
		t.Errorf("Expected message '用户 不存在', got '%s'", err.Message)
	}

	if err.Error != "NOT_FOUND" {
		t.Errorf("Expected error type 'NOT_FOUND', got '%s'", err.Error)
	}
}

func TestUnauthorized(t *testing.T) {
	err := Unauthorized("请先登录")

	if err.Code != ErrUnauthorized {
		t.Errorf("Expected code %d, got %d", ErrUnauthorized, err.Code)
	}

	if err.HTTPStatus != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, err.HTTPStatus)
	}
}
```

**Step 3: 运行测试**

```bash
# 前端测试
cd Qingyu_fronted
npm test

# 后端测试
cd Qingyu_backend
go test ./pkg/errors/...
```

**Step 4: 提交**

```bash
git add src/composables/__tests__/useErrorHandler.spec.ts pkg/errors/errors_test.go
git commit -m "test: add error handling tests

- 添加前端 useErrorHandler 单元测试
- 添加后端 errors 包单元测试
- 覆盖主要错误场景
"
```

---

### Task 11: 更新 API 文档

**Files:**
- Create: `docs/api/error-handling/implementation-guide.md`

**Step 1: 创建实施指南文档**

```markdown
# 错误处理机制实施指南

> **版本**: v1.0
> **最后更新**: 2025-01-14

## 概述

本文档说明如何在前后端使用统一的错误处理机制。

## 前端使用指南

### 1. 在组件中使用 useErrorHandler

```typescript
<script setup lang="ts">
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleApiError, createErrorHandler } = useErrorHandler()

const fetchData = async () => {
  try {
    const data = await apiClient.get('/some/data')
    // 处理数据
  } catch (error) {
    handleApiError(error)
  }
}

// 或者使用预创建的处理器
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

所有使用 `apiClient` 的 API 调用都会自动通过拦截器处理错误：

```typescript
import apiClient from '@/core/services/http.service'

export const userAPI = {
  getProfile: () => apiClient.get('/user/profile')
  // 错误会自动被拦截器处理，无需手动 try-catch
}
```

### 3. 错误码参考

参见 [错误码手册](./error-codes.md) 获取完整错误码列表。

## 后端使用指南

### 1. 在处理器中使用统一错误

```go
package user

import (
    "github.com/gin-gonic/gin"
    "github.com/yukin/Qingyu_backend/pkg/errors"
    "github.com/yukin/Qingyu_backend/middleware"
)

func GetProfile(c *gin.Context) {
    userID := c.Query("user_id")
    if userID == "" {
        middleware.AbortWithError(c, errors.MissingParam("user_id"))
        return
    }

    user, err := service.GetProfile(userID)
    if err != nil {
        middleware.AbortWithError(c, errors.NotFound("用户"))
        return
    }

    c.JSON(200, gin.H{
        "code": 0,
        "message": "成功",
        "data": user,
    })
}
```

### 2. 记录错误日志

```go
import "github.com/yukin/Qingyu_backend/pkg/logger"

// 记录带字段的错误
logger.Log.Error("Failed to get user",
    zap.String("user_id", userID),
    zap.Error(err),
)

// 使用辅助函数
logger.ErrorWithFields("Failed to get user", err,
    zap.String("user_id", userID),
)
```

### 3. 创建自定义错误

```go
// 参数验证错误
if age < 0 {
    middleware.AbortWithError(c, errors.InvalidParam("年龄不能为负数"))
    return
}

// 权限错误
if !hasPermission {
    middleware.AbortWithError(c, errors.Forbidden("您没有权限访问此资源"))
    return
}
```

## 常见错误场景

### 场景 1: 表单验证

**前端:**

```typescript
const submitForm = async (formData: FormData) => {
  try {
    await apiClient.post('/user/profile', formData)
    ElMessage.success('保存成功')
  } catch (error) {
    // 拦截器会自动显示 1001 参数错误
  }
}
```

**后端:**

```go
func UpdateProfile(c *gin.Context) {
    var req UpdateProfileRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        middleware.AbortWithError(c, errors.InvalidParam("请求参数格式错误"))
        return
    }

    if len(req.Nickname) > 50 {
        middleware.AbortWithError(c, errors.InvalidParam("昵称不能超过50个字符"))
        return
    }

    // ... 更新逻辑
}
```

### 场景 2: 文件上传

**前端:**

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const result = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return result.url
  } catch (error) {
    // 拦截器会处理 1010 文件上传错误
    return null
  }
}
```

**后端:**

```go
func UploadFile(c *gin.Context) {
    file, err := c.FormFile("file")
    if err != nil {
        middleware.AbortWithError(c, errors.MissingParam("file"))
        return
    }

    // 验证文件大小
    if file.Size > 10*1024*1024 { // 10MB
        middleware.AbortWithError(c, errors.InvalidParam("文件大小不能超过10MB"))
        return
    }

    // ... 保存文件
}
```

### 场景 3: 分页查询

**前端:**

```typescript
const fetchList = async (page: number, pageSize: number) => {
  try {
    const result = await apiClient.get('/books', {
      params: { page, pageSize }
    })
    return result
  } catch (error) {
    handleApiError(error)
    return { items: [], total: 0 }
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
        middleware.AbortWithError(c, errors.InvalidParam("页码必须大于0"))
        return
    }

    // ... 查询逻辑
}
```

## 最佳实践

1. **统一使用**: 所有 API 调用都应使用 `apiClient`，不要直接使用 axios
2. **错误日志**: 后端所有错误都应记录到日志系统
3. **用户友好**: 错误信息应该清晰易懂，提供解决建议
4. **安全优先**: 生产环境不暴露敏感的系统信息
5. **及时上报**: 使用 `errorReporter` 上报前端错误

## 参考文档

- [错误码手册](./error-codes.md)
- [最佳实践](./best-practices.md)
- [快速参考](../quick-reference/)
```

**Step 2: 提交**

```bash
git add docs/api/error-handling/implementation-guide.md
git commit -m "docs: add error handling implementation guide

- 添加前后端使用指南
- 提供常见错误场景示例
- 包含最佳实践建议
"
```

---

### Task 12: 验证端到端错误处理流程

**Step 1: 启动前后端服务**

```bash
# 终端 1: 启动后端
cd Qingyu_backend
go run cmd/server/main.go

# 终端 2: 启动前端
cd Qingyu_fronted
npm run dev
```

**Step 2: 测试错误场景**

在浏览器中测试以下场景：

1. **未授权访问**:
   - 访问需要登录的页面
   - 预期: 自动跳转到登录页，显示"登录已过期"

2. **参数错误**:
   - 提交空表单
   - 预期: 显示"参数错误，请检查输入"

3. **资源不存在**:
   - 访问不存在的用户 ID
   - 预期: 显示"用户不存在"

4. **网络错误**:
   - 停止后端服务
   - 预期: 显示"网络连接失败，请检查网络"

**Step 3: 检查后端日志**

查看后端控制台，确认所有错误都被正确记录。

**Step 4: 提交验证**

```bash
git add .
git commit -m "test: verify end-to-end error handling

- 测试未授权访问场景
- 测试参数错误场景
- 测试资源不存在场景
- 测试网络错误场景
- 确认日志记录正确
"
```

---

## 验收标准

完成所有任务后，应该达到以下标准：

### 前端
- ✅ 所有 API 调用使用 `apiClient`
- ✅ 错误统一由拦截器处理
- ✅ 用户看到友好的错误提示
- ✅ 认证错误自动跳转登录页
- ✅ 令牌过期自动刷新
- ✅ 错误自动上报到后端

### 后端
- ✅ 所有 API 返回标准错误格式
- ✅ 使用 `pkg/errors` 包创建错误
- ✅ 错误通过 `middleware.AbortWithError` 返回
- ✅ 所有错误记录到日志
- ✅ Panic 被正确捕获和恢复

### 测试
- ✅ 单元测试覆盖主要功能
- ✅ 端到端测试验证完整流程
- ✅ 测试覆盖常见错误场景

### 文档
- ✅ API 文档更新完整
- ✅ 实施指南清晰易懂
- ✅ 代码示例可以直接使用

---

**返回：** [文档索引](../docs/plans/)

**相关技能：** @superpowers:executing-plans, @superpowers:test-driven-development
