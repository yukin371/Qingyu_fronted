# API文档完善设计方案

> **创建日期：** 2025-01-14
> **设计目标：** 建立前后端协作文档体系，解决接口字段不明确和错误处理不规范问题

## 一、设计目标

### 核心目标
- **开发者协作优先** - 为新加入的开发者提供清晰的API接口文档，方便前后端对接和开发
- **前后端并重** - 既包含前端调用指南，也包含后端实现说明，作为对接的共同参考

### 主要痛点
1. 接口字段不明确
2. 错误码和错误处理不规范

## 二、文档架构

### 目录结构

```
docs/api/
├── quick-reference/       # 快速参考（5分钟找到接口）
│   ├── authentication.md  # 认证接口速查
│   ├── bookstore.md       # 书城接口速查
│   ├── reader.md          # 阅读器接口速查
│   ├── writer.md          # 写作接口速查
│   ├── user.md            # 用户接口速查
│   └── social.md          # 社交接口速查
│
├── data-models/           # 数据模型定义（解决字段不明确）
│   ├── request-models.md  # 请求模型（所有接口的字段定义）
│   ├── response-models.md # 响应模型（返回数据的字段定义）
│   └── common-types.md    # 通用类型（分页、排序等）
│
├── error-handling/        # 错误处理（两层结构）
│   ├── error-codes.md     # 完整错误码参考手册
│   └── best-practices.md  # 错误处理最佳实践
│
├── guides/                # 详细指南（分层文档）
│   ├── authentication/    # 认证模块详细文档
│   │   ├── login.md      # 快速版+详细版
│   │   ├── register.md
│   │   └── refresh-token.md
│   ├── bookstore/        # 书城模块详细文档
│   ├── reader/           # 阅读器模块详细文档
│   ├── writer/           # 写作模块详细文档
│   ├── user/             # 用户模块详细文档
│   └── social/           # 社交模块详细文档
│
└── examples/              # 代码示例
    ├── frontend/         # 前端调用示例
    │   ├── api-gateway.service.ts
    │   ├── user.api.ts
    │   └── auth-store.ts
    └── backend/          # 后端实现示例
        ├── error_handler.go
        └── auth_api.go
```

## 三、数据模型定义

### 请求模型格式

```markdown
# 数据模型 / 请求模型

## 1. 认证模块

### 1.1 用户登录

**接口：** `POST /api/v1/auth/login`

| 字段 | 类型 | 必填 | 说明 | 验证规则 | 示例 |
|------|------|------|------|----------|------|
| username | string | ✓ | 用户名 | 3-20字符，字母数字下划线 | "zhangsan" |
| password | string | ✓ | 密码 | SHA256加密后的字符串 | "8d969eef6ecad3c..." |
| captcha_id | string | ✗ | 验证码ID | 生产环境必填 | "uuid-xxx" |
| captcha_text | string | ✗ | 验证码文本 | 4位字符 | "A3B9" |

**TypeScript 定义：**
\`\`\`typescript
interface LoginRequest {
  username: string;           // 用户名，3-20字符
  password: string;           // SHA256加密后的密码
  captcha_id?: string;        // 验证码ID（生产必填）
  captcha_text?: string;      // 验证码文本
}
\`\`\`
```

### 响应模型格式

```markdown
# 数据模型 / 响应模型

## 1. 认证模块

### 1.1 用户登录响应

| 字段 | 类型 | 必含 | 说明 | 示例 |
|------|------|------|------|------|
| code | number | ✓ | 响应码，0表示成功 | 0 |
| message | string | ✓ | 响应消息 | "登录成功" |
| data | object | ✓ | 响应数据 | 见下方 |
| data.token | string | ✓ | JWT访问令牌 | "eyJhbGc..." |
| data.refresh_token | string | ✓ | 刷新令牌 | "eyJhbGc..." |
| data.expires_in | number | ✓ | 令牌过期时间（秒） | 3600 |
| data.user | object | ✓ | 用户信息 | 见下方 |
| data.user.id | string | ✓ | 用户ID | "user-xxx" |
| data.user.username | string | ✓ | 用户名 | "zhangsan" |

**TypeScript 定义：**
\`\`\`typescript
interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    refresh_token: string;
    expires_in: number;
    user: {
      id: string;
      username: string;
    };
  };
}
\`\`\`
```

## 四、错误码体系

### 编码规则
- **格式：** `[模块码][类别码][具体码]` (4位数字)
- **模块码：**
  - 1 = 通用/基础
  - 2 = 认证授权
  - 3 = 书城模块
  - 4 = 阅读器模块
  - 5 = 写作模块
  - 6 = 用户模块
  - 7 = 社交模块
