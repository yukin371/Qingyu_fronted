# API类型修正脚本说明

## 问题
响应拦截器已经解包APIResponse，所以API函数应该直接返回数据类型T，而不是APIResponse<T>。

## 需要修改的文件

### 1. src/api/bookstore.ts
所有方法的返回类型需要去掉 `APIResponse` 包装。

### 2. src/api/reading/reader.ts  
所有方法的返回类型需要去掉 `APIResponse` 包装。

### 3. src/api/reading/comments.ts
所有方法的返回类型需要去掉 `APIResponse` 包装。

### 4. src/api/recommendation.ts
所有方法的返回类型需要去掉 `APIResponse` 包装。

### 5. src/api/shared/*.ts
所有共享服务API方法需要去掉 `APIResponse` 包装。

## 修改模式

### 修改前：
```typescript
async getBookById(id: string): Promise<APIResponse<Book>> {
  return request.get<APIResponse<Book>>(`/bookstore/books/${id}`)
}
```

### 修改后：
```typescript
async getBookById(id: string): Promise<Book> {
  return request.get(`/bookstore/books/${id}`)
}
```

## 注意事项

1. PaginatedResponse 保持不变（它本身就是特殊的响应格式）
2. 向后兼容函数也需要同步修改
3. 移除 request.get/post 中的泛型参数 `<APIResponse<T>>`

## 自动化建议

可以使用以下正则表达式辅助替换：

**查找**：`Promise<APIResponse<([^>]+)>>`  
**替换**：`Promise<$1>`

**查找**：`request\.(get|post|put|delete)<APIResponse<([^>]+)>>`  
**替换**：`request.$1`

然后手动检查和调整。

