# 软件工程文档导航

## 📋 概述

本目录包含青羽书城前端的软件工程相关文档，涵盖需求分析、代码规范、工作流规范、构建配置等工程化内容。

## 📁 文档列表

### 📊 需求与规范
- [前端需求分析](./前端需求分析.md) - 前端功能需求分析文档
- [代码规范](./代码规范.md) - JavaScript/Vue代码编写规范
- [Git工作流规范](./Git工作流规范.md) - Git分支管理和提交规范
- [代码审查规范](./代码审查规范.md) - Code Review流程和标准

### 🔧 构建与配置
- [构建配置](./构建配置.md) - Vite构建配置说明
- [环境配置](./环境配置.md) - 开发、测试、生产环境配置
- [依赖管理](./依赖管理.md) - npm包管理和版本控制

### 🚀 CI/CD
- [CI-CD配置](./CI-CD配置.md) - 持续集成和持续部署配置

## 🎯 工程化原则

### 代码质量
- **可读性** - 代码清晰易懂
- **可维护性** - 易于修改和扩展
- **可测试性** - 便于编写测试用例
- **性能** - 考虑运行效率

### 团队协作
- **统一规范** - 遵循统一的编码规范
- **版本控制** - 规范的Git工作流
- **代码审查** - 严格的Code Review
- **文档先行** - 先写文档后写代码

### 持续改进
- **技术迭代** - 保持技术栈更新
- **工具优化** - 优化开发工具链
- **流程改进** - 不断优化开发流程
- **知识共享** - 团队知识沉淀

## 📝 Git工作流

### 分支规范

```
main (主分支)
  └── develop (开发分支)
        ├── feature/xxx (功能分支)
        ├── bugfix/xxx (bug修复分支)
        └── hotfix/xxx (紧急修复分支)
```

### 提交信息规范

```
type(scope): description

feat(components): 添加书籍卡片组件
fix(api): 修复接口请求超时问题
docs(readme): 更新项目文档
style(css): 优化响应式布局
refactor(store): 重构状态管理
test(unit): 添加组件单元测试
chore(deps): 更新依赖包版本
```

### 提交类型

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| test | 测试相关 |
| chore | 构建过程或辅助工具的变动 |
| perf | 性能优化 |
| ci | CI/CD配置 |

## 🔧 开发工具

### 推荐工具

- **编辑器**: VS Code
- **版本控制**: Git
- **包管理**: npm/pnpm
- **代码检查**: ESLint
- **代码格式化**: Prettier
- **Git钩子**: Husky

### VS Code插件

```json
{
  "recommendations": [
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "wayou.vscode-todo-highlight"
  ]
}
```

### ESLint配置

```javascript
export default [
  {
    rules: {
      'vue/multi-word-component-names': 'error',
      'vue/no-unused-vars': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'error'
    }
  }
]
```

## 📊 质量保证

### 代码检查清单

- [ ] 代码符合ESLint规范
- [ ] 没有console.log和debugger
- [ ] 所有变量都被使用
- [ ] 函数和变量命名规范
- [ ] 注释完整准确
- [ ] 测试用例通过

### Code Review清单

- [ ] 代码逻辑正确
- [ ] 错误处理完善
- [ ] 性能考虑充分
- [ ] 安全问题检查
- [ ] 文档更新同步
- [ ] 测试覆盖充分

## 🚀 开发流程

```
需求分析 → 技术方案 → 代码开发 → 自测 → Code Review → 集成测试 → 部署上线
```

## 🔗 相关文档

- [项目开发规范](../项目开发规范.md) - 前端开发规范
- [实施指南](../implementation/) - 开发实施指导
- [测试文档](../testing/) - 测试规范和指南

---

**最后更新**：2025年10月13日