- **类别码：**
  - 0 = 成功
  - 1 = 参数错误
  - 2 = 权限错误
  - 3 = 资源不存在
  - 4 = 业务逻辑错误
  - 5 = 系统错误

### 通用错误码 (1000-1999)

| 错误码 | HTTP状态码 | 错误类型 | 错误信息 | 说明 | 前端处理建议 |
|--------|-----------|---------|---------|------|-------------|
| 0000 | 200 | SUCCESS | "操作成功" | 请求成功处理 | - |
| 1001 | 400 | INVALID_PARAM | "参数错误" | 请求参数格式或值不正确 | 检查请求参数 |
| 1002 | 400 | MISSING_PARAM | "缺少必需参数" | 缺少必填的请求参数 | 补充缺失参数 |
| 1003 | 401 | UNAUTHORIZED | "未授权访问" | 未提供有效认证信息 | 跳转登录页面 |
| 1004 | 403 | FORBIDDEN | "无权访问" | 认证成功但无权限访问 | 提示权限不足 |
| 1005 | 404 | NOT_FOUND | "资源不存在" | 请求的资源不存在 | 返回上一页或404页面 |
| 1006 | 409 | CONFLICT | "资源冲突" | 资源已存在或状态冲突 | 提示用户冲突原因 |
| 1007 | 429 | RATE_LIMIT | "请求过于频繁" | 超过速率限制 | 稍后重试 |
| 1008 | 500 | INTERNAL_ERROR | "服务器内部错误" | 服务器处理异常 | 提示稍后重试或联系客服 |
| 1009 | 503 | SERVICE_UNAVAILABLE | "服务暂时不可用" | 服务维护或过载 | 提示稍后重试 |

### 认证模块错误码 (2000-2999)

| 错误码 | HTTP状态码 | 错误类型 | 错误信息 | 说明 | 前端处理建议 |
|--------|-----------|---------|---------|------|-------------|
| 2001 | 400 | INVALID_USERNAME | "用户名格式错误" | 用户名不符合3-20字符规则 | 提示用户名格式要求 |
| 2002 | 400 | WEAK_PASSWORD | "密码强度不足" | 密码不符合安全要求 | 提示密码强度要求 |
| 2003 | 401 | LOGIN_FAILED | "用户名或密码错误" | 登录凭证不正确 | 提示还剩N次机会 |
| 2004 | 403 | ACCOUNT_LOCKED | "账号已被锁定" | 账号因多次错误被锁定 | 提示解锁方式 |
| 2005 | 401 | TOKEN_EXPIRED | "登录已过期" | Token已过期 | 引导重新登录 |
| 2006 | 401 | TOKEN_INVALID | "登录信息无效" | Token格式错误或已失效 | 清除本地token，重新登录 |
| 2007 | 403 | PERMISSION_DENIED | "权限不足" | 无操作权限 | 提示需要更高权限 |
| 2008 | 409 | USERNAME_EXISTS | "用户名已存在" | 注册时用户名重复 | 提示更换用户名 |
| 2009 | 409 | EMAIL_EXISTS | "邮箱已被使用" | 注册时邮箱重复 | 提示更换邮箱或找回密码 |
| 2010 | 400 | CAPTCHA_ERROR | "验证码错误" | 验证码不正确或已过期 | 刷新验证码，重试 |

### 书城模块错误码 (3000-3999)

| 错误码 | HTTP状态码 | 错误类型 | 错误信息 | 说明 | 前端处理建议 |
|--------|-----------|---------|---------|------|-------------|
| 3001 | 404 | BOOK_NOT_FOUND | "书籍不存在" | 指定书籍ID不存在 | 返回书籍列表或推荐其他书籍 |
| 3002 | 404 | CHAPTER_NOT_FOUND | "章节不存在" | 指定章节不存在 | 返回目录或上一章 |
| 3003 | 403 | CHAPTER_LOCKED | "章节未解锁" | 需要付费或订阅才能阅读 | 引导购买或订阅 |
| 3004 | 403 | BOOK_NOT_PURCHASED | "未购买本书" | 需要购买才能阅读 | 引导购买 |
| 3005 | 400 | INVALID_BOOK_ID | "书籍ID格式错误" | 书籍ID格式不正确 | 检查路由参数 |

### 错误响应格式

```json
{
  "code": 2003,
  "message": "用户名或密码错误",
  "error": "LOGIN_FAILED",
  "details": {
    "remaining_attempts": 3,
    "lock_time": null
  },
  "timestamp": "2025-01-14T10:30:00Z"
}
```

