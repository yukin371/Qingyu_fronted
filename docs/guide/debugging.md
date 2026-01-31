# 调试与故障排查指南

本文档说明开发中的调试技巧和常见问题的解决方法。

## 浏览器开发工具

### Chrome DevTools

**打开方式**：

- Windows/Linux: `F12` 或 `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

**常用面板**：

- **Elements**：查看DOM结构和样式
- **Console**：查看日志和错误
- **Sources**：调试JavaScript代码
- **Network**：查看网络请求
- **Vue**：Vue DevTools（需安装扩展）

## Vue DevTools

### 安装

- Chrome: [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/firefox/addon/vue-js-devtools/)

### 功能

**1. Components**

- 查看组件树
- 检查组件props和data
- 修改组件状态（实时预览）

**2. Pinia**

- 查看所有Store状态
- 查看State变化历史
- 手动修改State
- 时间旅行调试

**3. Router**

- 查看当前路由
- 查看路由历史
- 查看路由参数

**4. Timeline**

- 查看事件时间线
- 性能分析

## 调试技巧

### Console调试

```javascript
// 基础输出
console.log('普通日志')
console.info('信息')
console.warn('警告')
console.error('错误')

// 对象输出
console.log('用户:', user)
console.table([{name: 'Alice', age: 20}, {name: 'Bob', age: 25}])

// 分组输出
console.group('用户信息')
console.log('姓名:', user.name)
console.log('年龄:', user.age)
console.groupEnd()

// 计时
console.time('fetchBooks')
await fetchBooks()
console.timeEnd('fetchBooks')

// 断言
console.assert(user.age > 18, '用户必须年满18岁')

// 追踪调用栈
console.trace('调用栈')
```

### 断点调试

```javascript
// 代码中设置断点
debugger

// 条件断点（在DevTools中设置）
// 右键代码行号 -> Add conditional breakpoint
// 例如：i === 10
```

### 组件调试

```vue
<script setup>
import { watchEffect } from 'vue'

// 监听所有响应式变化
watchEffect(() => {
  console.log('books changed:', books.value)
})

// 组件挂载时调试
onMounted(() => {
  console.log('组件已挂载')
  console.log('Props:', props)
  console.log('Refs:', refs)
})

// 监听特定数据
watch(() => props.bookId, (newId, oldId) => {
  console.log(`bookId changed: ${oldId} -> ${newId}`)
})
</script>
```

## 常见问题排查

### 1. 组件不更新

**问题**：修改数据但视图不更新

**原因**：

- 直接修改数组/对象
- 没有使用响应式API

**解决**：

```javascript
// ❌ 错误
state.books[0] = newBook  // 不会触发更新
state.user.name = 'Alice'  // 不会触发更新（浅层响应）

// ✅ 正确
state.books = [...state.books.slice(0, 0), newBook, ...state.books.slice(1)]
// 或
state.books[0] = newBook  // Vue 3 支持
state.user.name = 'Alice'  // 使用reactive时正常工作
```

### 2. Props未传递

**问题**：子组件收不到props

**排查**：

```vue
<!-- 父组件 -->
<template>
  <ChildComponent :book="book" />
  <!-- 检查：book是否有值？拼写是否正确？ -->
</template>

<!-- 子组件 -->
<script setup>
const props = defineProps({
  book: Object
})

// 调试
console.log('收到的props:', props.book)
</script>
```

### 3. 事件不触发

**问题**：子组件emit的事件父组件收不到

**排查**：

```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits(['book-click'])  // kebab-case

const handleClick = () => {
  console.log('发出事件: book-click')
  emit('book-click', book)  // 检查事件名
}
</script>

<!-- 父组件 -->
<template>
  <!-- 使用 kebab-case -->
  <ChildComponent @book-click="handleBookClick" />
  <!-- 检查：事件名是否一致？方法是否定义？ -->
</template>
```

### 4. API请求失败

**排查步骤**：

1. **检查Network面板**

```
- Status: 200? 404? 500?
- Response: 返回了什么数据？
- Headers: Token是否正确？
```

2. **检查请求URL**

```javascript
console.log('请求URL:', config.url)
console.log('完整URL:', config.baseURL + config.url)
```

3. **检查请求参数**

```javascript
console.log('请求参数:', config.params)
console.log('请求体:', config.data)
```

4. **检查响应拦截器**

```javascript
// 在拦截器中打印
request.interceptors.response.use(
  response => {
    console.log('响应数据:', response.data)
    return response
  }
)
```

### 5. 路由跳转失败

**排查**：

```javascript
// 检查路由配置
console.log('所有路由:', router.getRoutes())

