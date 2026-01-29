# Vue 3 响应式最佳实践

> 简明知识库 - 避免常见陷阱

## 🚨 重大陷阱：Ref嵌套在Reactive中

### ❌ 错误做法
```typescript
// 反模式：reactive对象中嵌套Ref
interface TreeNodeState {
  expanded: Ref<boolean>  // ❌ 响应式会丢失
  checked: Ref<boolean>   // ❌ 响应式会丢失
}

const state = reactive<TreeNodeState>({
  expanded: ref(false),  // ❌
  checked: ref(false)    // ❌
})

// 访问时需要 .value，但Vue无法正确追踪变化
state.expanded.value = true  // 可能不会触发更新
```

### ✅ 正确做法
```typescript
// 最佳实践：直接在reactive对象中使用原始值
interface TreeNodeState {
  expanded: boolean  // ✅
  checked: boolean   // ✅
}

const state = reactive<TreeNodeState>({
  expanded: false,   // ✅
  checked: false     // ✅
})

// 直接赋值，Vue自动追踪
state.expanded = true  // ✅ 会触发更新
```

## 📌 什么时候使用Ref vs Reactive

### 使用 Ref
- 包装**原始值**（string, number, boolean）
- 包装**单个对象**（不需要深层响应式）
- 需要整体替换对象时

```typescript
const count = ref(0)
const user = ref<User | null>(null)
const isLoading = ref(false)
```

### 使用 Reactive
- 包装**对象**（需要深层响应式）
- 包装**多个相关状态**
- 定义**复杂的数据结构**

```typescript
const state = reactive({
  count: 0,
  user: null,
  isLoading: false
})
```

## 🎯 递归组件最佳实践

### ✅ 正确的状态管理
```typescript
// 使用reactive管理节点状态
const nodeState = reactive<TreeNodeState>({
  expanded: false,
  checked: false,
  indeterminate: false
})

// 计算属性
const hasChildren = computed(() =>
  props.node.children?.length > 0
)

// 方法
const toggleExpand = () => {
  nodeState.expanded = !nodeState.expanded
  emit('expand', props.node, nodeState.expanded)
}
```

### ⚠️ 测试注意事项
```typescript
// 必须使用nextTick等待DOM更新
import { nextTick } from 'vue'

await wrapper.trigger('click')
await nextTick()  // ⚠️ 必须等待
expect(wrapper.classes()).toContain('is-expanded')
```

## 🚀 性能建议

1. **避免不必要的Ref嵌套**
   - 直接在reactive对象中使用原始值
   - 减少包装层级

2. **使用computed优化**
   - 复杂计算使用computed而非methods
   - 自动缓存结果

3. **递归组件优化**
   - 使用key属性帮助Vue识别节点
   - 避免在template中重复计算

## 📚 参考案例

- Tree组件修复报告：`docs/reports/tree-component-responsive-analysis.md`
- Vue 3官方文档：[Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
