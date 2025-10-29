# 青羽平台 - 开发规范文档

> **版本**: v1.0.0  
> **最后更新**: 2025-10-29  
> **维护者**: 前端团队

---

## 📚 规范文档体系

### 核心规范

#### 1. [样式规范指南](./样式规范指南.md) ⭐

完整的CSS和样式开发规范

- **CSS架构**：文件组织、Scoped样式、深度选择器
- **命名规范**：BEM命名法、命名原则
- **CSS变量系统**：设计令牌、变量定义和使用
- **响应式设计**：断点系统、Media Queries、响应式工具类
- **主题系统**：主题切换、暗色模式、阅读主题
- **Element Plus定制**：CSS变量覆盖、组件样式覆盖
- **最佳实践**：推荐做法、避免做法、常见问题

#### 2. [工具使用指南](./工具使用指南.md) ⭐

开发工具链和工作流指南

- **开发工具链**：VSCode配置、必装扩展、代码片段
- **构建工具**：Vite配置、环境变量、常用命令
- **代码质量工具**：ESLint、Prettier、TypeScript配置
- **Git工作流**：分支策略、提交规范、Git Hooks
- **调试工具**：Vue DevTools、Browser DevTools、VSCode调试
- **测试工具**：Vitest、Playwright、E2E测试

#### 3. [组件开发规范](./组件开发规范.md) ⭐

Vue组件开发标准和最佳实践

- **组件分层**：基础组件、通用组件、业务组件、页面组件
- **命名规范**：文件命名、组件命名、Props命名、Events命名
- **Props设计**：基本原则、TypeScript Props、验证规则
- **Events设计**：命名规范、TypeScript Events、v-model支持
- **Slots设计**：默认插槽、具名插槽、作用域插槽
- **组件文档**：文档模板、Props/Events/Slots说明
- **性能优化**：v-memo、懒加载、虚拟滚动

#### 4. [API开发规范](./API开发规范.md) ⭐

API和服务层开发标准

- **API封装模式**：目录结构、API文件结构、HTTP Service
- **服务层设计**：职责分工、业务逻辑封装、缓存策略
- **状态管理规范**：Pinia Store结构、使用示例
- **类型定义规范**：API类型、通用类型、完整的TypeScript支持
- **错误处理**：统一错误处理、错误码定义
- **最佳实践**：推荐做法、避免做法、示例对比

#### 5. [快速参考](./快速参考.md) ⭐

常用命令、代码片段和速查表

- **常用命令速查**：NPM Scripts、Git命令
- **路径别名速查**：所有配置的路径别名
- **常用工具函数**：格式化、验证、缓存、存储
- **Element Plus组件速查**：表单、数据展示、反馈、布局组件
- **图标使用指南**：@element-plus/icons-vue使用方式
- **代码片段**：Vue组件、Pinia Store、API封装模板
- **最佳实践速查**：Do's & Don'ts
- **常见问题**：FAQ解答

---

## 🎯 快速开始

### 新成员入门

1. 阅读 [快速参考](./快速参考.md) 了解基本命令和工具
2. 阅读 [工具使用指南](./工具使用指南.md) 配置开发环境
3. 阅读 [组件开发规范](./组件开发规范.md) 学习组件开发
4. 阅读 [样式规范指南](./样式规范指南.md) 掌握样式编写
5. 阅读 [API开发规范](./API开发规范.md) 了解API开发

### 日常开发

- **写样式时**：查阅 [样式规范指南](./样式规范指南.md)
- **开发组件时**：查阅 [组件开发规范](./组件开发规范.md)
- **对接API时**：查阅 [API开发规范](./API开发规范.md)
- **使用工具时**：查阅 [工具使用指南](./工具使用指南.md)
- **忘记命令时**：查阅 [快速参考](./快速参考.md)

---

## 📖 其他文档

### 架构文档

- [NEW_ARCHITECTURE.md](../architecture/NEW_ARCHITECTURE.md) - 新架构说明
- [前端架构设计.md](../architecture/前端架构设计.md) - 完整架构设计
- [组件架构设计.md](../architecture/组件架构设计.md) - 组件架构详解

### 开发指南

- [quick-start.md](../guide/quick-start.md) - 快速开始
- [project-structure.md](../guide/project-structure.md) - 项目结构
- [component-guide.md](../guide/component-guide.md) - 组件指南

### 实施报告

- [项目进度总结.md](../项目进度总结.md) - 完整项目进度报告

---

## 💡 核心原则

### 代码质量

1. **类型安全**：使用TypeScript，避免any
2. **代码规范**：遵循ESLint规则
3. **代码风格**：使用Prettier统一格式
4. **代码审查**：所有代码经过Review

### 组件设计

1. **单一职责**：每个组件只做一件事
2. **高内聚低耦合**：组件独立可复用
3. **Props向下，Events向上**：单向数据流
4. **完整文档**：每个组件都有文档

### API开发

1. **分层架构**：API层、服务层、状态层分离
2. **统一错误处理**：全局错误拦截
3. **合理缓存**：提升性能
4. **类型完整**：完整的TypeScript类型定义

### 样式编写

1. **BEM命名**：使用BEM命名规范
2. **CSS变量**：使用设计令牌
3. **Scoped样式**：组件样式隔离
4. **响应式设计**：移动优先

---

## 🛠️ 工具配置速查

### ESLint配置

```javascript
// eslint.config.js
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  {
    rules: {
      'vue/multi-word-component-names': 'error',
      'vue/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single'],
    }
  }
]
```

### Prettier配置

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Git提交规范

```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat:     新功能
fix:      Bug修复
docs:     文档更新
style:    代码格式
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建/工具变动

# 示例
feat(auth): 添加用户登录功能
fix(reader): 修复阅读进度保存失败
docs(readme): 更新安装说明
```

---

## 📊 规范遵守情况

### 检查清单

开发时请确保：

- [ ] 代码通过ESLint检查
- [ ] 代码通过TypeScript类型检查
- [ ] 组件遵循命名规范
- [ ] 样式使用BEM命名
- [ ] API有完整类型定义
- [ ] 组件有文档说明
- [ ] Git提交信息符合规范
- [ ] 代码经过Code Review

### 自动检查

```bash
# 运行所有检查
npm run lint              # ESLint检查
npm run type-check        # TypeScript类型检查

# Git提交时自动检查（已配置Husky）
git commit -m "..."       # 会自动运行lint-staged
```

---

## 🤝 贡献指南

### 更新规范文档

如需更新规范文档：

1. 在对应的规范文件中修改
2. 更新文档版本号和日期
3. 提交PR并说明修改原因
4. 经团队Review后合并

### 提出建议

如有规范改进建议：

1. 在团队会议上讨论
2. 达成一致后更新文档
3. 通知全体成员

---

## 📞 联系方式

如有疑问，请联系：

- **前端负责人**：[待补充]
- **技术讨论群**：[待补充]
- **文档维护**：前端团队

---

**维护者**: 前端团队  
**最后更新**: 2025-10-29  
**版本**: v1.0.0
