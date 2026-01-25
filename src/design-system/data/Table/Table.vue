<script setup lang="ts">
/**
 * Table 组件
 *
 * 用于数据表格展示的组件
 * 支持边框、斑马纹、排序、固定列、自定义渲染等功能
 */

import { computed, ref, watch } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'
import type { TableProps, TableEmits, Column, TableRowData, SortOrder, TableAlign } from './types'

// 组件 Props
const props = withDefaults(defineProps<TableProps>(), {
  data: () => [],
  columns: () => [],
  border: false,
  stripe: false,
  size: 'md',
  fit: true,
  showHeader: true,
  highlightCurrentRow: false,
  emptyText: '暂无数据',
})

// 组件 Emits
const emit = defineEmits<TableEmits>()

// 内部状态
const currentRow = ref<TableRowData | null>(null)
const selectedRows = ref<TableRowData[]>([])
const expandingRows = ref<Set<string | number>>(new Set())
const sortProp = ref<string>('')
const sortOrder = ref<SortOrder>(null)

// 监听默认排序变化
watch(() => props.defaultSort, (newVal) => {
  if (newVal) {
    sortProp.value = newVal.prop
    sortOrder.value = newVal.order
  }
}, { immediate: true })

// 获取行的唯一标识
const getRowKey = (row: TableRowData, index: number): string | number => {
  if (props.rowKey) {
    return typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey]
  }
  return index
}

// 处理排序数据
const sortedData = computed(() => {
  if (!sortProp.value || !sortOrder.value) {
    return props.data
  }

  const data = [...props.data]
  data.sort((a, b) => {
    const aVal = a[sortProp.value]
    const bVal = b[sortProp.value]

    if (aVal === bVal) return 0
    if (aVal === undefined || aVal === null) return 1
    if (bVal === undefined || bVal === null) return -1

    const result = aVal < bVal ? -1 : 1
    return sortOrder.value === 'ascending' ? result : -result
  })

  return data
})

// 表格容器样式
const tableVariants = cva(
  // 基础样式
  'w-full overflow-auto',
  {
    variants: {
      border: {
        true: 'border border-slate-200 dark:border-slate-700 rounded-lg',
        false: '',
      },
    },
    defaultVariants: {
      border: false,
    },
  }
)

// 表格元素样式
const tableElementVariants = cva(
  'w-full border-collapse',
  {
    variants: {
      fit: {
        true: 'table-fixed',
        false: '',
      },
    },
    defaultVariants: {
      fit: true,
    },
  }
)

// 行样式
const rowVariants = cva(
  'transition-colors duration-150',
  {
    variants: {
      stripe: {
        true: 'even:bg-slate-50 dark:even:bg-slate-800/50',
        false: '',
      },
      hover: {
        true: 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
        false: '',
      },
    },
    defaultVariants: {
      stripe: false,
      hover: true,
    },
  }
)

// 单元格内边距样式
const cellPadding = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-2'
    case 'lg':
      return 'px-4 py-3'
    default:
      return 'px-4 py-2.5'
  }
})

// 文本大小样式
const textSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-sm'
    case 'lg':
      return 'text-base'
    default:
      return 'text-sm'
  }
})

// 获取列对齐样式
const getAlignClass = (align?: TableAlign): string => {
  switch (align) {
    case 'left':
      return 'text-left'
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    default:
      return 'text-left'
  }
}

// 获取单元格类名
const getCellClass = (
  row: TableRowData,
  column: Column,
  rowIndex: number,
  columnIndex: number
): string => {
  const classes: string[] = []

  // 基础类名
  classes.push(cellPadding.value)
  classes.push(textSize.value)
  classes.push('text-slate-600 dark:text-slate-400')
  classes.push('border-b border-slate-200 dark:border-slate-700')
  classes.push(getAlignClass(column.align))

  // 自定义类名
  if (typeof props.cellClassName === 'function') {
    const customClass = props.cellClassName(row, column, rowIndex, columnIndex)
    if (customClass) classes.push(customClass)
  } else if (props.cellClassName) {
    classes.push(props.cellClassName)
  }

  // 列自定义类名
  if (typeof column.className === 'function') {
    const customClass = column.className(row, column, rowIndex)
    if (customClass) classes.push(customClass)
  } else if (column.className) {
    classes.push(column.className)
  }

  // 边框
  if (props.border) {
    classes.push('border-r border-slate-200 dark:border-slate-700 last:border-r-0')
  }

  return classes.join(' ')
}