## 五、前端错误处理

### Axios拦截器统一处理

```typescript
// src/core/services/api-gateway.service.ts

import axios, { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<ErrorResponse>) => {
    const { response } = error

    if (!response) {
      ElMessage.error('网络连接失败，请检查网络')
      return Promise.reject(error)
    }

    const { code, message } = response.data

    switch (code) {
      case 1003: // UNAUTHORIZED
      case 2005: // TOKEN_EXPIRED
      case 2006: // TOKEN_INVALID
        ElMessage.warning('登录已过期，请重新登录')
        localStorage.removeItem('token')
        window.location.href = '/login'
        break

      case 1004: // FORBIDDEN
        ElMessage.error('您没有权限执行此操作')
        break

      case 2004: // ACCOUNT_LOCKED
        ElMessage.error('账号已被锁定，请联系客服')
        break

      case 2010: // CAPTCHA_ERROR
        ElMessage.error('验证码错误，请重新输入')
        eventBus.emit('refreshCaptcha')
        break

      case 3003: // CHAPTER_LOCKED
        ElMessage.info('此章节需要解锁后才能阅读')
        router.push(`/purchase?chapter=${response.data.details?.chapter_id}`)
        break

      default:
        ElMessage.error(message || '操作失败，请稍后重试')
    }

    return Promise.reject(error)
  }
)
```

### 错误处理Hook

```typescript
// src/composables/useErrorHandler.ts

interface ErrorHandlerOptions {
  showMessage?: boolean
  defaultMessage?: string
  onError?: (error: ApiError) => void
}

export function useErrorHandler() {
  const handleError = (error: ApiError, options: ErrorHandlerOptions = {}) => {
    const {
      showMessage = true,
      defaultMessage = '操作失败',
      onError
    } = options

    if (onError) {
      onError(error)
    }

    if (showMessage) {
      const message = error.message || defaultMessage
      ElMessage.error(message)
    }

    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        code: error.code,
        message: error.message,
        error: error.error,
        details: error.details
      })
    }
  }

  return { handleError }
}
```

## 六、后端错误处理

### 错误码定义（Go）

```go
// pkg/errors/codes.go

package errors

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
    ErrUnavailable   = 1009

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
    ErrInvalidBookID     = 3005
)

type AppError struct {
    Code       int         `json:"code"`
    Message    string      `json:"message"`
    Error      string      `json:"error"`
    Details    interface{} `json:"details,omitempty"`
    HTTPStatus int         `json:"-"`
}

func (e *AppError) Error() string {
    return e.Message
}

func New(code int, message string) *AppError {
    return &AppError{Code: code, Message: message}
}

func NewWithDetails(code int, message string, details interface{}) *AppError {
    return &AppError{
        Code:    code,
        Message: message,
        Details: details,
    }
}

func InvalidParam(format string, args ...interface{}) *AppError {
    return &AppError{
        Code:       ErrParam,
        Message:    fmt.Sprintf(format, args...),
        Error:      "INVALID_PARAM",
        HTTPStatus: 400,
    }
}

func Unauthorized(message string) *AppError {
    return &AppError{
        Code:       ErrUnauthorized,
        Message:    message,
        Error:      "UNAUTHORIZED",
        HTTPStatus: 401,
    }
}
```

### 全局错误处理中间件

```go
// api/middleware/error_handler.go

package middleware

import (
    "github.com/gin-gonic/gin"
    "qingyu/pkg/errors"
)

func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()

        if len(c.Errors) > 0 {
            err := c.Errors.Last().Err

            if appErr, ok := err.(*errors.AppError); ok {
                response := gin.H{
                    "code":      appErr.Code,
                    "message":   appErr.Message,
                    "error":     appErr.Error,
                    "timestamp": time.Now().Format(time.RFC3339),
                }

                if appErr.Details != nil {
                    response["details"] = appErr.Details
                }

                c.JSON(appErr.HTTPStatus, response)
                return
            }

            c.JSON(500, gin.H{
                "code":      errors.ErrInternal,
                "message":   "服务器内部错误",
                "error":     "INTERNAL_ERROR",
                "timestamp": time.Now().Format(time.RFC3339),
            })
        }
    }
}
```

### API中使用

