# Dialog 组件测试修复任务

## 任务背景
Dialog 组件测试有 5 个失败用例：
1. "按 ESC 键应该关闭对话框" - ESC 键事件没有触发
2. "关闭对话框时应该触发 close 事件" - 找不到关闭按钮
3. "beforeClose 返回 false 应该阻止关闭" - 找不到关闭按钮
4. "beforeClose 返回 true 应该允许关闭" - 找不到关闭按钮
5. "beforeClose 返回 Promise 应该等待异步操作" - 找不到关闭按钮

## 问题分析

### 1. ESC 键事件监听问题
- 组件在 `onMounted` 中添加键盘监听器
- 监听器添加逻辑只检查 `closeOnPressEscape` 属性
- 测试中可能存在时序问题

### 2. 关闭按钮显示逻辑问题
- 模板中的显示条件：`v-if="$slots.header || title || showClose"`
- 这导致即使 `showClose=true`，在没有 header/title 时也不显示按钮
- 头部 div 的条件也是同样的问题

## 修复计划

### Task #14: 修复 ESC 键事件监听
- 修改键盘监听器的添加逻辑
- 确保在组件生命周期中正确添加/移除监听器
- 使用 watch 监听 closeOnPressEscape 属性变化

### Task #15: 修复关闭按钮渲染逻辑
- 修改头部显示条件：确保 showClose 时始终显示头部
- 修改关闭按钮条件：确保 showClose 优先

### Task #16: 验证测试修复
- 运行测试确认所有用例通过