// 获取表头单元格类名
const getHeaderCellClass = (column: Column): string => {
  const classes: string[] = []

  // 基础类名
  classes.push(cellPadding.value)
  classes.push(textSize.value)
  classes.push('font-medium')
  classes.push('text-slate-700 dark:text-slate-300')
  classes.push('bg-slate-50 dark:bg-slate-800')
  classes.push('border-b-2 border-slate-200 dark:border-slate-700')
  classes.push(getAlignClass(column.align))

  // 表头自定义类名
  if (column.headerClassName) {
    classes.push(column.headerClassName)
  }

  // 边框
  if (props.border) {
    classes.push('border-r border-slate-200 dark:border-slate-700 last:border-r-0')
  }

  return classes.join(' ')
}

// 获取行类名
const getRowClass = (row: TableRowData, index: number): string => {
  const classes: string[] = []

  // 基础类名
  classes.push(rowVariants({
    stripe: props.stripe,
    hover: !props.highlightCurrentRow,
  }))
  classes.push('bg-white dark:bg-slate-900')

  // 高亮当前行
  if (props.highlightCurrentRow && currentRow.value === row) {
    classes.push('bg-primary-50 dark:bg-primary-900/20')
  }

  // 自定义行类名
  if (typeof props.rowClassName === 'function') {
    const customClass = props.rowClassName(row, index)
    if (customClass) classes.push(customClass)
  } else if (props.rowClassName) {
    classes.push(props.rowClassName)
  }

  return classes.join(' ')
}

// 处理行点击
const handleRowClick = (row: TableRowData, column: Column | undefined, event: Event) => {
  currentRow.value = row
  emit('rowClick', row, column, event)
}

// 处理行双击
const handleRowDblclick = (row: TableRowData, column: Column | undefined, event: Event) => {
  emit('rowDblclick', row, column, event)
}

// 处理行右键菜单
const handleRowContextmenu = (row: TableRowData, column: Column | undefined, event: Event) => {
  emit('rowContextmenu', row, column, event)
}

// 处理行鼠标进入
const handleRowMouseEnter = (row: TableRowData, column: Column | undefined, event: Event) => {
  emit('rowMouseEnter', row, column, event)
}

// 处理行鼠标离开
const handleRowMouseLeave = (row: TableRowData, column: Column | undefined, event: Event) => {
  emit('rowMouseLeave', row, column, event)
}

// 处理单元格鼠标进入
const handleCellMouseEnter = (row: TableRowData, column: Column, cell: EventTarget, event: Event) => {
  emit('cellMouseEnter', row, column, cell, event)
}

// 处理单元格鼠标离开
const handleCellMouseLeave = (row: TableRowData, column: Column, cell: EventTarget, event: Event) => {
  emit('cellMouseLeave', row, column, cell, event)
}

// 处理排序点击
const handleSortClick = (column: Column) => {
  if (!column.sortable) return

  const prop = column.prop

  // 切换排序顺序
  if (sortProp.value === prop) {
    if (sortOrder.value === 'ascending') {
      sortOrder.value = 'descending'
    } else if (sortOrder.value === 'descending') {
      sortOrder.value = null
      sortProp.value = ''
    } else {
      sortOrder.value = 'ascending'
    }
  } else {
    sortProp.value = prop
    sortOrder.value = 'ascending'
  }

  emit('sortChange', { prop, order: sortOrder.value })
}

