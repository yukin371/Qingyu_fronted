# API 认证问题诊断

**诊断时间**: 2025-10-31  
**问题**: 所有 API 调用返回 401 UNAUTHORIZED

---

## 🔍 问题分析

### 症状
```
{
  code: 'UNAUTHORIZED',
  message: '未登录或登录已过期，请重新登录',
  statusCode: 401,
  timestamp: 1761911799904
}
```

### 出现位置
- `banners.ts:21` - 记录 Banner 点击
- `BannerCarousel.vue` - Banner 轮播组件
- 所有 API 调用都返回 401

### 根本原因分析

#### 可能原因 1: ✅ 后端 API 正在运行
```
后端已启动，但要求认证
```

#### 可能原因 2: ❌ 前端未发送 JWT Token
```
API 调用时没有在请求头中包含 token
或 token 为空/无效
```

#### 可能原因 3: ❌ Token 已过期或无效
```
localStorage 中的 token 已过期
或 token 格式不正确
```

#### 可能原因 4: ❌ 后端 JWT 验证配置问题
```
后端 JWT 密钥配置错误
或 token 验证逻辑有问题
```

---

## 🔧 诊断步骤

### Step 1: 检查前端 Token 存储

打开浏览器 DevTools (F12):
```javascript
// 在 Console 中运行
localStorage.getItem('token')
localStorage.getItem('refreshToken')

// 检查 Pinia Store
// 打开 Vue DevTools > Stores > auth > token
```

**期望结果**:
- token 应该是一个 JWT 字符串（格式: `xxxxx.xxxxx.xxxxx`）
- 如果为 null 或空字符串，说明登录失败

### Step 2: 检查 HTTP 请求头

打开浏览器网络选项卡 (F12 > Network):
```
1. 查找任何 API 请求
2. 点击请求查看详情
3. 检查 Request Headers 中是否包含:
   - Authorization: Bearer <token>
   - Content-Type: application/json
```

**期望结果**:
```
Authorization: Bearer eyJhbGc...
```

如果没有 `Authorization` 头，说明前端未发送 token。

### Step 3: 验证 httpService 配置

查看 `http.service.ts` 中的请求拦截器:

**应该包含**:
```typescript
// Request interceptor 中应该添加 token
const token = localStorage.getItem('token')
if (token) {
  config.headers.Authorization = `Bearer ${token}`
}
```

### Step 4: 测试后端认证 API

```bash
# 测试 1: 不带 token，应该返回 401
curl http://localhost:8080/api/v1/bookstore/recommended-books

# 测试 2: 带 token，应该返回数据
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:8080/api/v1/bookstore/recommended-books

# 测试 3: 获取 token
curl -X POST http://localhost:8080/api/v1/shared/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

---

## ✅ 解决方案

### 方案 1: 后端允许公开 API（推荐用于开发）

**问题**: 首页 Banner 点击等操作不需要认证

**解决**: 后端配置某些路由为公开（不需要 JWT 验证）

```go
// 在后端路由中配置
// 公开路由（不需要认证）
publicRoutes := []string{
  "/api/v1/bookstore/recommended-books",
  "/api/v1/bookstore/featured-books",
  "/api/v1/bookstore/rankings",
  "/api/v1/bookstore/homepage",
  "/api/v1/banners/click", // 记录 banner 点击
}

// 在 JWT 中间件中检查
if isInPublicRoutes(path) {
  return next() // 允许不带 token 访问
}
```

### 方案 2: 前端自动获取 Token（用于测试）

创建测试用 token:

```typescript
// 在 main.ts 或 App.vue 中
const setupTestToken = async () => {
  try {
    // 登录获取 token
    const response = await httpService.post('/shared/auth/login', {
      email: 'test@example.com',
      password: '123456'
    })
    
    // 保存 token
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }
  } catch (error) {
    console.error('Failed to get test token:', error)
  }
}

