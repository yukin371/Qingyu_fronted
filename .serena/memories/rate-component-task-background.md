# Rate 评分组件开发任务背景

## 任务目标
为 Tailwind UI 设计系统创建 Rate 评分组件。

## 组件规格

### Rate.vue
星级评分组件。

**Props:**
- `modelValue`: number - v-model 绑定值
- `max`: number - 最大分数，默认 5
- `disabled`: boolean - 禁用状态
- `allowHalf`: boolean - 是否允许半星
- `readonly`: boolean - 只读模式
- `size`: 'sm' | 'md' | 'lg' - 尺寸
- `color`: string - 选中颜色
- `voidColor`: string - 未选中颜色
- `showScore`: boolean - 显示分数
- `texts`: string[] - 分数对应的文字

**Events:**
- `update:modelValue` - 值更新
- `change` - 分数改变

**Slots:**
- `default` - 自定义图标

## 技术要求

1. 组件文件: `src/design-system/form/Rate/Rate.vue`
2. 类型定义: `src/design-system/form/Rate/types.ts`
3. Storybook: `src/design-system/form/Rate/Rate.stories.ts`
4. 单元测试: `tests/unit/design-system/form/Rate.test.ts`
5. README 文档: `src/design-system/form/Rate/README.md`
6. 导出文件: `src/design-system/form/Rate/index.ts`
7. 更新主导出: `src/design-system/form/index.ts`

## 参考组件
参考现有 Switch 组件的实现模式，使用 CVA 管理样式变体，支持多种尺寸和颜色。

## 图标
使用 Heroicons Star 图标。
