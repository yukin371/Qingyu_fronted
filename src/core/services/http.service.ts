// src/core/services/http.service.ts

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosInstance, CancelTokenSource } from 'axios'
import { ElMessage } from 'element-plus'
import type { ErrorResponse } from '@/types/error.types'
import { errorReporter } from './error-reporter'
import { isInTestMode as checkTestMode, handleMockRequest } from './mock-data-manager'

// ==================== 类型扩展 ====================

/**
 * Promise回调对
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PromiseCallbacks {
  resolve: (_value?: unknown) => void
  reject: (_reason?: unknown) => void
}

/**
 * 扩展AxiosInstance接口，添加自定义方法
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExtendedAxiosInstance extends AxiosInstance {
  /** 设置认证Token */
  setAuthToken(token: string): void
  /** 清除认证Token */
  clearAuthToken(): void
  /** 取消所有进行中的请求 */
  cancelAllRequests(): void
}

// ==================== 配置 ====================

// API基础路径
const API_BASE_PATH = '/api/v1'

// 创建 axios 实例
const baseClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_BASE_PATH,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 用于存储取消令牌
const pendingRequests = new Map<string, CancelTokenSource>()

// 扩展实例
const apiClient = baseClient as ExtendedAxiosInstance

// ==================== 智能前缀检测 ====================

/**
 * 检测URL是否已经包含完整路径（包含 /api/v1 前缀）
 * 用于兼容Orval生成的完整路径和旧的相对路径
 */
function hasFullApiPath(url: string | undefined): boolean {
  if (!url) return false
  // 检查URL是否已经以 /api/v1 开头
  return url.startsWith('/api/v1') || url.startsWith('http')
}

function readStoredToken(): string | null {
  const parseToken = (raw: string | null): string | null => {
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'string' ? parsed : raw
    } catch {
      return raw
    }
  }

  // 优先使用当前主存储键，兼容旧键 token
  return parseToken(localStorage.getItem('qingyu_token')) || parseToken(localStorage.getItem('token'))
}

