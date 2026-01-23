# Table 表格组件任务背景

## 任务目标
为 Tailwind UI 设计系统创建 Table 表格组件。

## 组件规格

### Table.vue
数据表格组件。

**Props:**
- `data`: Record<string, any>[] - 表格数据
- `columns`: Column[] - 列配置
- `border`: boolean - 是否显示边框
- `stripe`: boolean - 是否斑马纹
- `size`: 'sm' | 'md' | 'lg' - 尺寸
- `fit`: boolean - 是否宽度自适应
- `showHeader`: boolean - 是否显示表头
- `highlightCurrentRow`: boolean - 是否高亮当前行
- `emptyText`: string - 空数据文本

**Column 配置:**
- `prop`: string - 数据字段名
- `label`: string - 列标题
- `width`: number - 列宽度
- `align`: 'left' | 'center' | 'right' - 对齐方式
- `sortable`: boolean - 是否可排序
- `fixed`: 'left' | 'right' - 固定列

**Events:**
- `select` - 选择变化
- `selectionChange` - 多选变化
- `sortChange` - 排序变化
- `rowClick` - 行点击

**Slots:**
- `default` - 列定义
- `empty` - 空状态

## 技术要求
1. 组件文件: `src/design-system/data/Table/Table.vue`
2. 类型定义: `src/design-system/data/Table/types.ts`
3. Storybook: `src/design-system/data/Table/Table.stories.ts`
4. 单元测试: `tests/unit/design-system/data/Table.test.ts`
5. README 文档: `src/design-system/data/Table/README.md`
6. 导出文件: `src/design-system/data/Table/index.ts`
7. 更新主导出: `src/design-system/data/index.ts`
