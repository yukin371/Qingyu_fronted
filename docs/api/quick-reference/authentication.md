# 认证模块快速参考

> 最后更新：2025-01-14
> 模块版本：v1.0
> 错误码范围：2000-2999

## 接口列表

### 用户登录
**接口：** `POST /api/v1/shared/auth/login`

**请求：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✓ | 用户名（3-20字符） |
| password | string | ✓ | 密码（明文，前端需加密） |

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT访问令牌 |
| refreshToken | string | 刷新令牌 |
| user | object | 用户信息 |
| expiresAt | string | 过期时间（ISO 8601） |
| permissions | string[] | 权限列表 |
| roles | string[] | 角色列表 |

**错误码：** 2003, 2004, 2010, 2005
**详细文档：** [查看详细指南](../guides/authentication/login.md)

---

### 用户注册
**接口：** `POST /api/v1/shared/auth/register`

**请求：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✓ | 用户名（3-20字符） |
| email | string | ✓ | 邮箱地址 |
| password | string | ✓ | 密码（6位以上） |
| nickname | string | ✗ | 昵称 |

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | JWT访问令牌 |
| refreshToken | string | 刷新令牌 |
| user | object | 用户信息 |
| expiresAt | string | 过期时间 |

**错误码：** 2001, 2002, 2008, 2009
**详细文档：** [查看详细指南](../guides/authentication/register.md)

---

### 刷新Token
**接口：** `POST /api/v1/shared/auth/refresh`

**请求：** 无需请求体（需携带refreshToken在Authorization头）

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| token | string | 新的JWT访问令牌 |
| expiresAt | string | 过期时间 |
| refreshToken | string | 新的刷新令牌（可选） |

**错误码：** 2005, 2006
**详细文档：** [查看详细指南](../guides/authentication/refresh-token.md)

---

### 退出登录
**接口：** `POST /api/v1/shared/auth/logout`

**请求：** 无需请求体

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| message | string | "退出成功" |

**错误码：** 1003, 1005
**详细文档：** [查看详细指南](../guides/authentication/logout.md)

---

### 修改密码
**接口：** `PUT /api/v1/users/password`

**请求：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| old_password | string | ✓ | 原密码 |
| new_password | string | ✓ | 新密码（6位以上） |

**响应：**
| 字段 | 类型 | 说明 |
|------|------|------|
| message | string | "密码修改成功" |

**错误码：** 2003, 2002
**详细文档：** [查看详细指南](../guides/authentication/change-password.md)

---

## 错误码速查

| 错误码 | HTTP状态 | 错误类型 | 说明 | 前端处理 |
|--------|---------|---------|------|---------|
| 2001 | 400 | INVALID_USERNAME | 用户名格式错误 | 提示用户名要求 |
| 2002 | 400 | WEAK_PASSWORD | 密码强度不足 | 提示密码要求 |
| 2003 | 401 | LOGIN_FAILED | 用户名或密码错误 | 提示剩余次数 |
| 2004 | 403 | ACCOUNT_LOCKED | 账号已被锁定 | 提示联系客服 |
| 2005 | 401 | TOKEN_EXPIRED | Token已过期 | 引导重新登录 |
| 2006 | 401 | TOKEN_INVALID | Token无效 | 清除本地token |
| 2008 | 409 | USERNAME_EXISTS | 用户名已存在 | 提示更换用户名 |
| 2009 | 409 | EMAIL_EXISTS | 邮箱已被使用 | 提示更换邮箱 |
| 2010 | 400 | CAPTCHA_ERROR | 验证码错误 | 刷新验证码 |

---

## 相关接口

- **用户信息：** `GET /api/v1/users/profile`
- **更新用户信息：** `PUT /api/v1/users/profile`
- **获取用户权限：** `GET /api/v1/shared/auth/permissions`
- **获取用户角色：** `GET /api/v1/shared/auth/roles`

---

## 前端调用示例

```typescript
import { sharedAuthAPI } from '@/modules/shared/api/auth'

// 登录
const login = async () => {
  const response = await sharedAuthAPI.login({
    username: 'zhangsan',
    password: 'password123'
  })
  console.log('登录成功', response.token)
}

// 注册
const register = async () => {
  const response = await sharedAuthAPI.register({
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    password: 'password123',
    nickname: '小张'
  })
  console.log('注册成功', response.token)
}

// 刷新Token
const refresh = async () => {
  const response = await sharedAuthAPI.refreshToken()
  console.log('新Token', response.token)
}

// 退出登录
const logout = async () => {
  await sharedAuthAPI.logout()
  console.log('退出成功')
}

// 修改密码
const changePassword = async () => {
  await sharedAuthAPI.changePassword({
    old_password: 'oldpass',
    new_password: 'newpass'
  })
  console.log('密码修改成功')
}
```

---

## 注意事项

1. **Token过期处理**：前端应监听401错误，自动调用refresh接口刷新token
2. **密码安全**：前端传输密码前应进行SHA256加密（当前版本使用明文）
3. **刷新Token**：refreshToken应妥善存储，用于token过期时刷新
4. **并发请求**：多个请求同时token过期时，应确保只调用一次refresh接口
