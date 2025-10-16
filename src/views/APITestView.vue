<template>
  <div class="api-test-view">
    <div class="container">
      <h1 class="page-title">青羽 API 测试工具</h1>

      <!-- 导航选项卡 -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- 用户认证测试 -->
      <div v-if="currentTab === 'auth'" class="test-section">
        <h2>用户认证 API 测试</h2>

        <!-- 用户注册 -->
        <div class="test-card">
          <h3>1. 用户注册</h3>
          <div class="form-group">
            <label>用户名:</label>
            <input v-model="authData.register.username" placeholder="testuser" />
          </div>
          <div class="form-group">
            <label>邮箱:</label>
            <input v-model="authData.register.email" placeholder="test@example.com" />
          </div>
          <div class="form-group">
            <label>密码:</label>
            <input v-model="authData.register.password" type="password" placeholder="password123" />
          </div>
          <button @click="testRegister" :disabled="loading">
            {{ loading ? '请求中...' : '测试注册' }}
          </button>
          <div v-if="authData.register.result" class="result">
            <pre>{{ JSON.stringify(authData.register.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 用户登录 -->
        <div class="test-card">
          <h3>2. 用户登录</h3>
          <div class="form-group">
            <label>用户名/邮箱:</label>
            <input v-model="authData.login.username" placeholder="testuser" />
          </div>
          <div class="form-group">
            <label>密码:</label>
            <input v-model="authData.login.password" type="password" placeholder="password123" />
          </div>
          <button @click="testLogin" :disabled="loading">
            {{ loading ? '请求中...' : '测试登录' }}
          </button>
          <div v-if="authData.login.result" class="result">
            <pre>{{ JSON.stringify(authData.login.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取个人信息 -->
        <div class="test-card">
          <h3>3. 获取个人信息（需要登录）</h3>
          <p class="info">Token: {{ token ? '已设置' : '未设置' }}</p>
          <button @click="testGetProfile" :disabled="loading || !token">
            {{ loading ? '请求中...' : '获取个人信息' }}
          </button>
          <div v-if="authData.profile.result" class="result">
            <pre>{{ JSON.stringify(authData.profile.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 更新个人信息 -->
        <div class="test-card">
          <h3>4. 更新个人信息</h3>
          <div class="form-group">
            <label>昵称:</label>
            <input v-model="authData.updateProfile.nickname" placeholder="我的昵称" />
          </div>
          <div class="form-group">
            <label>个人简介:</label>
            <textarea v-model="authData.updateProfile.bio" placeholder="个人简介"></textarea>
          </div>
          <button @click="testUpdateProfile" :disabled="loading || !token">
            {{ loading ? '请求中...' : '更新信息' }}
          </button>
          <div v-if="authData.updateProfile.result" class="result">
            <pre>{{ JSON.stringify(authData.updateProfile.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 书城 API 测试 -->
      <div v-if="currentTab === 'bookstore'" class="test-section">
        <h2>书城系统 API 测试</h2>

        <!-- 获取首页数据 -->
        <div class="test-card">
          <h3>1. 获取首页数据</h3>
          <button @click="testGetHomepage" :disabled="loading">
            {{ loading ? '请求中...' : '获取首页数据' }}
          </button>
          <div v-if="bookstoreData.homepage.result" class="result">
            <pre>{{ JSON.stringify(bookstoreData.homepage.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取书籍列表 -->
        <div class="test-card">
          <h3>2. 获取书籍列表</h3>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="bookstoreData.bookList.page" type="number" min="1" />
          </div>
          <div class="form-group">
            <label>每页数量:</label>
            <input v-model.number="bookstoreData.bookList.size" type="number" min="1" max="100" />
          </div>
          <div class="form-group">
            <label>分类:</label>
            <input v-model="bookstoreData.bookList.category" placeholder="玄幻" />
          </div>
          <button @click="testGetBookList" :disabled="loading">
            {{ loading ? '请求中...' : '获取书籍列表' }}
          </button>
          <div v-if="bookstoreData.bookList.result" class="result">
            <pre>{{ JSON.stringify(bookstoreData.bookList.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 搜索书籍 -->
        <div class="test-card">
          <h3>3. 搜索书籍</h3>
          <div class="form-group">
            <label>关键词:</label>
            <input v-model="bookstoreData.search.keyword" placeholder="搜索书名或作者" />
          </div>
          <div class="form-group">
            <label>搜索类型:</label>
            <select v-model="bookstoreData.search.type">
              <option value="all">全部</option>
              <option value="title">书名</option>
              <option value="author">作者</option>
            </select>
          </div>
          <button @click="testSearchBooks" :disabled="loading">
            {{ loading ? '请求中...' : '搜索书籍' }}
          </button>
          <div v-if="bookstoreData.search.result" class="result">
            <pre>{{ JSON.stringify(bookstoreData.search.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取书籍详情 -->
        <div class="test-card">
          <h3>4. 获取书籍详情</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="bookstoreData.bookDetail.bookId" placeholder="输入书籍ID" />
          </div>
          <button @click="testGetBookDetail" :disabled="loading">
            {{ loading ? '请求中...' : '获取书籍详情' }}
          </button>
          <div v-if="bookstoreData.bookDetail.result" class="result">
            <pre>{{ JSON.stringify(bookstoreData.bookDetail.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取章节列表 -->
        <div class="test-card">
          <h3>5. 获取章节列表</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="bookstoreData.chapters.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="bookstoreData.chapters.page" type="number" min="1" />
          </div>
          <button @click="testGetChapters" :disabled="loading">
            {{ loading ? '请求中...' : '获取章节列表' }}
          </button>
          <div v-if="bookstoreData.chapters.result" class="result">
            <pre>{{ JSON.stringify(bookstoreData.chapters.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取分类列表 -->
        <div class="test-card">
          <h3>6. 获取所有分类</h3>
          <button @click="testGetCategories" :disabled="loading">
            {{ loading ? '请求中...' : '获取分类列表' }}
          </button>
          <div v-if="bookstoreData.categories.result" class="result">
            <pre>{{ JSON.stringify(bookstoreData.categories.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 阅读器 API 测试 -->
      <div v-if="currentTab === 'reader'" class="test-section">
        <h2>阅读器系统 API 测试</h2>

        <!-- 获取章节内容 -->
        <div class="test-card">
          <h3>1. 获取章节内容（需要登录）</h3>
          <p class="info">Token: {{ token ? '已设置' : '未设置' }}</p>
          <div class="form-group">
            <label>章节ID:</label>
            <input v-model="readerData.chapterContent.chapterId" placeholder="输入章节ID" />
          </div>
          <button @click="testGetChapterContent" :disabled="loading || !token">
            {{ loading ? '请求中...' : '获取章节内容' }}
          </button>
          <div v-if="readerData.chapterContent.result" class="result">
            <pre>{{ JSON.stringify(readerData.chapterContent.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 章节导航 -->
        <div class="test-card">
          <h3>2. 获取章节导航</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="readerData.navigation.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>章节号:</label>
            <input v-model.number="readerData.navigation.chapterNum" type="number" min="1" />
          </div>
          <button @click="testGetNavigation" :disabled="loading">
            {{ loading ? '请求中...' : '获取章节导航' }}
          </button>
          <div v-if="readerData.navigation.result" class="result">
            <pre>{{ JSON.stringify(readerData.navigation.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 保存阅读进度 -->
        <div class="test-card">
          <h3>3. 保存阅读进度（需要登录）</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="readerData.progress.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>章节ID:</label>
            <input v-model="readerData.progress.chapterId" placeholder="输入章节ID" />
          </div>
          <div class="form-group">
            <label>进度 (0.0-1.0):</label>
            <input v-model.number="readerData.progress.progress" type="number" min="0" max="1" step="0.01" />
          </div>
          <button @click="testSaveProgress" :disabled="loading || !token">
            {{ loading ? '请求中...' : '保存进度' }}
          </button>
          <div v-if="readerData.progress.result" class="result">
            <pre>{{ JSON.stringify(readerData.progress.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取阅读进度 -->
        <div class="test-card">
          <h3>4. 获取阅读进度</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="readerData.getProgress.bookId" placeholder="输入书籍ID" />
          </div>
          <button @click="testGetProgress" :disabled="loading || !token">
            {{ loading ? '请求中...' : '获取进度' }}
          </button>
          <div v-if="readerData.getProgress.result" class="result">
            <pre>{{ JSON.stringify(readerData.getProgress.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取阅读历史 -->
        <div class="test-card">
          <h3>5. 获取阅读历史</h3>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="readerData.history.page" type="number" min="1" />
          </div>
          <button @click="testGetHistory" :disabled="loading || !token">
            {{ loading ? '请求中...' : '获取阅读历史' }}
          </button>
          <div v-if="readerData.history.result" class="result">
            <pre>{{ JSON.stringify(readerData.history.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取阅读设置 -->
        <div class="test-card">
          <h3>6. 获取阅读设置</h3>
          <button @click="testGetSettings" :disabled="loading || !token">
            {{ loading ? '请求中...' : '获取阅读设置' }}
          </button>
          <div v-if="readerData.settings.result" class="result">
            <pre>{{ JSON.stringify(readerData.settings.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 更新阅读设置 -->
        <div class="test-card">
          <h3>7. 更新阅读设置</h3>
          <div class="form-group">
            <label>字体大小 (12-24):</label>
            <input v-model.number="readerData.updateSettings.fontSize" type="number" min="12" max="24" />
          </div>
          <div class="form-group">
            <label>主题:</label>
            <select v-model="readerData.updateSettings.theme">
              <option value="default">默认</option>
              <option value="night">夜间</option>
              <option value="sepia">护眼</option>
            </select>
          </div>
          <button @click="testUpdateSettings" :disabled="loading || !token">
            {{ loading ? '请求中...' : '更新设置' }}
          </button>
          <div v-if="readerData.updateSettings.result" class="result">
            <pre>{{ JSON.stringify(readerData.updateSettings.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 注记功能测试 -->
      <div v-if="currentTab === 'annotation'" class="test-section">
        <h2>注记功能 API 测试</h2>

        <!-- 创建注记 -->
        <div class="test-card">
          <h3>1. 创建注记（需要登录）</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="annotationData.create.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>章节ID:</label>
            <input v-model="annotationData.create.chapterId" placeholder="输入章节ID" />
          </div>
          <div class="form-group">
            <label>类型:</label>
            <select v-model="annotationData.create.type">
              <option value="bookmark">书签</option>
              <option value="highlight">高亮</option>
              <option value="note">笔记</option>
            </select>
          </div>
          <div class="form-group">
            <label>选中文本:</label>
            <input v-model="annotationData.create.text" placeholder="选中的文本" />
          </div>
          <div class="form-group" v-if="annotationData.create.type === 'note'">
            <label>笔记内容:</label>
            <textarea v-model="annotationData.create.note" placeholder="笔记内容"></textarea>
          </div>
          <div class="form-group">
            <label>范围:</label>
            <input v-model="annotationData.create.range" placeholder="100-150" />
          </div>
          <button @click="testCreateAnnotation" :disabled="loading || !token">
            {{ loading ? '请求中...' : '创建注记' }}
          </button>
          <div v-if="annotationData.create.result" class="result">
            <pre>{{ JSON.stringify(annotationData.create.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取书籍注记 -->
        <div class="test-card">
          <h3>2. 获取书籍注记列表</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="annotationData.list.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>类型筛选:</label>
            <select v-model="annotationData.list.type">
              <option value="">全部</option>
              <option value="bookmark">书签</option>
              <option value="highlight">高亮</option>
              <option value="note">笔记</option>
            </select>
          </div>
          <button @click="testGetAnnotations" :disabled="loading || !token">
            {{ loading ? '请求中...' : '获取注记列表' }}
          </button>
          <div v-if="annotationData.list.result" class="result">
            <pre>{{ JSON.stringify(annotationData.list.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取注记统计 -->
        <div class="test-card">
          <h3>3. 获取注记统计</h3>
          <button @click="testGetAnnotationStats" :disabled="loading || !token">
            {{ loading ? '请求中...' : '获取统计' }}
          </button>
          <div v-if="annotationData.stats.result" class="result">
            <pre>{{ JSON.stringify(annotationData.stats.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 删除注记 -->
        <div class="test-card">
          <h3>4. 删除注记</h3>
          <div class="form-group">
            <label>注记ID:</label>
            <input v-model="annotationData.delete.annotationId" placeholder="输入注记ID" />
          </div>
          <button @click="testDeleteAnnotation" :disabled="loading || !token">
            {{ loading ? '请求中...' : '删除注记' }}
          </button>
          <div v-if="annotationData.delete.result" class="result">
            <pre>{{ JSON.stringify(annotationData.delete.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 评分系统测试 -->
      <div v-if="currentTab === 'rating'" class="test-section">
        <h2>评分系统 API 测试</h2>

        <!-- 获取书籍评分列表 -->
        <div class="test-card">
          <h3>1. 获取书籍评分列表</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="ratingData.list.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="ratingData.list.page" type="number" min="1" />
          </div>
          <button @click="testGetRatings" :disabled="loading">
            {{ loading ? '请求中...' : '获取评分列表' }}
          </button>
          <div v-if="ratingData.list.result" class="result">
            <pre>{{ JSON.stringify(ratingData.list.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取评分统计 -->
        <div class="test-card">
          <h3>2. 获取评分统计</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="ratingData.stats.bookId" placeholder="输入书籍ID" />
          </div>
          <button @click="testGetRatingStats" :disabled="loading">
            {{ loading ? '请求中...' : '获取评分统计' }}
          </button>
          <div v-if="ratingData.stats.result" class="result">
            <pre>{{ JSON.stringify(ratingData.stats.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 创建评分 -->
        <div class="test-card">
          <h3>3. 创建评分（需要登录）</h3>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="ratingData.create.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>评分 (1-5):</label>
            <input v-model.number="ratingData.create.rating" type="number" min="1" max="5" />
          </div>
          <div class="form-group">
            <label>评价内容:</label>
            <textarea v-model="ratingData.create.review" placeholder="写下你的评价"></textarea>
          </div>
          <button @click="testCreateRating" :disabled="loading || !token">
            {{ loading ? '请求中...' : '提交评分' }}
          </button>
          <div v-if="ratingData.create.result" class="result">
            <pre>{{ JSON.stringify(ratingData.create.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 更新评分 -->
        <div class="test-card">
          <h3>4. 更新评分</h3>
          <div class="form-group">
            <label>评分ID:</label>
            <input v-model="ratingData.update.ratingId" placeholder="输入评分ID" />
          </div>
          <div class="form-group">
            <label>评分 (1-5):</label>
            <input v-model.number="ratingData.update.rating" type="number" min="1" max="5" />
          </div>
          <div class="form-group">
            <label>评价内容:</label>
            <textarea v-model="ratingData.update.review" placeholder="更新评价内容"></textarea>
          </div>
          <button @click="testUpdateRating" :disabled="loading || !token">
            {{ loading ? '请求中...' : '更新评分' }}
          </button>
          <div v-if="ratingData.update.result" class="result">
            <pre>{{ JSON.stringify(ratingData.update.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 删除评分 -->
        <div class="test-card">
          <h3>5. 删除评分</h3>
          <div class="form-group">
            <label>评分ID:</label>
            <input v-model="ratingData.delete.ratingId" placeholder="输入评分ID" />
          </div>
          <button @click="testDeleteRating" :disabled="loading || !token">
            {{ loading ? '请求中...' : '删除评分' }}
          </button>
          <div v-if="ratingData.delete.result" class="result">
            <pre>{{ JSON.stringify(ratingData.delete.result, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { userAPI } from '@/api/user'
import { bookstoreAPI } from '@/api/bookstore'
import { booksAPI } from '@/api/reading/books'
import { readerAPI } from '@/api/reading/reader'
import { ratingAPI } from '@/api/reading/rating'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const token = computed(() => authStore.token)

const loading = ref(false)
const currentTab = ref('auth')

const tabs = [
  { id: 'auth', name: '用户认证' },
  { id: 'bookstore', name: '书城系统' },
  { id: 'reader', name: '阅读器' },
  { id: 'annotation', name: '注记功能' },
  { id: 'rating', name: '评分系统' }
]

// 认证数据
const authData = ref({
  register: {
    username: 'testuser' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    result: null
  },
  login: {
    username: '',
    password: '',
    result: null
  },
  profile: {
    result: null
  },
  updateProfile: {
    nickname: '测试昵称',
    bio: '这是我的个人简介',
    result: null
  }
})

// 书城数据
const bookstoreData = ref({
  homepage: {
    result: null
  },
  bookList: {
    page: 1,
    size: 20,
    category: '',
    result: null
  },
  search: {
    keyword: '',
    type: 'all',
    result: null
  },
  bookDetail: {
    bookId: '',
    result: null
  },
  chapters: {
    bookId: '',
    page: 1,
    result: null
  },
  categories: {
    result: null
  }
})

// 阅读器数据
const readerData = ref({
  chapterContent: {
    chapterId: '',
    result: null
  },
  navigation: {
    bookId: '',
    chapterNum: 1,
    result: null
  },
  progress: {
    bookId: '',
    chapterId: '',
    progress: 0.5,
    result: null
  },
  getProgress: {
    bookId: '',
    result: null
  },
  history: {
    page: 1,
    result: null
  },
  settings: {
    result: null
  },
  updateSettings: {
    fontSize: 16,
    theme: 'default',
    result: null
  }
})

// 注记数据
const annotationData = ref({
  create: {
    bookId: '',
    chapterId: '',
    type: 'highlight',
    text: '',
    note: '',
    range: '',
    result: null
  },
  list: {
    bookId: '',
    type: '',
    result: null
  },
  stats: {
    result: null
  },
  delete: {
    annotationId: '',
    result: null
  }
})

// 评分数据
const ratingData = ref({
  list: {
    bookId: '',
    page: 1,
    result: null
  },
  stats: {
    bookId: '',
    result: null
  },
  create: {
    bookId: '',
    rating: 5,
    review: '',
    result: null
  },
  update: {
    ratingId: '',
    rating: 5,
    review: '',
    result: null
  },
  delete: {
    ratingId: '',
    result: null
  }
})

// 测试方法
const handleRequest = async (apiCall, resultRef) => {
  loading.value = true
  try {
    const response = await apiCall()
    resultRef.value = response
    console.log('API响应:', response)
  } catch (error) {
    resultRef.value = {
      error: true,
      message: error.message || '请求失败',
      details: error
    }
    console.error('API错误:', error)
  } finally {
    loading.value = false
  }
}

// 认证测试方法
const testRegister = () => handleRequest(
  () => userAPI.register(authData.value.register),
  () => authData.value.register.result
)

const testLogin = async () => {
  loading.value = true
  try {
    const response = await userAPI.login(authData.value.login)
    authData.value.login.result = response
    if (response.data && response.data.token) {
      authStore.setToken(response.data.token)
      authStore.setUser(response.data)
    }
  } catch (error) {
    authData.value.login.result = {
      error: true,
      message: error.message || '登录失败'
    }
  } finally {
    loading.value = false
  }
}

const testGetProfile = () => handleRequest(
  () => userAPI.getProfile(),
  () => authData.value.profile.result
)

const testUpdateProfile = () => handleRequest(
  () => userAPI.updateProfile(authData.value.updateProfile),
  () => authData.value.updateProfile.result
)

// 书城测试方法
const testGetHomepage = () => handleRequest(
  () => bookstoreAPI.getHomepage(),
  () => bookstoreData.value.homepage.result
)

const testGetBookList = () => handleRequest(
  () => booksAPI.getBookList({
    page: bookstoreData.value.bookList.page,
    size: bookstoreData.value.bookList.size,
    category: bookstoreData.value.bookList.category || undefined
  }),
  () => bookstoreData.value.bookList.result
)

const testSearchBooks = () => handleRequest(
  () => booksAPI.searchBooks({
    q: bookstoreData.value.search.keyword,
    type: bookstoreData.value.search.type
  }),
  () => bookstoreData.value.search.result
)

const testGetBookDetail = () => handleRequest(
  () => booksAPI.getBookDetail(bookstoreData.value.bookDetail.bookId),
  () => bookstoreData.value.bookDetail.result
)

const testGetChapters = () => handleRequest(
  () => booksAPI.getBookChapters(
    bookstoreData.value.chapters.bookId,
    bookstoreData.value.chapters.page
  ),
  () => bookstoreData.value.chapters.result
)

const testGetCategories = () => handleRequest(
  () => booksAPI.getAllCategories(),
  () => bookstoreData.value.categories.result
)

// 阅读器测试方法
const testGetChapterContent = () => handleRequest(
  () => readerAPI.getChapterContent(readerData.value.chapterContent.chapterId),
  () => readerData.value.chapterContent.result
)

const testGetNavigation = () => handleRequest(
  () => readerAPI.getChapterNavigation(
    readerData.value.navigation.bookId,
    readerData.value.navigation.chapterNum
  ),
  () => readerData.value.navigation.result
)

const testSaveProgress = () => handleRequest(
  () => readerAPI.saveProgress(readerData.value.progress),
  () => readerData.value.progress.result
)

const testGetProgress = () => handleRequest(
  () => readerAPI.getProgress(readerData.value.getProgress.bookId),
  () => readerData.value.getProgress.result
)

const testGetHistory = () => handleRequest(
  () => readerAPI.getReadingHistory(readerData.value.history.page),
  () => readerData.value.history.result
)

const testGetSettings = () => handleRequest(
  () => readerAPI.getSettings(),
  () => readerData.value.settings.result
)

const testUpdateSettings = () => handleRequest(
  () => readerAPI.updateSettings(readerData.value.updateSettings),
  () => readerData.value.updateSettings.result
)

// 注记测试方法
const testCreateAnnotation = () => handleRequest(
  () => readerAPI.createAnnotation(annotationData.value.create),
  () => annotationData.value.create.result
)

const testGetAnnotations = () => handleRequest(
  () => readerAPI.getBookAnnotations(
    annotationData.value.list.bookId,
    annotationData.value.list.type
  ),
  () => annotationData.value.list.result
)

const testGetAnnotationStats = () => handleRequest(
  () => readerAPI.getAnnotationStats(),
  () => annotationData.value.stats.result
)

const testDeleteAnnotation = () => handleRequest(
  () => readerAPI.deleteAnnotation(annotationData.value.delete.annotationId),
  () => annotationData.value.delete.result
)

// 评分测试方法
const testGetRatings = () => handleRequest(
  () => ratingAPI.getBookRatings(
    ratingData.value.list.bookId,
    ratingData.value.list.page
  ),
  () => ratingData.value.list.result
)

const testGetRatingStats = () => handleRequest(
  () => ratingAPI.getBookRatingStats(ratingData.value.stats.bookId),
  () => ratingData.value.stats.result
)

const testCreateRating = () => handleRequest(
  () => ratingAPI.createRating(ratingData.value.create),
  () => ratingData.value.create.result
)

const testUpdateRating = () => handleRequest(
  () => ratingAPI.updateRating(
    ratingData.value.update.ratingId,
    {
      rating: ratingData.value.update.rating,
      review: ratingData.value.update.review
    }
  ),
  () => ratingData.value.update.result
)

const testDeleteRating = () => handleRequest(
  () => ratingAPI.deleteRating(ratingData.value.delete.ratingId),
  () => ratingData.value.delete.result
)
</script>

<style scoped>
.api-test-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab {
  padding: 10px 20px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.tab:hover {
  border-color: #4CAF50;
}

.tab.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.test-section h2 {
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4CAF50;
}

.test-card {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.test-card h3 {
  color: #555;
  margin-bottom: 15px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.info {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result {
  margin-top: 15px;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #4CAF50;
  max-height: 500px;
  overflow-y: auto;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
  color: #333;
}
</style>