onMounted(() => {
  setupTestToken()
})
```

### 方案 3: 前端请求拦截器添加 Token（应该已有）

验证 `http.service.ts` 中的拦截器:

```typescript
// 请求拦截器
this.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})
```

---

## 📝 快速修复清单

### 后端需要做:

- [ ] **检查 JWT 中间件是否正确配置**
  ```bash
  # 查看后端日志
  docker logs qingyu-backend
  # 或
  tail -f backend.log
  ```

- [ ] **配置公开路由**
  ```go
  // bookstore API 应该不需要认证
  // 因为这是首页内容
  ```

- [ ] **验证 JWT 密钥**
  ```bash
  # 确保后端和前端的 JWT 密钥一致
  echo $JWT_SECRET  # 检查环境变量
  ```

- [ ] **检查 CORS 和认证顺序**
  ```
  CORS 中间件 → 日志 → 认证 → 路由
  ```

### 前端需要做:

- [ ] **验证 token 存储**
  ```javascript
  // 在浏览器 Console 中
  console.log(localStorage.getItem('token'))
  console.log(useAuthStore().token)
  ```

- [ ] **检查请求头**
  ```
  F12 > Network > 选择任何 API 请求 > Headers
  查看 Authorization 头
  ```

- [ ] **验证 httpService 拦截器**
  ```typescript
  // src/core/services/http.service.ts
  // 确保请求拦截器添加了 token
  ```

---

## 🔄 完整工作流

### 用户登录流程

```
1. 用户访问登录页面 (/auth)
   ↓
2. 输入用户名和密码
   ↓
3. 调用 POST /api/v1/shared/auth/login
   ↓
4. 后端验证凭证，返回 token 和 user 信息
   ↓
5. 前端保存 token 到 localStorage
   ↓
6. 前端 store 更新 isLoggedIn = true
   ↓
7. 后续 API 调用自动在请求头中附加 token
```

### 未登录用户访问首页

```
当前问题:
1. 用户直接访问首页 (/bookstore)
   ↓
2. 页面加载 Banner
   ↓
3. 调用 POST /api/v1/banners/click (需要认证)
   ↓
4. 返回 401，因为没有 token
```

**解决方案**: Banner 点击不应该需要认证

---

## 🚀 建议的后端修复

```go
// middleware/auth.go 或类似位置

// 定义不需要认证的公开路由
var publicRoutes = map[string]bool{
  "GET:/api/v1/bookstore/recommended-books": true,
  "GET:/api/v1/bookstore/featured-books": true,
  "GET:/api/v1/bookstore/rankings": true,
  "GET:/api/v1/bookstore/homepage": true,
  "GET:/api/v1/bookstore/categories": true,
  "POST:/api/v1/banners/click": true, // 不需要认证
  "GET:/api/v1/banners": true,
  // 其他公开路由...
}

// JWT 中间件
func JWTAuthMiddleware() gin.HandlerFunc {
  return func(c *gin.Context) {
    path := c.Request.Method + ":" + c.Request.URL.Path
    
    // 检查是否是公开路由
    if publicRoutes[path] {
      c.Next()
      return
    }
    
    // 需要认证的路由，验证 token
    token := c.GetHeader("Authorization")
    if token == "" {
      c.JSON(401, gin.H{
        "code": "UNAUTHORIZED",
        "message": "未登录或登录已过期，请重新登录",
      })
      c.Abort()
      return
    }
    
    // 验证 JWT...
    c.Next()
  }
}
```

---

## 📊 状态总结

| 组件 | 状态 | 问题 | 修复方案 |
|------|------|------|---------|
| 前端 | ✅ 运行中 | 无 token | 需要登录或后端允许公开 |
| 后端 | ✅ 运行中 | 401 验证 | 配置公开路由 |
| API | ✅ 可访问 | 需要认证 | 修改中间件配置 |
| 认证 | ❌ 未登录 | 无 token | 用户需要登录 |

---

## 🔗 相关文件

**前端认证**:
- `src/stores/auth.ts` - 认证状态管理
- `src/core/services/http.service.ts` - HTTP 拦截器
- `src/api/shared/auth.ts` - 认证 API

**后端认证** (需要检查):
- `middleware/jwt.go` 或 `middleware/auth.go` - JWT 验证
- `routes/` - 路由注册
- `config/` - JWT 配置

---

## ✨ 下一步行动

**立即** (后端):
1. [ ] 检查后端是否正确配置了公开路由
2. [ ] 验证 JWT 中间件逻辑
3. [ ] 确保 bookstore API 不需要认证（或使用 guest token）

**检查** (前端):
1. [ ] 验证 localStorage 中是否有 token
2. [ ] 检查 http 请求头是否包含 Authorization
3. [ ] 验证 httpService 拦截器是否正确

**测试**:
1. [ ] 尝试直接登录获取 token
2. [ ] 然后测试其他 API 是否工作
3. [ ] 或配置 bookstore API 为公开

---

**关键点**: 
- 后端 API 已运行 ✅
- 问题是认证验证 ⚠️
- 需要后端配置公开路由或前端获取 token 📋

