# Upload 组件开发任务背景

## 任务目标
为 Tailwind UI 设计系统创建 Upload 上传组件。

## 组件规格

### Upload.vue
文件上传组件。

**Props:**
- `action`: string - 上传地址
- `method`: string - 上传方法 (GET, POST, PUT, DELETE)
- `headers`: Headers - 请求头
- `data`: Record<string, any> - 额外参数
- `name`: string - 文件字段名
- `accept`: string - 接受的文件类型
- `multiple`: boolean - 多选
- `disabled`: boolean - 禁用状态
- `limit`: number - 上传数量限制
- `fileList`: FileItem[] - 文件列表
- `drag`: boolean - 拖拽上传
- `autoUpload`: boolean - 自动上传

**Events:**
- `update:fileList` - 文件列表更新
- `change` - 文件状态改变
- `success` - 上传成功
- `error` - 上传失败
- `progress` - 上传进度
- `preview` - 预览文件

**Slots:**
- `default` - 触发器内容
- `trigger` - 触发按钮
- `tip` - 提示信息
- `file` - 文件列表项

## 技术要求

1. 组件文件: `src/design-system/form/Upload/Upload.vue`
2. 类型定义: `src/design-system/form/Upload/types.ts`
3. Storybook: `src/design-system/form/Upload/Upload.stories.ts`
4. 单元测试: `tests/unit/design-system/form/Upload.test.ts`
5. README 文档: `src/design-system/form/Upload/README.md`
6. 导出文件: `src/design-system/form/Upload/index.ts`
7. 更新主导出: `src/design-system/form/index.ts`

## 开发模式
参考 Input、Select 等现有表单组件的开发模式：
- 使用 CVA (class-variance-authority) 管理样式变体
- TypeScript 类型定义
- Storybook 故事文档
- Vitest 单元测试
- 完整的 Props/Events/Slots 支持
