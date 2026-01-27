# Qingyu 前端开发规范

> **重要提示**: 本仓库的规范文档已迁移至父仓库统一管理。

**当前状态**: 已迁移至父仓库
**迁移日期**: 2026-01-27
**新规范位置**: `../../docs/standards/FRONTEND_DEVELOPMENT_STANDARD.md`

---

## 📚 最新规范文档

### 统一前端开发规范 v2.0

**位置**: [父仓库 docs/standards/FRONTEND_DEVELOPMENT_STANDARD.md](../../docs/standards/FRONTEND_DEVELOPMENT_STANDARD.md)

**版本**: v2.0
**更新日期**: 2026-01-27
**基于**: 架构审查报告 + 现有规范整合

**包含内容**:
1. ✅ 总览与原则
2. ✅ 组件架构规范（解决pages与modules混乱）⭐ P0修复
3. ✅ API封装规范（统一使用src/api/）
4. ✅ 状态管理规范（Pinia Store结构）
5. ✅ 样式规范（BEM命名、CSS变量）
6. ✅ 路由与导航规范（统一路由定义）⭐ P0修复
7. ✅ 类型系统规范（TypeScript配置）
8. ✅ 性能优化规范
9. ✅ 测试规范
10. ✅ 构建与部署规范
11. ✅ 实施检查清单（P0/P1问题修复）⭐

**快速访问**:
- 📘 [在线阅读](../../docs/standards/FRONTEND_DEVELOPMENT_STANDARD.md)

---

## 🗂️ 旧规范归档

本仓库的旧规范文档已归档至 `docs/standards/archive/` 目录，以下为归档清单：

### 已归档文档

| 文档名称 | 原位置 | 归档位置 | 归档原因 |
|---------|--------|---------|---------|
| 样式规范指南.md | doc/standards/ | docs/standards/archive/ | 已整合到v2.0第5章 |
| 组件开发规范.md | doc/standards/ | docs/standards/archive/ | 已整合到v2.0第2章 |
| API开发规范.md | doc/standards/ | docs/standards/archive/ | 已整合到v2.0第3章 |
| 工具使用指南.md | doc/standards/ | docs/standards/archive/ | 已整合到v2.0第10章 |
| README.md | doc/standards/ | docs/standards/archive/ | 已整合到v2.0各章节 |

### 归档说明

1. **为什么归档？**
   - 解决规范分散、重复、冲突的问题
   - 基于架构审查报告进行更新，解决P0/P1问题
   - 统一全项目规范管理

2. **旧文档是否还有用？**
   - ✅ 有参考价值：保留了详细的代码示例和实现细节
   - ⚠️ 不再更新：后续只更新父仓库的统一规范
   - 📌 历史参考：可作为理解设计意图的补充材料

3. **如何使用旧文档？**
   - 如需查看历史讨论和详细示例，可参考归档文档
   - 开发时请以父仓库的v2.0规范为准
   - 如发现冲突，以v2.0为准

---

## 🔗 快速参考

### P0问题修复

根据架构审查报告，以下问题必须立即修复：

#### 1. 统一路由系统
```typescript
// ❌ 删除router/index.ts中的重复定义
{
  path: '/bookstore',
  component: () => import('@/pages/Bookstore/Home.vue'),
}

// ✅ 使用模块路由
import bookstoreRoutes from '@/modules/bookstore/routes'
```

#### 2. 清理模块API
```bash
# ❌ 删除这些目录
modules/bookstore/api/
modules/reader/api/
modules/user/api/
modules/writer/api/

# ✅ 统一使用src/api/
```

#### 3. 删除pages目录
```bash
# ❌ 删除整个目录
rm -rf src/pages/

# ✅ 统一使用modules/*/views/
```

### 核心规范要点

#### 1. 组件分层
```
┌─────────────────────────────────────┐
│         页面组件 (Pages)             │
│       modules/*/views/               │
├─────────────────────────────────────┤
│        业务组件 (Business)            │
│       modules/*/components/          │
├─────────────────────────────────────┤
│        通用组件 (Common)              │
│       shared/components/common/      │
├─────────────────────────────────────┤
│        基础组件 (Base)                │
│       shared/components/base/        │
└─────────────────────────────────────┘
```

#### 2. 目录结构规范
```
src/
├── api/              ✅ API层（统一入口）
├── modules/          ✅ 功能模块（业务代码）
├── shared/           ✅ 共享资源
├── stores/           ✅ 全局状态
└── router/           ✅ 路由聚合器

❌ 删除：pages/
❌ 重构：modules/*/api/
```

#### 3. 导入路径规范
```typescript
// ✅ 正确：使用模块别名
import { BookCard } from '@bookstore/components'

// ❌ 错误：使用相对路径
import { BookCard } from '../../bookstore/components'
```

#### 4. 路由命名规范
```typescript
// ✅ 正确：kebab-case
{
  name: 'bookstore-home'
}

// ❌ 错误：PascalCase
{
  name: 'Bookstore'
}
```

---

## 📋 迁移检查清单

如果您正在使用旧的规范文档，请检查以下迁移事项：

### 代码层面
- [ ] 确认所有路由使用 `modules/*/routes.ts` 定义
- [ ] 确认所有导入使用 `src/api/` 而非 `modules/*/api/`
- [ ] 确认所有页面组件位于 `modules/*/views/`
- [ ] 删除 `src/pages/` 目录
- [ ] 统一路由命名为 kebab-case
- [ ] 更新所有导入路径使用别名

### 文档层面
- [ ] 更新项目README，引用父仓库规范
- [ ] 更新人脸文档，指向新规范位置
- [ ] 将旧规范移至归档目录
- [ ] 通知团队成员规范已迁移

### 测试层面
- [ ] 更新测试用例以符合新规范
- [ ] 验证所有路由导航正常
- [ ] 验证所有组件导入正确
- [ ] 确认开发服务器无错误

---

## 🤝 贡献指南

### 如何更新规范？

1. **小修改**：直接提交PR到父仓库
   - 修改 `docs/standards/FRONTEND_DEVELOPMENT_STANDARD.md`
   - 说明修改原因和影响范围

2. **大修改**：先讨论再实施
   - 在团队讨论群提出建议
   - 达成共识后创建Issue
   - 实施前更新版本号和变更日志

3. **冲突处理**：
   - 如发现规范内容冲突，以父仓库v2.0为准
   - 在团队群讨论解决
   - 更新后同步到前端仓库引用文档

---

## 📞 联系方式

如有疑问或建议，请联系：
- 前端负责人：[待填写]
- 架构组：[待填写]
- 或者直接在团队群讨论

---

**最后更新**: 2026-01-27
**维护者**: Qingyu 前端团队
**归档状态**: ✅ 已迁移至父仓库