```go
// api/v1/auth_api.go

func (api *AuthAPI) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.Error(errors.InvalidParam("请求参数格式错误: %v", err))
        return
    }

    if !isValidUsername(req.Username) {
        c.Error(errors.NewWithError(
            errors.ErrInvalidUsername,
            "用户名格式错误",
            "INVALID_USERNAME",
        ))
        return
    }

    user, err := api.userService.GetByUsername(req.Username)
    if err != nil {
        c.Error(errors.NewWithDetails(
            errors.ErrLoginFailed,
            "用户名或密码错误",
            gin.H{
                "remaining_attempts": 3,
                "lock_time": nil,
            },
        ))
        return
    }

    // 登录成功
    c.JSON(200, gin.H{
        "code":    0,
        "message": "登录成功",
        "data":    tokenData,
    })
}
```

## 七、文档分层展示

### 快速参考格式

```markdown
# 快速参考 / 认证模块

## 用户登录

**接口：** `POST /api/v1/auth/login`

**请求：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✓ | 用户名 |
| password | string | ✓ | 密码(SHA256) |

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT访问令牌 |
| expires_in | number | 过期时间(秒) |

**错误码：** 2001-2010
**详细文档：** [查看详细指南](../guides/authentication/login.md)
```

### 详细指南格式

```markdown
# 详细指南 / 认证模块 / 用户登录

## 快速版

### 基本信息
- **接口：** `POST /api/v1/auth/login`
- **认证：** 不需要
- **限流：** 5次/分钟

### 请求参数
| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|----------|
| username | string | ✓ | 用户名 | 3-20字符，字母数字下划线 |
| password | string | ✓ | 密码 | SHA256加密后的字符串 |

### 响应数据
| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT访问令牌 |
| expires_in | number | 过期时间(秒) |

## 详细版

### 业务逻辑

1. **参数验证** - 检查用户名格式、密码加密
2. **用户查询** - 根据用户名查询用户记录
3. **状态检查** - 检查账号是否被锁定
4. **密码验证** - 使用bcrypt验证密码
5. **生成Token** - 生成JWT访问令牌

### 完整请求示例

\`\`\`bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "zhangsan", "password": "8d969eef..."}'
\`\`\`

### 前端集成示例

\`\`\`typescript
const handleLogin = async () => {
  const response = await authAPI.login({
    username: form.value.username,
    password: await sha256(form.value.password),
  })
  this.token = response.data.token
}
\`\`\`

### 常见问题

**Q: 为什么前端要SHA256加密密码？**
A: 避免明文密码在网络传输。

**Q: Token过期怎么办？**
A: 使用refresh_token刷新，或重新登录。

### 相关接口
- [用户注册](./register.md)
- [刷新Token](./refresh-token.md)
```

## 八、文档维护策略

### 接口变更检查清单

当修改API时，必须更新对应文档：

- [ ] 更新快速参考中的接口定义
- [ ] 更新数据模型（字段变更）
- [ ] 更新错误码（新增或修改）
- [ ] 更新详细指南中的示例
- [ ] 更新变更日志

### 文档审查机制

**Pull Request 检查点：**
- API代码变更 → 检查对应文档是否同步更新
- 新增接口 → 必须包含文档更新
- 废弃接口 → 标记为 Deprecated，保留6个月后删除

### 文档版本管理

```markdown
# docs/api/CHANGELOG.md

## [Unreleased]

### Added
- 新增用户头像上传接口 `POST /users/{id}/avatar`

### Changed
- 登录接口新增验证码参数 `captcha_id`

### Deprecated
- `GET /books/recommend` 旧推荐接口

## [1.2.0] - 2025-01-10
- 新增段落评论功能接口
```

## 九、实施计划

### 阶段1：基础框架搭建（1周）
- 创建文档目录结构
- 定义错误码体系
- 编写错误处理最佳实践
- 实施后端错误处理中间件

### 阶段2：核心模块文档（2周）
- 认证模块完整文档
- 书城模块完整文档
- 阅读器模块完整文档
- 前端API调用封装示例

### 阶段3：完善和优化（1周）
- 其他模块文档
- 代码示例完善
- 文档审查和修订

### 阶段4：自动化工具（可选）
- Swagger/OpenAPI集成
- 文档自动生成脚本
- 接口差异检测工具

## 十、验收标准

### 文档完整性
- ✓ 所有接口都有快速参考
- ✓ 所有接口都有详细指南
- ✓ 所有字段都有明确的类型定义
- ✓ 所有错误码都有说明和处理建议

### 文档质量
- ✓ 示例代码可以直接运行
- ✓ 错误场景有明确说明
- ✓ 前后端对接要求明确
- ✓ 文档格式统一规范

### 实用性
- ✓ 新开发者能在5分钟内找到需要的接口
- ✓ 能根据文档完成前后端对接
- ✓ 错误处理有完整的代码示例
- ✓ 文档更新流程清晰
