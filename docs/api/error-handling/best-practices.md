# 错误处理最佳实践

> **版本**: v1.0
> **最后更新**: 2025-01-14

## 目录

- [概述](#概述)
- [前端错误处理](#前端错误处理)
- [后端错误处理](#后端错误处理)
- [常见错误处理场景](#常见错误处理场景)
- [错误监控与日志](#错误监控与日志)

---

## 概述

### 错误处理的重要性

良好的错误处理机制对于应用程序的稳定性和用户体验至关重要：

1. **用户体验**: 提供清晰的错误提示，引导用户正确操作
2. **调试效率**: 详细的错误日志帮助快速定位问题
3. **系统稳定性**: 优雅地处理异常，避免应用崩溃
4. **安全性**: 避免泄露敏感的系统信息

### 错误处理原则

| 原则 | 说明 |
|------|------|
| **快速失败** | 检测到错误立即返回，不要继续执行 |
| **用户友好** | 错误信息清晰易懂，提供解决建议 |
| **统一格式** | 前后端使用统一的错误响应格式 |
| **日志记录** | 记录详细的错误信息用于调试 |
| **安全优先** | 生产环境不暴露敏感信息 |

---

## 前端错误处理

### Axios 拦截器统一处理

```typescript
// src/core/services/http.service.ts

import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

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
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 统一返回 data 字段
    return response.data
  },
  (error: AxiosError<ErrorResponse>) => {
    const { response } = error

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

    // 根据错误码分类处理
    switch (code) {
      // 认证错误 - 跳转登录
      case 1003: // UNAUTHORIZED
      case 2005: // TOKEN_EXPIRED
      case 2006: // TOKEN_INVALID
        ElMessage.warning('登录已过期，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        break

      // 权限错误
      case 1004: // FORBIDDEN
      case 2007: // PERMISSION_DENIED
        ElMessage.error('您没有权限执行此操作')
        break

      // 账号锁定
      case 2004: // ACCOUNT_LOCKED
        ElMessage.error('账号已被锁定，请联系客服')
        break

      // 验证码错误
      case 2010: // CAPTCHA_ERROR
        ElMessage.error('验证码错误，请重新输入')
        // 触发验证码刷新事件
        eventBus.emit('refreshCaptcha')
        break

      // 资源不存在
      case 1005: // NOT_FOUND
      case 3001: // BOOK_NOT_FOUND
      case 4001: // CHAPTER_NOT_FOUND
        ElMessage.warning(message || '请求的资源不存在')
        break

      // 节解锁错误
      case 3003: // CHAPTER_LOCKED
      case 4002: // CHAPTER_LOCKED (Reader)
        ElMessage.info('此章节需要解锁后才能阅读')
        // 跳转到购买页面
        router.push({
          path: '/purchase',
          query: { chapter: response.data.details?.chapter_id }
        })
        break

      // 速率限制
      case 1007: // RATE_LIMIT
        ElMessage.warning('请求过于频繁，请稍后再试')
        break

      // 版本冲突
      case 5022: // VERSION_CONFLICT
      case 5023: // AUTOSAVE_CONFLICT
        // 特殊处理，不在拦截器中显示错误
        break

      // 默认错误
      default:
        ElMessage.error(message || '操作失败，请稍后重试')
    }

    // 开发环境打印详细错误
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        code,
        message,
        error: errorType,
        details: response.data.details,
        url: response.config.url,
        method: response.config.method
      })
    }

    return Promise.reject(response.data)
  }
)

// 错误响应类型
interface ErrorResponse {
  code: number
  message: string
  error?: string
  details?: any
  timestamp?: string
}
```

### 错误处理 Hook

```typescript
// src/composables/useErrorHandler.ts

import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export interface ApiError {
  code: number
  message: string
  error?: string
  details?: any
}

export interface ErrorHandlerOptions {
  showMessage?: boolean
  defaultMessage?: string
  onError?: (error: ApiError) => void
}

export function useErrorHandler() {
  const isLoading = ref(false)
  const error = ref<ApiError | null>(null)

  /**
   * 处理API错误
   */
  const handleError = (err: any, options: ErrorHandlerOptions = {}) => {
    const {
      showMessage = true,
      defaultMessage = '操作失败，请稍后重试',
      onError
    } = options

    // 构造错误对象
    const apiError: ApiError = {
      code: err?.code || err?.response?.status || 500,
      message: err?.message || defaultMessage,
      error: err?.error,
      details: err?.details
    }

    error.value = apiError

    // 调用自定义错误处理
    if (onError) {
      onError(apiError)
    }

    // 显示错误消息
    if (showMessage && apiError.message) {
      // 特殊错误类型不显示消息
      const silentErrors = [5023] // 自动保存冲突
      if (!silentErrors.includes(apiError.code)) {
        ElMessage.error(apiError.message)
      }
    }

    // 开发环境打印详细错误
    if (import.meta.env.DEV) {
      console.error('[Error]', {
        code: apiError.code,
        message: apiError.message,
        error: apiError.error,
        details: apiError.details
      })
    }

    return apiError
  }

  /**
   * 清除错误状态
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 异步操作包装器
   */
  const withErrorHandling = async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    isLoading.value = true
    clearError()

    try {
      return await asyncFn()
    } catch (err) {
      handleError(err, options)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    handleError,
    clearError,
    withErrorHandling
  }
}
```

### 使用示例

```typescript
// 在组件中使用错误处理

<script setup lang="ts">
import { ref } from 'vue'
import { userAPI } from '@/modules/user/api/user.api'
import { useErrorHandler } from '@/composables/useErrorHandler'

const { isLoading, error, withErrorHandling } = useErrorHandler()

const userProfile = ref(null)

// 方式1: 使用包装器
const loadProfile = async () => {
  const result = await withErrorHandling(
    () => userAPI.getProfile(),
    {
      defaultMessage: '加载用户信息失败'
    }
  )

  if (result) {
    userProfile.value = result
  }
}

// 方式2: 手动处理
const updateProfile = async (data: any) => {
  try {
    await userAPI.updateProfile(data)
    ElMessage.success('更新成功')
  } catch (err) {
    // useErrorHandler 会自动处理
    console.log('错误已由拦截器处理')
  }
}
</script>
```

### 特殊场景处理

#### 自动保存冲突处理

```typescript
// 处理编辑器自动保存冲突

const handleAutoSave = async (content: string, version: number) => {
  try {
    await editorApi.autoSave(documentId.value, { content, version })
  } catch (err: any) {
    if (err.code === 5023) { // AUTOSAVE_CONFLICT
      // 显示冲突解决对话框
      showConflictDialog({
        message: '文档已被修改，是否覆盖？',
        onConfirm: async () => {
          await forceSave(content)
        },
        onCancel: () => {
          // 重新加载最新内容
          await loadDocumentContent()
        }
      })
    }
  }
}
```

#### 令牌刷新处理

```typescript
// 处理令牌过期自动刷新

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

// 添加等待刷新的请求
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

// 刷新成功后通知所有等待的请求
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

// 响应拦截器中处理
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { config, response } = error

    if (!response) return Promise.reject(error)

    const { code } = response.data

    // Token过期错误
    if (code === 2005 && !config._retry) {
      config._retry = true

      if (isRefreshing) {
        // 正在刷新，将请求加入队列
        return new Promise(resolve => {
          subscribeTokenRefresh((token: string) => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(config))
          })
        })
      }

      isRefreshing = true

      try {
        // 刷新token
        const { data } = await apiClient.post('/auth/refresh', {
          refresh_token: localStorage.getItem('refreshToken')
        })

        const { token, refresh_token } = data

        // 更新本地存储
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refresh_token)

        // 通知所有等待的请求
        onRefreshed(token)

        // 重试当前请求
        config.headers.Authorization = `Bearer ${token}`
        return apiClient(config)
      } catch (refreshError) {
        // 刷新失败，跳转登录
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

---

## 后端错误处理

### Go 错误定义

```go
// pkg/errors/codes.go

package errors

import "fmt"

// 错误码常量
const (
    // 通用错误码 1000-1999
    Success          = 0
    ErrParam         = 1001
    ErrMissingParam  = 1002
    ErrUnauthorized  = 1003
    ErrForbidden     = 1004
    ErrNotFound      = 1005
    ErrConflict      = 1006
    ErrRateLimit     = 1007
    ErrInternal      = 1008

    // 认证模块错误码 2000-2999
    ErrInvalidUsername    = 2001
    ErrWeakPassword       = 2002
    ErrLoginFailed        = 2003
    ErrAccountLocked      = 2004
    ErrTokenExpired       = 2005
    ErrTokenInvalid       = 2006
    ErrPermissionDenied   = 2007
    ErrUsernameExists     = 2008
    ErrEmailExists        = 2009
    ErrCaptchaError       = 2010

    // 书城模块错误码 3000-3999
    ErrBookNotFound      = 3001
    ErrChapterNotFound   = 3002
    ErrChapterLocked     = 3003
    ErrBookNotPurchased  = 3004
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
    return e.Message
}

// 创建错误的辅助函数

// New 创建基础错误
func New(code int, message string) *AppError {
    return &AppError{
        Code:    code,
        Message: message,
    }
}

// NewWithDetails 创建带详情的错误
func NewWithDetails(code int, message string, details interface{}) *AppError {
    return &AppError{
        Code:    code,
        Message: message,
        Details: details,
    }
}

// InvalidParam 参数错误
func InvalidParam(format string, args ...interface{}) *AppError {
    return &AppError{
        Code:       ErrParam,
        Message:    fmt.Sprintf(format, args...),
        Error:      "INVALID_PARAM",
        HTTPStatus: 400,
    }
}

// Unauthorized 未授权
func Unauthorized(message string) *AppError {
    return &AppError{
        Code:       ErrUnauthorized,
        Message:    message,
        Error:      "UNAUTHORIZED",
        HTTPStatus: 401,
    }
}

// Forbidden 无权限
func Forbidden(message string) *AppError {
    return &AppError{
        Code:       ErrForbidden,
        Message:    message,
        Error:      "FORBIDDEN",
        HTTPStatus: 403,
    }
}

// NotFound 资源不存在
func NotFound(resource string) *AppError {
    return &AppError{
        Code:       ErrNotFound,
        Message:    fmt.Sprintf("%s不存在", resource),
        Error:      "NOT_FOUND",
        HTTPStatus: 404,
    }
}

// Internal 内部错误
func Internal(message string) *AppError {
    return &AppError{
        Code:       ErrInternal,
        Message:    message,
        Error:      "INTERNAL_ERROR",
        HTTPStatus: 500,
    }
}
```

### 全局错误处理中间件

```go
// middleware/error_handler.go

package middleware

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "Qingyu_backend/pkg/errors"
)

// ErrorResponse 统一错误响应
type ErrorResponse struct {
    Code      int         `json:"code"`
    Message   string      `json:"message"`
    Error     string      `json:"error,omitempty"`
    Details   interface{} `json:"details,omitempty"`
    Timestamp string      `json:"timestamp"`
    Path      string      `json:"path,omitempty"`
}

// ErrorHandler 全局错误处理中间件
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()

        // 检查是否有错误
        if len(c.Errors) == 0 {
            return
        }

        // 获取最后一个错误
        err := c.Errors.Last().Err

        // 类型断言，判断是否为 AppError
        appErr, ok := err.(*errors.AppError)
        if !ok {
            // 未知错误，返回内部错误
            c.JSON(http.StatusInternalServerError, ErrorResponse{
                Code:      errors.ErrInternal,
                Message:   "服务器内部错误",
                Error:     "INTERNAL_ERROR",
                Timestamp: currentTime(),
                Path:      c.Request.URL.Path,
            })
            return
        }

        // 设置HTTP状态码
        if appErr.HTTPStatus != 0 {
            c.JSON(appErr.HTTPStatus, ErrorResponse{
                Code:      appErr.Code,
                Message:   appErr.Message,
                Error:     appErr.Error,
                Details:   appErr.Details,
                Timestamp: currentTime(),
                Path:      c.Request.URL.Path,
            })
            return
        }

        // 根据错误码设置HTTP状态码
        statusCode := getHTTPStatusByCode(appErr.Code)
        c.JSON(statusCode, ErrorResponse{
            Code:      appErr.Code,
            Message:   appErr.Message,
            Error:     appErr.Error,
            Details:   appErr.Details,
            Timestamp: currentTime(),
            Path:      c.Request.URL.Path,
        })
    }
}

// 根据错误码获取HTTP状态码
func getHTTPStatusByCode(code int) int {
    switch {
    case code == 0:
        return http.StatusOK
    case code >= 1001 && code <= 1002:
        return http.StatusBadRequest
    case code == 1003:
        return http.StatusUnauthorized
    case code == 1004:
        return http.StatusForbidden
    case code == 1005:
        return http.StatusNotFound
    case code == 1006:
        return http.StatusConflict
    case code == 1007:
        return http.StatusTooManyRequests
    default:
        return http.StatusInternalServerError
    }
}

// 当前时间（ISO 8601）
func currentTime() string {
    return time.Now().Format(time.RFC3339)
}
```

### 业务中使用错误处理

```go
// api/v1/auth/auth_api.go

package auth

import (
    "github.com/gin-gonic/gin"
    "Qingyu_backend/pkg/errors"
)

type LoginRequest struct {
    Username string `json:"username" binding:"required,min=3,max=20"`
    Password string `json:"password" binding:"required"`
}

// Login 用户登录
func (api *AuthAPI) Login(c *gin.Context) {
    var req LoginRequest

    // 参数绑定和验证
    if err := c.ShouldBindJSON(&req); err != nil {
        c.Error(errors.InvalidParam("参数错误: %v", err))
        return
    }

    // 调用业务逻辑
    user, err := api.service.Login(c.Request.Context(), req.Username, req.Password)
    if err != nil {
        // 判断错误类型并返回相应错误
        if err == ErrInvalidCredentials {
            c.Error(errors.NewWithDetails(
                errors.ErrLoginFailed,
                "用户名或密码错误",
                gin.H{"remaining_attempts": 3},
            ))
            return
        }

        if err == ErrAccountLocked {
            c.Error(errors.NewWithDetails(
                errors.ErrAccountLocked,
                "账号已被锁定",
                gin.H{"lock_time": "30分钟"},
            ))
            return
        }

        // 其他错误
        c.Error(errors.Internal("登录失败"))
        return
    }

    // 生成令牌
    token, err := generateToken(user)
    if err != nil {
        c.Error(errors.Internal("生成令牌失败"))
        return
    }

    // 返回成功响应
    c.JSON(http.StatusOK, gin.H{
        "code":    0,
        "message": "登录成功",
        "data": gin.H{
            "token": token,
            "user":  user,
        },
    })
}
```

### Gin 中间件集成

```go
// main.go 或 router 初始化

func setupRouter() *gin.Engine {
    r := gin.Default()

    // 注册全局错误处理中间件
    r.Use(middleware.ErrorHandler())
    r.Use(middleware.Recovery())

    // 注册其他中间件
    r.Use(middleware.CORS())
    r.Use(middleware.Logger())

    // API 路由
    v1 := r.Group("/api/v1")
    {
        auth := v1.Group("/auth")
        {
            auth.POST("/login", authAPI.Login)
            auth.POST("/register", authAPI.Register)
        }
    }

    return r
}
```

---

## 常见错误处理场景

### 1. 表单验证错误

```typescript
// 前端表单验证
const validateForm = (data: any): string | null => {
  if (!data.username) {
    return '请输入用户名'
  }
  if (data.username.length < 3 || data.username.length > 20) {
    return '用户名长度应为3-20个字符'
  }
  if (!data.password) {
    return '请输入密码'
  }
  if (data.password.length < 6) {
    return '密码长度不能少于6位'
  }
  return null
}

// 在提交前验证
const handleSubmit = async () => {
  const error = validateForm(formData.value)
  if (error) {
    ElMessage.error(error)
    return
  }

  await withErrorHandling(() => authAPI.register(formData.value))
}
```

### 2. 文件上传错误

```typescript
const handleFileUpload = async (file: File) => {
  // 前端验证
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过5MB')
    return
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持JPG、PNG、GIF格式')
    return
  }

  // 上传文件
  const formData = new FormData()
  formData.append('file', file)

  try {
    const result = await uploadAPI.uploadAvatar(formData)
    // 处理成功
  } catch (err) {
    // 错误已在拦截器中处理
    if (err.code === 6010) {
      ElMessage.error('不支持的文件格式')
    } else if (err.code === 6011) {
      ElMessage.error('文件过大')
    }
  }
}
```

### 3. 分页加载错误

```typescript
const loadData = async (page: number) => {
  try {
    const result = await bookAPI.getBookList({ page, size: 20 })

    if (result.data.length === 0 && page > 1) {
      ElMessage.warning('没有更多数据了')
      return
    }

    // 处理数据
  } catch (err) {
    if (err.code === 1007) {
      // 速率限制，延迟重试
      setTimeout(() => loadData(page), 2000)
    }
  }
}
```

---

## 错误监控与日志

### 前端错误上报

```typescript
// src/utils/errorReporter.ts

interface ErrorReport {
  type: 'api' | 'js' | 'resource'
  code?: number
  message: string
  stack?: string
  url: string
  userAgent: string
  userId?: string
  timestamp: number
}

class ErrorReporter {
  private endpoint = '/api/v1/error/report'

  report(report: ErrorReport) {
    // 开发环境不上报
    if (import.meta.env.DEV) {
      console.log('[Error Report]', report)
      return
    }

    // 使用 sendBeacon 避免阻塞页面卸载
    navigator.sendBeacon(
      this.endpoint,
      JSON.stringify(report)
    )
  }

  reportApiError(error: ApiError, url: string) {
    this.report({
      type: 'api',
      code: error.code,
      message: error.message,
      url,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
      timestamp: Date.now()
    })
  }

  reportJsError(error: ErrorEvent) {
    this.report({
      type: 'js',
      message: error.message,
      stack: error.error?.stack,
      url: error.filename,
      userAgent: navigator.userAgent,
      userId: localStorage.getItem('userId') || undefined,
      timestamp: Date.now()
    })
  }
}

export const errorReporter = new ErrorReporter()

// 全局错误监听
window.addEventListener('error', (e) => {
  errorReporter.reportJsError(e)
})

// 全局 Promise 错误监听
window.addEventListener('unhandledrejection', (e) => {
  errorReporter.report({
    type: 'js',
    message: e.reason?.message || 'Promise rejected',
    url: location.href,
    userAgent: navigator.userAgent,
    userId: localStorage.getItem('userId') || undefined,
    timestamp: Date.now()
  })
})
```

### 后端日志记录

```go
// pkg/logger/logger.go

package logger

import (
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

var Log *zap.Logger

// Init 初始化日志
func Init(env string) error {
    var config zap.Config

    if env == "production" {
        // 生产环境配置
        config = zap.NewProductionConfig()
        config.EncoderConfig.TimeKey = "timestamp"
        config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
    } else {
        // 开发环境配置
        config = zap.NewDevelopmentConfig()
        config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
    }

    log, err := config.Build()
    if err != nil {
        return err
    }

    Log = log
    return nil
}

// ErrorWithFields 记录带字段的错误
func ErrorWithFields(msg string, fields ...zap.Field) {
    Log.Error(msg, fields...)
}

// InfoWithFields 记录带字段的信息
func InfoWithFields(msg string, fields ...zap.Field) {
    Log.Info(msg, fields...)
}

// 使用示例
// logger.ErrorWithFields("用户登录失败",
//     zap.String("username", username),
//     zap.Int("attempts", attempts),
//     zap.Error(err),
// )
```

---

## 相关文档

- [错误码参考手册](error-codes.md)
- [数据模型定义](../data-models/request-models.md)
- [前端集成指南](../frontend/前端集成指南.md)
