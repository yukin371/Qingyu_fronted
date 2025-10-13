# [API名称] 接口文档

> **说明**：这是API接口文档的标准模板，请根据实际情况填写各部分内容，删除所有说明性文字。

## 1. 接口概述

### 1.1 接口简介

[简要描述接口的用途和功能]

### 1.2 业务场景

[描述接口应用的业务场景]

### 1.3 注意事项

- 注意1：[例如：需要认证token]
- 注意2：[例如：有频率限制]

## 2. 基本信息

| 属性 | 值 |
|------|-----|
| 请求方式 | GET / POST / PUT / DELETE |
| 请求地址 | /api/v1/[endpoint] |
| 内容类型 | application/json |
| 是否需要认证 | 是 / 否 |

## 3. 请求参数

### 3.1 路径参数

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 资源ID | "123456" |

### 3.2 查询参数

| 参数名 | 类型 | 必填 | 默认值 | 说明 | 示例 |
|--------|------|------|--------|------|------|
| page | number | 否 | 1 | 页码 | 1 |
| size | number | 否 | 20 | 每页数量 | 20 |
| keyword | string | 否 | - | 搜索关键词 | "搜索词" |

### 3.3 请求头

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| Authorization | string | 是 | 认证token | "Bearer xxx" |
| Content-Type | string | 是 | 内容类型 | "application/json" |

### 3.4 请求体

```json
{
  "field1": "value1",
  "field2": 123,
  "field3": {
    "nested": "value"
  },
  "field4": [
    "item1",
    "item2"
  ]
}
```

**字段说明**：

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| field1 | string | 是 | 字段说明 |
| field2 | number | 否 | 字段说明 |
| field3 | object | 否 | 嵌套对象 |
| field4 | array | 否 | 数组字段 |

## 4. 响应格式

### 4.1 成功响应

**响应码**：200

**响应体**：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "123456",
    "name": "示例数据",
    "items": [
      {
        "id": "1",
        "title": "项目1"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100
    }
  }
}
```

**字段说明**：

| 字段路径 | 类型 | 说明 |
|---------|------|------|
| code | number | 状态码 |
| message | string | 响应消息 |
| data | object | 响应数据 |
| data.id | string | 数据ID |
| data.name | string | 数据名称 |
| data.items | array | 数据列表 |
| data.pagination | object | 分页信息 |

### 4.2 错误响应

**响应码**：400 / 401 / 403 / 404 / 500

**响应体**：

```json
{
  "code": 400,
  "message": "请求参数错误",
  "data": null,
  "error": {
    "field": "email",
    "reason": "邮箱格式不正确"
  }
}
```

## 5. 状态码说明

| 状态码 | 说明 | 处理建议 |
|--------|------|----------|
| 200 | 成功 | 正常处理响应数据 |
| 400 | 请求参数错误 | 检查请求参数 |
| 401 | 未授权 | 重新登录获取token |
| 403 | 禁止访问 | 检查用户权限 |
| 404 | 资源不存在 | 检查请求路径或资源ID |
| 429 | 请求过于频繁 | 降低请求频率 |
| 500 | 服务器内部错误 | 联系技术支持 |

## 6. 使用示例

### 6.1 JavaScript (Axios)

```javascript
import axios from 'axios'

// 请求示例
const getData = async () => {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/endpoint',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        size: 20
      },
      data: {
        field1: 'value1',
        field2: 123
      }
    })
    
    console.log('成功:', response.data)
    return response.data
  } catch (error) {
    console.error('失败:', error.response?.data)
    throw error
  }
}
```

### 6.2 Vue 3 Composition API

```vue
<script setup>
import { ref } from 'vue'
import { apiService } from '@/api/service'

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await apiService.getData({
      page: 1,
      size: 20
    })
    data.value = response.data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>
```

### 6.3 cURL命令

```bash
curl -X POST \
  'http://api.example.com/api/v1/endpoint?page=1&size=20' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "field1": "value1",
    "field2": 123
  }'
```

## 7. 业务规则

### 7.1 数据验证规则

- 规则1：[例如：email必须符合邮箱格式]
- 规则2：[例如：密码长度8-20位]
- 规则3：[例如：手机号必须是11位数字]

### 7.2 业务约束

- 约束1：[例如：同一用户每天最多请求100次]
- 约束2：[例如：单次查询最多返回100条数据]

### 7.3 特殊处理

[描述特殊的业务处理逻辑]

## 8. 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 响应时间 | < 200ms | 95%请求的响应时间 |
| 并发量 | 1000 QPS | 支持的并发请求数 |
| 超时时间 | 10s | 请求超时时间 |

## 9. 安全说明

### 9.1 认证方式

[描述接口的认证方式，如JWT、OAuth等]

### 9.2 权限要求

[描述接口需要的权限级别]

### 9.3 数据加密

[描述敏感数据的加密方式]

## 10. 测试用例

### 10.1 正常场景测试

**测试场景**：正常获取数据

**请求参数**：
```json
{
  "page": 1,
  "size": 20
}
```

**预期结果**：返回200状态码和数据列表

### 10.2 异常场景测试

**测试场景**：参数错误

**请求参数**：
```json
{
  "page": -1,
  "size": 0
}
```

**预期结果**：返回400状态码和错误信息

## 11. 变更记录

### v1.1.0 (YYYY-MM-DD)
- 新增：[新增字段或功能]
- 变更：[变更内容]
- 废弃：[废弃的字段或功能]

### v1.0.0 (YYYY-MM-DD)
- 初始版本发布

## 12. 相关文档

- [后端API设计文档](链接)
- [前端集成指南](链接)
- [错误码对照表](链接)

---

**文档版本**：v1.0.0  
**创建时间**：YYYY-MM-DD  
**最后更新**：YYYY-MM-DD  
**文档作者**：[作者姓名]  
**后端负责人**：[负责人姓名]

