# Pagination 分页组件开发任务

## 任务背景
为 Tailwind UI 设计系统创建 Pagination 分页组件，这是 P3 数据展示组件之一。

## 组件规格

### Pagination.vue
分页组件。

**Props:**
- `currentPage`: number - 当前页
- `pageSize`: number - 每页数量
- `total`: number - 总条数
- `pageSizes`: number[] - 每页数量选项
- `layout`: string - 布局 (prev, pager, next, jumper, sizes, total)
- `background`: boolean - 是否有背景色
- `disabled`: boolean - 禁用状态
- `hideOnSinglePage`: boolean - 只有一页时隐藏

**Events:**
- `update:currentPage` - 当前页改变
- `update:pageSize` - 每页数量改变
- `sizeChange` - pageSize 改变
- `currentChange` - currentPage 改变

## 技术要求

1. 组件文件: `src/design-system/data/Pagination/Pagination.vue`
2. 类型定义: `src/design-system/data/Pagination/types.ts`
3. Storybook: `src/design-system/data/Pagination/Pagination.stories.ts`
4. 单元测试: `tests/unit/design-system/data/Pagination.test.ts`
5. README 文档: `src/design-system/data/Pagination/README.md`
6. 导出文件: `src/design-system/data/Pagination/index.ts`
7. 更新主导出: `src/design-system/data/index.ts`

项目路径: E:\Github\Qingyu\Qingyu_fronted

## 参考组件模式
- 参考 Divider、Button 等现有组件的开发模式
- 使用 CVA 进行样式变体管理
- 使用 TypeScript 进行类型定义
- 使用 Vitest 进行单元测试
- 使用 Storybook 进行组件文档
