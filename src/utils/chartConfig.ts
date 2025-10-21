/**
 * ECharts 图表配置
 */
import type { EChartsOption } from 'echarts'

/**
 * 默认主题颜色
 */
export const THEME_COLORS = {
  primary: '#409EFF',
  success: '#67C23A',
  warning: '#E6A23C',
  danger: '#F56C6C',
  info: '#909399'
}

/**
 * 图表颜色系列
 */
export const CHART_COLORS = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#00D2D3',
  '#FF6B81',
  '#A29BFE',
  '#6C5CE7',
  '#FD79A8'
]

/**
 * 通用图表配置
 */
export const COMMON_OPTIONS: Partial<EChartsOption> = {
  color: CHART_COLORS,
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    backgroundColor: 'rgba(50,50,50,0.9)',
    borderColor: 'rgba(50,50,50,0.9)',
    textStyle: {
      color: '#fff'
    }
  }
}

/**
 * 折线图配置
 */
export function createLineChartOption(
  xData: string[],
  series: { name: string; data: number[] }[],
  options?: Partial<EChartsOption>
): EChartsOption {
  return {
    ...COMMON_OPTIONS,
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
      areaStyle: {
        opacity: 0.3
      }
    })),
    legend: {
      data: series.map((s) => s.name)
    },
    ...options
  }
}

/**
 * 柱状图配置
 */
export function createBarChartOption(
  xData: string[],
  series: { name: string; data: number[] }[],
  options?: Partial<EChartsOption>
): EChartsOption {
  return {
    ...COMMON_OPTIONS,
    xAxis: {
      type: 'category',
      data: xData
    },
    yAxis: {
      type: 'value'
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      data: s.data
    })),
    legend: {
      data: series.map((s) => s.name)
    },
    ...options
  }
}

/**
 * 饼图配置
 */
export function createPieChartOption(
  data: { name: string; value: number }[],
  options?: Partial<EChartsOption>
): EChartsOption {
  return {
    color: CHART_COLORS,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map((d) => d.name)
    },
    series: [
      {
        name: '统计',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data
      }
    ],
    ...options
  }
}

/**
 * 环形图配置
 */
export function createDonutChartOption(
  data: { name: string; value: number }[],
  options?: Partial<EChartsOption>
): EChartsOption {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return {
    color: CHART_COLORS,
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: data.map((d) => d.name)
    },
    series: [
      {
        name: '统计',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          formatter: () => {
            return `总计\n${total}`
          },
          fontSize: 20,
          fontWeight: 'bold'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 24,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data
      }
    ],
    ...options
  }
}

/**
 * 面积图配置
 */
export function createAreaChartOption(
  xData: string[],
  series: { name: string; data: number[] }[],
  options?: Partial<EChartsOption>
): EChartsOption {
  return {
    ...COMMON_OPTIONS,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData
    },
    yAxis: {
      type: 'value'
    },
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      stack: 'Total',
      smooth: true,
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: s.data
    })),
    legend: {
      data: series.map((s) => s.name)
    },
    ...options
  }
}

/**
 * 雷达图配置
 */
export function createRadarChartOption(
  indicators: { name: string; max: number }[],
  data: { value: number[]; name: string }[],
  options?: Partial<EChartsOption>
): EChartsOption {
  return {
    color: CHART_COLORS,
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: data.map((d) => d.name)
    },
    radar: {
      indicator: indicators
    },
    series: [
      {
        name: '指标',
        type: 'radar',
        data: data
      }
    ],
    ...options
  }
}

/**
 * 仪表盘配置
 */
export function createGaugeChartOption(
  value: number,
  name: string,
  options?: Partial<EChartsOption>
): EChartsOption {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: THEME_COLORS.primary
        },
        progress: {
          show: true,
          roundCap: true,
          width: 18
        },
        pointer: {
          show: false
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-15%'],
          fontSize: 40,
          fontWeight: 'bolder',
          formatter: '{value}%',
          color: 'inherit'
        },
        data: [
          {
            value,
            name
          }
        ]
      }
    ],
    ...options
  }
}

/**
 * 散点图配置
 */
export function createScatterChartOption(
  data: number[][],
  options?: Partial<EChartsOption>
): EChartsOption {
  return {
    ...COMMON_OPTIONS,
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        type: 'scatter',
        symbolSize: 8,
        data
      }
    ],
    ...options
  }
}

