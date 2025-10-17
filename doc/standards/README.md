# 开发规范

代码规范、命名规范和最佳实践。

## 规范文档

### [代码规范](./code-style.md)

- Vue组件规范
- JavaScript代码风格
- CSS/样式规范
- HTML模板规范

### [命名规范](./naming.md)

- 文件命名
- 变量命名
- 函数命名
- 类名命名

### [Git工作流](./git-workflow.md)

- 分支管理策略
- 提交信息规范
- Code Review流程
- 发布流程

### [最佳实践](./best-practices.md)

- 组件设计最佳实践
- 性能优化建议
- 安全实践
- 错误处理

## 快速参考

### ESLint规则

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'error',
    'vue/no-unused-vars': 'error'
  }
}
```

### Prettier配置

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100
}
```

### 提交信息模板

```
type(scope): subject

feat(books): 添加书籍详情页
fix(login): 修复登录失败问题
docs(readme): 更新README文档
```

## 工具配置

- **ESLint**：代码检查
- **Prettier**：代码格式化
- **Husky**：Git hooks
- **lint-staged**：提交前检查

---

**最后更新**：2025年10月17日