// ==================== 测试模式支持 ====================
// 旧的 mock 数据函数已被 mock-data-manager.ts 替代
// @deprecated 请使用 mock-data-manager.ts 中的函数
async function getMockDataForRequest(url: string | undefined): Promise<any> {
  // 动态导入 mock 数据
  const { default: mockData } = await import('@/views/demo/business-mock-data')
  
  console.log('[TestMode] 返回 Mock 数据:', url)
  
  // 根据请求路径返回对应的 mock 数据
  if (!url) return { code: 200, message: 'success', data: {} }
  
  // 统计数据
  if (url.includes('/stats/daily')) {
    return {
      code: 200,
      message: 'success',
      data: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 100) + 20
        }))
      }
    }
  }
  
  if (url.includes('/stats/reader-activity')) {
    return {
      code: 200,
      message: 'success',
      data: {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 100) + 20
        }))
      }
    }
  }
  
  if (url.includes('/stats/reading-heatmap')) {
    return {
      code: 200,
      message: 'success',
      data: {
        heatmap: Array.from({ length: 7 }, () => 
          Array.from({ length: 24 }, () => Math.floor(Math.random() * 50))
        )
      }
    }
  }
  
  if (url.includes('/stats/subscribers')) {
    const days = 30
    return {
      code: 200,
      message: 'success',
      data: {
        subscribers: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 5
        }))
      }
    }
  }
  
  if (url.includes('/stats/chapters')) {
    return {
      code: 200,
      message: 'success',
      data: {
        chapters: Array.from({ length: 10 }, (_, i) => ({
          id: `chapter-${i + 1}`,
          title: `第${i + 1}章`,
          views: Math.floor(Math.random() * 500) + 100,
          likes: Math.floor(Math.random() * 50) + 10,
          comments: Math.floor(Math.random() * 20) + 5
        }))
      }
    }
  }

  // ==================== 收益相关 API ====================

  // 收入统计
  if (url.includes('/writer/revenue/stats')) {
    return {
      code: 200,
      message: 'success',
      data: {
        totalRevenue: 12580.50,
        todayRevenue: 235.80,
        availableBalance: 8650.30,
        totalWithdrawn: 3930.20,
        monthRevenue: 3250.80,
        lastMonthRevenue: 2890.50
      }
    }
  }

  // 收入趋势
  if (url.includes('/writer/revenue/trend')) {
    const days = 30
    return {
      code: 200,
      message: 'success',
      data: Array.from({ length: days }, (_, i) => {
        const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
        return {
          date: date.toISOString(),
          revenue: Math.floor(Math.random() * 500) + 100,
          subscriptions: Math.floor(Math.random() * 50) + 10,
          tips: Math.floor(Math.random() * 30) + 5
        }
      })
    }
  }

  // 收入来源
  if (url.includes('/writer/revenue/sources')) {
    return {
      code: 200,
      message: 'success',
      data: [
        { type: 'subscription', label: '订阅收入', amount: 8580, percentage: 68.2 },
        { type: 'tip', label: '打赏收入', amount: 2850, percentage: 22.7 },
        { type: 'ad', label: '广告收入', amount: 1150, percentage: 9.1 }
      ]
    }
  }

  // 章节收入排行
  if (url.includes('/revenue/chapters')) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: Array.from({ length: 10 }, (_, i) => ({
          id: `chapter-revenue-${i + 1}`,
          chapterTitle: `第${i + 1}章：${['觉醒', '命运', '抉择', '征途', '试炼', '突破', '归来', '终章', '番外', '特别篇'][i] || '章节标题'}`,
          chapterNumber: i + 1,
          views: Math.floor(Math.random() * 10000) + 1000,
          subscriptions: Math.floor(Math.random() * 1000) + 100,
          revenue: Math.floor(Math.random() * 500) + 100
        })),
        total: 10
      }
    }
  }

  // 作家作品列表
  if (url.includes('/writer/books')) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: [
          { id: 'book-1', title: '星河骑士', status: 'published', chapterCount: 156 },
          { id: 'book-2', title: '时光信使', status: 'published', chapterCount: 89 },
          { id: 'book-3', title: '异界传说', status: 'draft', chapterCount: 23 }
        ],
        total: 3
      }
    }
  }

  // ==================== 钱包相关 API ====================

  // 提现申请列表
  if (url.includes('/withdraw-requests')) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: [
          {
            id: 'withdraw-1',
            amount: 1000,
            status: 'completed',
            method: 'alipay',
            account: '***@qq.com',
            created_at: '2024-01-20T10:30:00Z',
            processedAt: '2024-01-21T14:20:00Z',
            remark: '提现成功'
          },
          {
            id: 'withdraw-2',
            amount: 500,
            status: 'completed',
            method: 'wechat',
            account: '***',
            created_at: '2024-01-15T15:45:00Z',
            processedAt: '2024-01-16T09:10:00Z',
            remark: '提现成功'
          },
          {
            id: 'withdraw-3',
            amount: 2000,
            status: 'pending',
            method: 'bank',
            account: '****1234',
            created_at: '2024-01-25T09:15:00Z',
            processedAt: null,
            remark: '待审核'
          }
        ],
        total: 3,
        page: 1,
        pageSize: 20
      }
    }
  }

  // 钱包余额
  if (url.includes('/wallet/balance') || url.includes('/wallet') && !url.includes('withdraw')) {
    return {
      code: 200,
      message: 'success',
      data: {
        balance: 8650.30,
        totalRevenue: 12580.50,
        totalWithdrawn: 3930.20,
        availableBalance: 8650.30
      }
    }
  }

  // ==================== 书店相关 API ====================

  // 书店浏览 - 标签列表 (直接返回数组)
  if (url.includes('/bookstore/tags') && !url.includes('/book')) {
    return {
      code: 200,
      message: 'success',
      data: [
        { _id: 'tag-1', name: '热血', count: 1234 },
        { _id: 'tag-2', name: '玄幻', count: 982 },
        { _id: 'tag-3', name: '修仙', count: 756 },
        { _id: 'tag-4', name: '都市', count: 654 },
        { _id: 'tag-5', name: '科幻', count: 543 },
        { _id: 'tag-6', name: '游戏', count: 432 },
        { _id: 'tag-7', name: '历史', count: 321 },
        { _id: 'tag-8', name: '军事', count: 210 },
        { _id: 'tag-9', name: '悬疑', count: 198 },
        { _id: 'tag-10', name: '武侠', count: 176 }
      ]
    }
  }

  // 书店浏览 - 分类树 (直接返回数组)
  if (url.includes('/bookstore/categories/tree')) {
    return {
      code: 200,
      message: 'success',
      data: [
        {
          _id: 'cat-1',
          name: '玄幻',
          slug: 'xuanhuan',
          children: [
            { _id: 'cat-1-1', name: '东方玄幻', slug: 'dongfang' },
            { _id: 'cat-1-2', name: '西方玄幻', slug: 'xifang' },
            { _id: 'cat-1-3', name: '异界大陆', slug: 'yijie' }
          ]
        },
        {
          _id: 'cat-2',
          name: '科幻',
          slug: 'kehuan',
          children: [
            { _id: 'cat-2-1', name: '星际科幻', slug: 'xingji' },
            { _id: 'cat-2-2', name: '时空穿梭', slug: 'shikong' },
            { _id: 'cat-2-3', name: '机甲', slug: 'jijia' }
          ]
        },
        {
          _id: 'cat-3',
          name: '都市',
          slug: 'dushi',
          children: [
            { _id: 'cat-3-1', name: '都市生活', slug: 'shenghuo' },
            { _id: 'cat-3-2', name: '都市异能', slug: 'yineng' },
            { _id: 'cat-3-3', name: '商战职场', slug: 'shangzhan' }
          ]
        },
        {
          _id: 'cat-4',
          name: '仙侠',
          slug: 'xianxia',
          children: [
            { _id: 'cat-4-1', name: '古典仙侠', slug: 'gudian' },
            { _id: 'cat-4-2', name: '现代修真', slug: 'xiandai' }
          ]
        },
        {
          _id: 'cat-5',
          name: '游戏',
          slug: 'youxi',
          children: [
            { _id: 'cat-5-1', name: '虚拟网游', slug: 'xuni' },
            { _id: 'cat-5-2', name: '游戏异界', slug: 'yijie' }
          ]
        }
      ]
    }
  }

  // 书店浏览 - 年份列表 (直接返回数组)
  if (url.includes('/bookstore/books/years')) {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i.toString())
    }
    return {
      code: 200,
      message: 'success',
      data: years
    }
  }

  // 书店浏览 - 书籍列表
  if (url.includes('/bookstore/books') && !url.includes('/years') && !url.includes('/suggestions') && !url.includes('/book/')) {
    return {
      code: 200,
      message: 'success',
      data: [
        {
          _id: 'book-1',
          title: '星河骑士',
          cover: 'https://picsum.photos/seed/book1/300/400',
          author: { _id: 'author-1', nickname: '星穹作者', avatar: 'https://picsum.photos/seed/author1/100/100' },
          category: { _id: 'cat-2-1', name: '星际科幻', slug: 'xingji' },
          tags: [{ _id: 'tag-5', name: '科幻' }, { _id: 'tag-1', name: '热血' }],
          stats: { views: 125000, wordCount: 580000, subscriberCount: 3200, chapterCount: 156 },
          description: '浩瀚星河中，一名普通少年意外获得了神秘力量，踏上了成为银河骑士的征途...',
          status: 'published',
          completed: true,
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'book-2',
          title: '时光信使',
          cover: 'https://picsum.photos/seed/book2/300/400',
          author: { _id: 'author-2', nickname: '时光旅人', avatar: 'https://picsum.photos/seed/author2/100/100' },
          category: { _id: 'cat-2-2', name: '时空穿梭', slug: 'shikong' },
          tags: [{ _id: 'tag-5', name: '科幻' }, { _id: 'tag-9', name: '温情' }],
          stats: { views: 98000, wordCount: 420000, subscriberCount: 2100, chapterCount: 89 },
          description: '能够穿越时空的信使，为人们传递着跨越时空的情感与思念...',
          status: 'published',
          completed: false,
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'book-3',
          title: '异界龙骑',
          cover: 'https://picsum.photos/seed/book3/300/400',
          author: { _id: 'author-3', nickname: '龙傲天', avatar: 'https://picsum.photos/seed/author3/100/100' },
          category: { _id: 'cat-1-1', name: '东方玄幻', slug: 'dongfang' },
          tags: [{ _id: 'tag-2', name: '玄幻' }, { _id: 'tag-1', name: '热血' }],
          stats: { views: 256000, wordCount: 1200000, subscriberCount: 5600, chapterCount: 234 },
          description: '少年穿越异界，骑龙征战四方，最终成为异界霸主...',
          status: 'published',
          completed: true,
          updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'book-4',
          title: '都市仙尊',
          cover: 'https://picsum.photos/seed/book4/300/400',
          author: { _id: 'author-4', nickname: '仙尊', avatar: 'https://picsum.photos/seed/author4/100/100' },
          category: { _id: 'cat-3-2', name: '都市异能', slug: 'yineng' },
          tags: [{ _id: 'tag-3', name: '修仙' }, { _id: 'tag-4', name: '都市' }],
          stats: { views: 189000, wordCount: 890000, subscriberCount: 4300, chapterCount: 178 },
          description: '一代仙尊重生都市，以无敌姿态碾压一切，重回巅峰...',
          status: 'published',
          completed: false,
          updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'book-5',
          title: '网游之神级牧师',
          cover: 'https://picsum.photos/seed/book5/300/400',
          author: { _id: 'author-5', nickname: '玩家一号', avatar: 'https://picsum.photos/seed/author5/100/100' },
          category: { _id: 'cat-5-1', name: '虚拟网游', slug: 'xuni' },
          tags: [{ _id: 'tag-6', name: '游戏' }, { _id: 'tag-1', name: '热血' }],
          stats: { views: 145000, wordCount: 670000, subscriberCount: 2800, chapterCount: 145 },
          description: '一个牧师玩家，凭借神级操作，在虚拟网游中创造传奇...',
          status: 'published',
          completed: true,
          updatedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'book-6',
          title: '商途无双',
          cover: 'https://picsum.photos/seed/book6/300/400',
          author: { _id: 'author-6', nickname: '商界精英', avatar: 'https://picsum.photos/seed/author6/100/100' },
          category: { _id: 'cat-3-3', name: '商战职场', slug: 'shangzhan' },
          tags: [{ _id: 'tag-4', name: '都市' }],
          stats: { views: 78000, wordCount: 340000, subscriberCount: 1200, chapterCount: 67 },
          description: '从零开始创业，经历商海沉浮，最终打造商业帝国...',
          status: 'published',
          completed: false,
          updatedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString()
        }
      ],
      pagination: {
        total: 6,
        page: 1,
        page_size: 20,
        total_pages: 1,
        has_next: false,
        has_previous: false
      },
      timestamp: Date.now()
    }
  }

  // 搜索建议
  if (url.includes('/suggestions')) {
    return {
      code: 200,
      message: 'success',
      data: [
        { title: '星河骑士', _id: 'book-1' },
        { title: '星际争霸', _id: 'book-2' },
        { title: '星辰变', _id: 'book-3' }
      ]
    }
  }

  // 推荐书籍
  if (url.includes('/books/recommended') || url.includes('/books') && !url.includes('/book/')) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: [
          {
            _id: 'book-1',
            title: '星河骑士',
            cover: 'https://picsum.photos/seed/book1/300/400',
            author: { nickname: '星穹作者', avatar: 'https://picsum.photos/seed/author1/100/100' },
            category: '科幻',
            tags: ['星际', '冒险', '热血'],
            stats: { views: 125000, wordCount: 580000, subscriberCount: 3200 },
            description: '浩瀚星河中，一名普通少年意外获得了神秘力量，踏上了成为银河骑士的征途...',
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'book-2',
            title: '时光信使',
            cover: 'https://picsum.photos/seed/book2/300/400',
            author: { nickname: '时光旅人', avatar: 'https://picsum.photos/seed/author2/100/100' },
            category: '奇幻',
            tags: ['时间', '治愈', '温情'],
            stats: { views: 98000, wordCount: 420000, subscriberCount: 2100 },
            description: '能够穿越时空的信使，为人们传递着跨越时空的情感与思念...',
            updatedAt: new Date().toISOString()
          }
        ],
        total: 2,
        pagination: { page: 1, pageSize: 20, total: 2 }
      }
    }
  }

  // 书籍详情
  if (url.includes('/books/') && url.includes('/chapters')) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: Array.from({ length: 50 }, (_, i) => ({
          _id: `chapter-${i + 1}`,
          chapterNumber: i + 1,
          title: `第${i + 1}章 ${['觉醒', '命运', '抉择', '征途', '试炼'][i % 5]}`,
          wordCount: Math.floor(Math.random() * 2000) + 1500,
          isFree: i < 10,
          price: i >= 10 ? Math.floor(Math.random() * 10) + 5 : 0,
          publishTime: new Date(Date.now() - (50 - i) * 24 * 60 * 60 * 1000).toISOString(),
          stats: { views: Math.floor(Math.random() * 5000) + 1000 }
        })),
        total: 50
      }
    }
  }

  // 章节内容
  if (url.match(/\/chapters\/[^/]+(\/content)?$/)) {
    return {
      code: 200,
      message: 'success',
      data: {
        _id: 'chapter-content-1',
        chapterNumber: 1,
        title: '第一章 觉醒',
        content: `
          <p>夜幕降临，星光点点。</p>
          <p>少年睁开双眼，发现世界已经完全不同。</p>
          <p>体内涌动的力量，让他意识到命运已经改变。</p>
          <p>这是一个全新的开始，一段传奇的序幕正在缓缓拉开...</p>
          <p>================================</p>
          <p>注：这是测试模式下的模拟章节内容喵~</p>
        `.trim(),
        wordCount: 1580,
        isFree: true,
        price: 0,
        publishTime: new Date().toISOString()
      }
    }
  }

  // ==================== 用户相关 API ====================

  // 用户信息
  if (url.includes('/user/profile') || url === '/api/v1/user') {
    return {
      code: 200,
      message: 'success',
      data: {
        _id: 'user-test-1',
        nickname: '测试用户',
        avatar: 'https://picsum.photos/seed/user1/200/200',
        bio: '这是测试模式下的模拟用户',
        stats: {
          bookCount: 2,
          followerCount: 128,
          followingCount: 56,
          wordCount: 1000000
        },
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  }

  // ==================== 社区相关 API ====================

  // 帖子列表
  if (url.includes('/posts') && !url.includes('/posts/')) {
    return {
      code: 200,
      message: 'success',
      data: {
        list: [
          {
            _id: 'post-1',
            title: '新书发布感言',
            content: '感谢大家的支持，新书终于发布啦！',
            author: { nickname: '星穹作者', avatar: 'https://picsum.photos/seed/author1/100/100' },
            stats: { views: 1520, likes: 234, comments: 56 },
            createdAt: new Date().toISOString()
          },
          {
            _id: 'post-2',
            title: '写作心得分享',
            content: '分享一下我写作过程中的心得体会...',
            author: { nickname: '时光旅人', avatar: 'https://picsum.photos/seed/author2/100/100' },
            stats: { views: 890, likes: 156, comments: 32 },
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        total: 2,
        pagination: { page: 1, pageSize: 20, total: 2 }
      }
    }
  }

  // 默认返回空数据
  return { code: 200, message: 'success', data: {} }
}

/**
 * 模拟网络延迟
 */
function mockDelay(): Promise<void> {
  const delay = 100 + Math.random() * 200
  return new Promise(resolve => setTimeout(resolve, delay))
}

// 请求拦截器 - 添加认证令牌 + 智能前缀检测 + 测试模式支持
// 注意：storage工具会自动添加 qingyu_ 前缀，所以需要使用 qingyu_token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 🧪 测试模式检测：如果处于测试模式，直接返回 mock 数据
    if (checkTestMode()) {
      console.log('[TestMode] 拦截 API 请求:', config.url)

      // 使用统一的 Mock 数据管理器
      const mockData = await handleMockRequest(config.url, {
        params: config.params as Record<string, any> | undefined
      })

      // 将 mock 数据包装成响应格式，直接 reject
      // 这样会跳过真实的 HTTP 请求
      return Promise.reject({
        _isMock: true,  // 标识这是 mock 数据
        data: mockData.data,
        config,
        status: 200,
        statusText: 'OK'
      } as any)
    }

    // 正常模式：继续处理请求
    
    // 智能前缀检测：如果URL已经包含完整路径，临时覆盖baseURL
    if (hasFullApiPath(config.url)) {
      config.baseURL = ''  // 使用空baseURL，避免重复前缀
      console.log('[Request Interceptor] 检测到完整路径，使用空baseURL:', config.url)
    } else {
      console.log('[Request Interceptor] 使用相对路径，baseURL:', config.baseURL)
    }

    const token = readStoredToken()

    console.log('[Request Interceptor] URL:', config.method?.toUpperCase(), config.url)
    console.log('[Request Interceptor] Token found:', !!token, token?.substring(0, 20) + '...')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[Request Interceptor] Authorization header set')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 令牌刷新队列
let isRefreshing = false
let failedQueue: PromiseCallbacks[] = []

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 统一返回 data 字段
    const res = response.data

    // 如果是标准API响应格式，检查是否包含分页信息
    if (res && typeof res === 'object' && 'code' in res && 'data' in res) {
      // 如果包含 pagination 字段，返回完整响应（保留 pagination）
      if ('pagination' in res) {
        return res
      }
      // 否则只返回 data 字段（保持向后兼容）
      return res.data
    }

    return res
  },
  async (error: AxiosError<ErrorResponse>) => {
    const { response, config } = error

    // 🧪 测试模式：如果是 mock 数据，直接返回
    if (error && (error as any)._isMock) {
      console.log('[TestMode] 返回 Mock 数据响应')
      const mockData = (error as any).data
      
      // 模拟标准响应格式
      if (mockData && typeof mockData === 'object' && 'code' in mockData) {
        return mockData as any
      }
      
      return mockData.data || mockData
    }

    // 网络错误处理
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请检查网络连接')
      } else {
        ElMessage.error('网络连接失败，请检查网络')
      }
      return Promise.reject(error)
    }

    const { code, message } = response.data

    // 上报错误到监控系统
    errorReporter.report(response.data)

    // 处理HTTP 401状态码（认证失败）
    if (response.status === 401) {
      // 对于登录接口，构造带有正确消息的Error对象，由调用方显示错误
      const isLoginRequest = config?.url?.includes('/auth/login') || config?.url?.includes('/login')
      if (isLoginRequest) {
        // 登录失败，使用后端返回的错误消息
        const errorMessage = message || '用户名或密码错误'
        const customError = new Error(errorMessage)
        return Promise.reject(customError)
      }
      handleAuthError()
      return Promise.reject(error)
    }

    if (code === 1102 && config) {
      // TOKEN_EXPIRED (1102)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(config)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      isRefreshing = true

      try {
        // 修复：使用 qingyu_refreshToken 前缀，并解析JSON（storage.set会JSON.stringify）
        const rawRefreshToken = localStorage.getItem('qingyu_refreshToken')
        let refreshToken = rawRefreshToken
        if (rawRefreshToken) {
          try {
            const parsed = JSON.parse(rawRefreshToken)
            refreshToken = typeof parsed === 'string' ? parsed : rawRefreshToken
          } catch {
            refreshToken = rawRefreshToken
          }
        }

        // 修复：使用正确的刷新 API 路径
        const res = await axios.post('/api/v1/shared/auth/refresh', { token: refreshToken })

        const { token: newToken } = res.data.data
        // 修复：使用 qingyu_token 前缀，并使用storage.set()保持一致性（会JSON.stringify）
        localStorage.setItem('qingyu_token', JSON.stringify(newToken))

        processQueue(null, newToken)

        return apiClient(config)
      } catch (err) {
        processQueue(err, null)
        handleAuthError()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    // 根据错误码分类处理
    switch (code) {
      // 认证错误 - 跳转登录
      case 1002: // UNAUTHORIZED (1002)
      case 1102: // TOKEN_EXPIRED (1102)
      case 1103: // TOKEN_INVALID (1103)
        handleAuthError()
        break

      // 权限错误
      case 1003: // FORBIDDEN (1003)
        ElMessage.error('您没有权限执行此操作')
        break

      // 参数错误
      case 1001: // INVALID_PARAMS (1001)
        ElMessage.warning(message || '参数错误，请检查输入')
        break

      // 资源不存在
      case 1004: // NOT_FOUND (1004)
        ElMessage.warning(message || '请求的资源不存在')
        break

      // 业务逻辑错误
      case 1007: // RATE_LIMIT_EXCEEDED (1007)
        ElMessage.error('操作过于频繁，请稍后再试')
        break

      // 系统错误
      case 5000: // INTERNAL_ERROR (5000)
        ElMessage.error('服务器内部错误，请稍后重试')
        break

      default:
        ElMessage.error(message || '请求失败，请稍后重试')
    }

    return Promise.reject(error)
  }
)

// 处理认证错误
function handleAuthError() {
  // E2E场景下避免自动登出和跳转，防止测试过程被401中断
  if (typeof navigator !== 'undefined' && navigator.webdriver) {
    console.warn('[Auth] Skip auto logout in E2E mode')
    return
  }

  // 只显示提示消息，不自动清除token或跳转
  ElMessage.warning('登录已过期，请重新登录')
}

// ==================== 自定义方法 ====================

/**
 * 设置认证Token
 */
apiClient.setAuthToken = function(token: string): void {
  this.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

/**
 * 清除认证Token
 */
apiClient.clearAuthToken = function(): void {
  delete this.defaults.headers.common['Authorization']
}

/**
 * 取消所有进行中的请求
 */
apiClient.cancelAllRequests = function(): void {
  pendingRequests.forEach((source) => {
    source.cancel('Request canceled due to cancelAllRequests')
  })
  pendingRequests.clear()
}

// ==================== 请求取消支持 ====================

// 生成请求唯一标识
const generateRequestKey = (config: InternalAxiosRequestConfig): string => {
  const { method, url } = config
  return `${method}-${url}`
}

// 请求拦截器 - 添加取消令牌支持
// 注意：认证Token已在第一个拦截器中处理，这里只处理取消令牌
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加取消令牌支持
    const key = generateRequestKey(config)
    const source = axios.CancelToken.source()
    config.cancelToken = source.token
    pendingRequests.set(key, source)

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==================== 导出 ====================

// 导出实例供模块使用
export default apiClient

// 类型安全的 HTTP 服务接口
// 响应拦截器会自动提取 response.data，所以返回类型应该是 T 而不是 AxiosResponse<T>
interface HttpService {
  get<T = any>(url: string, config?: object): Promise<T>
  post<T = any>(url: string, data?: any, config?: object): Promise<T>
  put<T = any>(url: string, data?: any, config?: object): Promise<T>
  delete<T = any>(url: string, config?: object): Promise<T>
  patch<T = any>(url: string, data?: any, config?: object): Promise<T>
  head<T = any>(url: string, config?: object): Promise<T>
  options<T = any>(url: string, config?: object): Promise<T>
}

// 别名导出，保持向后兼容，使用类型断言确保类型安全
export const httpService = apiClient as unknown as HttpService

// 同时导出类型化的实例
export { apiClient }