// 获取排序图标
const getSortIcon = (column: Column) => {
  if (sortProp.value !== column.prop || !sortOrder.value) {
    return null
  }

  if (sortOrder.value === 'ascending') {
    return '↑'
  }
  return '↓'
}

// 渲染单元格内容
const renderCell = (row: TableRowData, column: Column, index: number) => {
  // 自定义渲染函数
  if (column.render) {
    return column.render(row, column, index)
  }

  // 获取值
  const value = row[column.prop]

  // 处理 undefined 和 null
  if (value === undefined || value === null) {
    return ''
  }

  return value
}

// 是否为空数据
const isEmpty = computed(() => {
  return sortedData.value.length === 0
})

// 获取列配置（包含选择列和索引列）
const displayColumns = computed(() => {
  const columns: Column[] = [...props.columns]

  // 检查是否有选择列
  const hasSelection = props.columns.some(col => col.type === 'selection')
  const hasIndex = props.columns.some(col => col.type === 'index')

  // 在开头添加索引列
  if (hasIndex) {
    columns.unshift({
      prop: '_index',
      label: '#',
      width: 50,
      align: 'center',
    })
  }

  // 在开头添加选择列
  if (hasSelection) {
    columns.unshift({
      prop: '_selection',
      label: '',
      width: 50,
      align: 'center',
    })
  }

  return columns
})
</script>

<template>
  <div
    :class="cn(
      tableVariants({ border }),
      props.class
    )"
  >
    <table
      :class="tableElementVariants({ fit })"
    >
      <!-- 表头 -->
      <thead v-if="showHeader">
        <tr>
          <th
            v-for="(column, index) in displayColumns"
            :key="column.prop + index"
            :class="getHeaderCellClass(column)"
            :style="{ width: column.width ? `${column.width}px` : undefined, minWidth: column.minWidth ? `${column.minWidth}px` : undefined }"
            @click="handleSortClick(column)"
          >
            <div class="flex items-center gap-1">
              <span>{{ column.label }}</span>
              <span
                v-if="column.sortable"
                class="text-slate-400"
              >
                <template v-if="getSortIcon(column)">
                  {{ getSortIcon(column) }}
                </template>
                <template v-else>
                  ↕
                </template>
              </span>
            </div>
          </th>
        </tr>
      </thead>

      <!-- 表格内容 -->
      <tbody v-if="!isEmpty">
        <tr
          v-for="(row, rowIndex) in sortedData"
          :key="getRowKey(row, rowIndex)"
          :class="getRowClass(row, rowIndex)"
          @click="handleRowClick(row, undefined, $event)"
          @dblclick="handleRowDblclick(row, undefined, $event)"
          @contextmenu="handleRowContextmenu(row, undefined, $event)"
          @mouseenter="handleRowMouseEnter(row, undefined, $event)"
          @mouseleave="handleRowMouseLeave(row, undefined, $event)"
        >
          <td
            v-for="(column, columnIndex) in displayColumns"
            :key="column.prop + columnIndex"
            :class="getCellClass(row, column, rowIndex, columnIndex)"
            :style="{ width: column.width ? `${column.width}px` : undefined, minWidth: column.minWidth ? `${column.minWidth}px` : undefined }"
            @mouseenter="handleCellMouseEnter(row, column, $event.target, $event)"
            @mouseleave="handleCellMouseLeave(row, column, $event.target, $event)"
          >
            <!-- 选择列 -->
            <template v-if="column.prop === '_selection'">
              <input
                type="checkbox"
                :checked="selectedRows.includes(row)"
                @change="toggleRowSelection(row)"
              >
            </template>

            <!-- 索引列 -->
            <template v-else-if="column.prop === '_index'">
              {{ rowIndex + 1 }}
            </template>

            <!-- 普通列 -->
            <template v-else>
              {{ renderCell(row, column, rowIndex) }}
            </template>
          </td>
        </tr>
      </tbody>

      <!-- 空数据状态 -->
      <tbody v-else>
        <tr>
          <td
            :colspan="displayColumns.length"
            class="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-600"
          >
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
