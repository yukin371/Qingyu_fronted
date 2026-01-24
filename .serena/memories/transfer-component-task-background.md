# Transfer 穿梭框组件开发任务背景

## 任务目标
开发 Transfer 穿梭框组件，基于 Vue 3 + TypeScript + Tailwind CSS + CVA

## 技术栈
- Vue 3 + TypeScript + `<script setup>`
- Tailwind CSS 3.3.6
- CVA (class-variance-authority) 用于变体管理
- Storybook 8.6 用于组件文档

## 目录结构
在 `Qingyu_fronted/src/design-system/other/` 下创建：
```
Transfer/
  Transfer.vue          # 主组件
  TransferPanel.vue     # 面板组件
  TransferItem.vue      # 列表项组件
  types.ts              # 类型定义
  Transfer.stories.ts   # Storybook 故事
  README.md             # 组件文档
  index.ts              # 导出
  Transfer.test.ts      # 单元测试
```

## 组件功能要求

### Props
1. **基本功能**
   - data: 数据源
   - v-model/modelValue: 目标列表的键数组
   - filterable: 可搜索
   - filterPlaceholder: 搜索框占位文本
   - filterMethod: 自定义搜索方法
   - titles: 自定义标题（左右两个面板）
   - buttonTexts: 按钮文本
   - renderContent: 自定义项渲染函数
   - format: 列表项展示格式
   - props: 数据项字段配置
   - leftDefaultChecked: 左侧默认选中
   - rightDefaultChecked: 右侧默认选中
   - targetOrder: 目标列表排序方式

### Events
1. **事件**
   - change: 变化时触发
   - leftCheckChange: 左侧选中变化
   - rightCheckChange: 右侧选中变化

## Stories 要求（至少10个）
1. Default - 基础用法
2. Filterable - 可搜索
3. CustomProps - 自定义字段名
4. CustomRender - 自定义渲染
5. Pagination - 分页数据
6. Titles - 自定义标题
7. ButtonTexts - 自定义按钮文本
8. Aliased - 使用别名
9. FilterMethod - 自定义搜索
10. TargetOrder - 目标排序

## 单元测试要求
- 使用 Vitest + @testing-library/vue
- 至少35个测试用例
- 测试通过率 ≥ 90%

## 验收标准
1. 组件功能完整
2. 至少10个 Storybook 故事
3. 至少35个单元测试
4. 测试通过率 ≥ 90%
5. README 文档完整
