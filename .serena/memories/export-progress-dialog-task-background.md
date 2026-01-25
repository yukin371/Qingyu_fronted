# ExportProgressDialog 组件任务背景

## 任务目标
创建导出进度对话框组件，显示导出任务的进度和状态。

## 项目信息
- 主目录：E:\Github\Qingyu
- 前端子模块：Qingyu_fronted
- 当前分支：feature/frontend-tailwind-refactor
- 技术栈：Vue 3.3+ (Composition API), Tailwind CSS 3.x, TypeScript 5.0+

## 已完成的依赖
1. export API已统一：`src/modules/writer/api/export.ts`
2. export类型定义：`src/modules/writer/types/export.ts`
3. ExportFormatDialog组件已完成（参考样式和交互模式）

## 组件功能需求

### Props
```typescript
interface Props {
  modelValue: boolean  // 控制显示/隐藏
  taskId: string       // 导出任务ID
  autoRefresh?: boolean // 是否自动刷新（默认true）
}
```

### Emits
```typescript
interface Emits {
  'update:modelValue': [value: boolean]
  'download': [taskId: string]  // 用户点击下载按钮
  'close': []
}
```

### UI设计
- 固定定位对话框（fixed inset-0 z-50）
- 毛玻璃背景（bg-black/50 backdrop-blur-sm）
- 白色卡片容器（max-w-md）
- 头部：标题"导出进度"
- 内容区：进度条、状态文本、文件信息
- 底部按钮：根据状态显示不同按钮

### 状态轮询
- 定时轮询任务状态（每2秒）
- 完成后停止轮询
- 失败后停止轮询
- 组件销毁时清除定时器

### 状态映射
- pending -> 0%
- processing -> 根据progress字段
- completed -> 100%
- failed -> 显示错误信息

## 实现文件
- `src/modules/writer/components/ExportProgressDialog.vue`