// 检查当前路由
console.log('当前路由:', route)

// 检查路由参数
console.log('路由参数:', route.params)
console.log('查询参数:', route.query)

// 监听路由错误
router.onError((error) => {
  console.error('路由错误:', error)
})
```

### 6. 样式不生效

**排查**：

1. **检查scoped**

```vue
<!-- 影响子组件需要用:deep() -->
<style scoped>
:deep(.child-class) {
  color: red;
}
</style>
```

2. **检查选择器优先级**

```css
/* 提高优先级 */
.book-card.book-card {
  color: red;
}
```

3. **检查样式是否被覆盖**

- 在Elements面板查看元素
- 查看Computed样式
- 找到被覆盖的样式

### 7. 内存泄漏

**常见原因**：

- 定时器未清除
- 事件监听器未移除
- DOM引用未释放

**解决**：

```vue
<script setup>
import { onUnmounted } from 'vue'

// 定时器
const timer = setInterval(() => {}, 1000)
onUnmounted(() => {
  clearInterval(timer)
})

// 事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 使用组合式API自动清理
import { useEventListener } from '@vueuse/core'
useEventListener(window, 'resize', handleResize)
</script>
```

## 性能调试

### 性能面板

1. 打开Chrome DevTools的Performance面板
2. 点击Record
3. 操作页面
4. 停止录制
5. 分析结果

### Vue性能追踪

```vue
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 记录渲染时间
  const start = performance.now()
  // ... 组件逻辑
  const end = performance.now()
  console.log(`渲染耗时: ${end - start}ms`)
})
</script>
```

### 慢组件定位

```javascript
// main.js
app.config.performance = true

// 在Vue DevTools的Timeline面板查看组件渲染时间
```

## 错误追踪

### 全局错误处理

```javascript
// main.js
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('错误组件:', instance)
  console.error('错误信息:', info)
  
  // 发送到错误监控服务
  // sendErrorToService(err)
}

// 未捕获的Promise错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise错误:', event.reason)
})
```

### 组件错误边界

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message
  
  console.error('捕获到错误:', err)
  console.error('错误来源:', instance)
  console.error('错误详情:', info)
  
  // 阻止错误继续传播
  return false
})
</script>

<template>
  <div v-if="hasError">
    <h3>出错了</h3>
    <p>{{ errorMessage }}</p>
  </div>
  <slot v-else />
</template>
```

## 调试工具推荐

### VS Code插件

- **Volar**：Vue 3语言支持
- **Error Lens**：行内显示错误
- **JavaScript Debugger**：调试工具
- **REST Client**：测试API

### 浏览器扩展

- **Vue.js devtools**：Vue调试
- **Wappalyzer**：识别技术栈
- **JSON Viewer**：格式化JSON

### 命令行工具

```bash
# 检查依赖问题
npm ls
pnpm list

# 清除缓存
npm cache clean --force
pnpm store prune

# 检查打包大小
pnpm build
pnpm preview
```

## 日志记录最佳实践

### 开发环境日志

```javascript
// utils/logger.js
export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log('[LOG]', ...args)
    }
  },
  
  error: (...args) => {
    console.error('[ERROR]', ...args)
    // 生产环境发送到监控服务
  },
  
  warn: (...args) => {
    console.warn('[WARN]', ...args)
  }
}
```

### 使用日志

```javascript
import { logger } from '@/utils/logger'

logger.log('获取书籍列表', { page: 1, size: 20 })
logger.error('API请求失败', error)
```

## 常用调试代码片段

```javascript
// 1. 打印响应式对象
import { toRaw } from 'vue'
console.log(toRaw(reactiveObj))

// 2. 查看组件实例
import { getCurrentInstance } from 'vue'
const instance = getCurrentInstance()
console.log(instance)

// 3. 强制更新
import { nextTick } from 'vue'
await nextTick()

// 4. 检查是否为响应式
import { isRef, isReactive } from 'vue'
console.log(isRef(data), isReactive(data))
```

## 参考资料

- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Vue DevTools](https://devtools.vuejs.org/)
- [Vue 3 调试](https://vuejs.org/guide/extras/debugging.html)

---

**最后更新**：2025年10月17日
