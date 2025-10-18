<template>
  <div class="comprehensive-api-test">
    <div class="container">
      <h1 class="page-title">青羽完整API测试工具</h1>

      <!-- Token 状态显示 -->
      <div class="token-status" :class="{ active: token }">
        <span class="label">Token状态:</span>
        <span class="value">{{ token ? '✓ 已设置' : '✗ 未设置' }}</span>
        <button v-if="token" @click="clearToken" class="clear-btn">清除Token</button>
      </div>

      <!-- 导航选项卡 -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.id" :class="['tab', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id">
          {{ tab.name }}
        </button>
      </div>

      <!-- 认证与用户测试 -->
      <div v-if="currentTab === 'auth'" class="test-section">
        <h2>认证与用户系统 API</h2>

        <!-- 用户注册 -->
        <div class="test-card">
          <h3>1. 用户注册</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/register</span>
            <span class="auth-badge">无需认证</span>
          </div>
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
          <div class="button-group">
            <button @click="testRegister" :disabled="loading" class="test-btn">
              {{ loading ? '请求中...' : '测试注册' }}
            </button>
            <button @click="quickFillRegister" class="quick-fill-btn">快速填充</button>
          </div>
          <div v-if="authData.register.result" class="result"
            :class="authData.register.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.register.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 用户登录 -->
        <div class="test-card">
          <h3>2. 用户登录</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/login</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>用户名/邮箱:</label>
            <input v-model="authData.login.username" placeholder="testuser" />
          </div>
          <div class="form-group">
            <label>密码:</label>
            <input v-model="authData.login.password" type="password" placeholder="password123" />
          </div>
          <div class="button-group">
            <button @click="testLogin" :disabled="loading" class="test-btn">
              {{ loading ? '请求中...' : '测试登录' }}
            </button>
            <button @click="quickFillLogin" class="quick-fill-btn">快速填充</button>
          </div>
          <div v-if="authData.login.result" class="result" :class="authData.login.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.login.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- Token刷新 -->
        <div class="test-card">
          <h3>3. Token刷新</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/shared/auth/refresh</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testRefreshToken" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '刷新Token' }}
          </button>
          <div v-if="authData.refresh.result" class="result"
            :class="authData.refresh.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.refresh.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取权限 -->
        <div class="test-card">
          <h3>4. 获取用户权限</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/auth/permissions</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testGetPermissions" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取权限' }}
          </button>
          <div v-if="authData.permissions.result" class="result"
            :class="authData.permissions.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.permissions.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取角色 -->
        <div class="test-card">
          <h3>5. 获取用户角色</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/auth/roles</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testGetRoles" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取角色' }}
          </button>
          <div v-if="authData.roles.result" class="result" :class="authData.roles.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.roles.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 登出 -->
        <div class="test-card">
          <h3>6. 用户登出</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/shared/auth/logout</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testLogout" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '登出' }}
          </button>
          <div v-if="authData.logout.result" class="result" :class="authData.logout.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.logout.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取个人信息 -->
        <div class="test-card">
          <h3>7. 获取个人信息</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/users/profile</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testGetProfile" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取个人信息' }}
          </button>
          <div v-if="authData.profile.result" class="result"
            :class="authData.profile.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.profile.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 更新个人信息 -->
        <div class="test-card">
          <h3>8. 更新个人信息</h3>
          <div class="api-info">
            <span class="method put">PUT</span>
            <span class="path">/api/v1/users/profile</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>昵称:</label>
            <input v-model="authData.updateProfile.nickname" placeholder="我的昵称" />
          </div>
          <div class="form-group">
            <label>个人简介:</label>
            <textarea v-model="authData.updateProfile.bio" placeholder="个人简介"></textarea>
          </div>
          <button @click="testUpdateProfile" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '更新信息' }}
          </button>
          <div v-if="authData.updateProfile.result" class="result"
            :class="authData.updateProfile.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.updateProfile.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 修改密码 -->
        <div class="test-card">
          <h3>9. 修改密码</h3>
          <div class="api-info">
            <span class="method put">PUT</span>
            <span class="path">/api/v1/users/password</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>旧密码:</label>
            <input v-model="authData.changePassword.oldPassword" type="password" placeholder="旧密码" />
          </div>
          <div class="form-group">
            <label>新密码:</label>
            <input v-model="authData.changePassword.newPassword" type="password" placeholder="新密码" />
          </div>
          <button @click="testChangePassword" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '修改密码' }}
          </button>
          <div v-if="authData.changePassword.result" class="result"
            :class="authData.changePassword.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(authData.changePassword.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 书城系统测试 -->
      <div v-if="currentTab === 'bookstore'" class="test-section">
        <h2>书城系统 API</h2>

        <!-- 获取首页数据 -->
        <div class="test-card">
          <h3>1. 获取首页数据</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/homepage</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <button @click="testGetHomepage" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取首页数据' }}
          </button>
          <div v-if="bookstoreData.homepage.result" class="result"
            :class="bookstoreData.homepage.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.homepage.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取书籍列表 -->
        <div class="test-card">
          <h3>2. 获取书籍列表</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/books</span>
            <span class="auth-badge">无需认证</span>
          </div>
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
          <button @click="testGetBookList" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取书籍列表' }}
          </button>
          <div v-if="bookstoreData.bookList.result" class="result"
            :class="bookstoreData.bookList.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.bookList.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 搜索书籍 -->
        <div class="test-card">
          <h3>3. 搜索书籍</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/books/search</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>关键词:</label>
            <input v-model="bookstoreData.search.keyword" placeholder="搜索书名或作者" />
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="bookstoreData.search.page" type="number" min="1" />
          </div>
          <button @click="testSearchBooks" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '搜索书籍' }}
          </button>
          <div v-if="bookstoreData.search.result" class="result"
            :class="bookstoreData.search.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.search.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取书籍详情 -->
        <div class="test-card">
          <h3>4. 获取书籍详情</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/books/:id</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="bookstoreData.bookDetail.bookId" placeholder="输入书籍ID" />
          </div>
          <button @click="testGetBookDetail" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取书籍详情' }}
          </button>
          <div v-if="bookstoreData.bookDetail.result" class="result"
            :class="bookstoreData.bookDetail.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.bookDetail.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取分类列表 -->
        <div class="test-card">
          <h3>5. 获取分类列表</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/categories</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <button @click="testGetCategories" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取分类列表' }}
          </button>
          <div v-if="bookstoreData.categories.result" class="result"
            :class="bookstoreData.categories.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.categories.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取Banner列表 -->
        <div class="test-card">
          <h3>6. 获取Banner列表</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/banners</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>数量限制:</label>
            <input v-model.number="bookstoreData.banners.limit" type="number" min="1" max="20" />
          </div>
          <button @click="testGetBanners" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取Banner列表' }}
          </button>
          <div v-if="bookstoreData.banners.result" class="result"
            :class="bookstoreData.banners.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.banners.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取实时榜 -->
        <div class="test-card">
          <h3>7. 获取实时榜</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/rankings/realtime</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>数量:</label>
            <input v-model.number="bookstoreData.rankings.limit" type="number" min="1" max="100" />
          </div>
          <button @click="testGetRealtimeRanking" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取实时榜' }}
          </button>
          <div v-if="bookstoreData.rankings.realtime" class="result"
            :class="bookstoreData.rankings.realtime.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.rankings.realtime, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取周榜 -->
        <div class="test-card">
          <h3>8. 获取周榜</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/rankings/weekly</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>数量:</label>
            <input v-model.number="bookstoreData.rankings.limit" type="number" min="1" max="100" />
          </div>
          <button @click="testGetWeeklyRanking" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取周榜' }}
          </button>
          <div v-if="bookstoreData.rankings.weekly" class="result"
            :class="bookstoreData.rankings.weekly.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.rankings.weekly, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取月榜 -->
        <div class="test-card">
          <h3>9. 获取月榜</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/rankings/monthly</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>数量:</label>
            <input v-model.number="bookstoreData.rankings.limit" type="number" min="1" max="100" />
          </div>
          <button @click="testGetMonthlyRanking" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取月榜' }}
          </button>
          <div v-if="bookstoreData.rankings.monthly" class="result"
            :class="bookstoreData.rankings.monthly.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.rankings.monthly, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取新人榜 -->
        <div class="test-card">
          <h3>10. 获取新人榜</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/bookstore/rankings/newbie</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>数量:</label>
            <input v-model.number="bookstoreData.rankings.limit" type="number" min="1" max="100" />
          </div>
          <button @click="testGetNewbieRanking" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取新人榜' }}
          </button>
          <div v-if="bookstoreData.rankings.newbie" class="result"
            :class="bookstoreData.rankings.newbie.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(bookstoreData.rankings.newbie, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 阅读器测试 -->
      <div v-if="currentTab === 'reader'" class="test-section">
        <h2>阅读器系统 API</h2>

        <!-- 获取章节内容 -->
        <div class="test-card">
          <h3>1. 获取章节内容</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/reader/chapters/:id/content</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>章节ID:</label>
            <input v-model="readerData.chapterContent.chapterId" placeholder="输入章节ID" />
          </div>
          <button @click="testGetChapterContent" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取章节内容' }}
          </button>
          <div v-if="readerData.chapterContent.result" class="result"
            :class="readerData.chapterContent.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.chapterContent.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取章节列表 -->
        <div class="test-card">
          <h3>2. 获取章节列表</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/reader/chapters</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="readerData.chapterList.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="readerData.chapterList.page" type="number" min="1" />
          </div>
          <button @click="testGetChapterList" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取章节列表' }}
          </button>
          <div v-if="readerData.chapterList.result" class="result"
            :class="readerData.chapterList.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.chapterList.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 保存阅读进度 -->
        <div class="test-card">
          <h3>3. 保存阅读进度</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/reader/progress</span>
            <span class="auth-badge required">需要Token</span>
          </div>
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
          <button @click="testSaveProgress" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '保存进度' }}
          </button>
          <div v-if="readerData.progress.result" class="result"
            :class="readerData.progress.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.progress.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取阅读进度 -->
        <div class="test-card">
          <h3>4. 获取阅读进度</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/reader/progress/:bookId</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="readerData.getProgress.bookId" placeholder="输入书籍ID" />
          </div>
          <button @click="testGetProgress" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取进度' }}
          </button>
          <div v-if="readerData.getProgress.result" class="result"
            :class="readerData.getProgress.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.getProgress.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取阅读历史 -->
        <div class="test-card">
          <h3>5. 获取阅读历史</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/reader/progress/history</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="readerData.history.page" type="number" min="1" />
          </div>
          <button @click="testGetHistory" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取阅读历史' }}
          </button>
          <div v-if="readerData.history.result" class="result"
            :class="readerData.history.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.history.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 创建注记 -->
        <div class="test-card">
          <h3>6. 创建注记</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/reader/annotations</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="readerData.annotation.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>章节ID:</label>
            <input v-model="readerData.annotation.chapterId" placeholder="输入章节ID" />
          </div>
          <div class="form-group">
            <label>类型:</label>
            <select v-model="readerData.annotation.type">
              <option value="bookmark">书签</option>
              <option value="highlight">高亮</option>
              <option value="note">笔记</option>
            </select>
          </div>
          <div class="form-group">
            <label>选中文本:</label>
            <input v-model="readerData.annotation.text" placeholder="选中的文本" />
          </div>
          <div class="form-group" v-if="readerData.annotation.type === 'note'">
            <label>笔记内容:</label>
            <textarea v-model="readerData.annotation.note" placeholder="笔记内容"></textarea>
          </div>
          <button @click="testCreateAnnotation" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '创建注记' }}
          </button>
          <div v-if="readerData.annotation.result" class="result"
            :class="readerData.annotation.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.annotation.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取阅读设置 -->
        <div class="test-card">
          <h3>7. 获取阅读设置</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/reader/settings</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testGetSettings" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取阅读设置' }}
          </button>
          <div v-if="readerData.settings.result" class="result"
            :class="readerData.settings.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.settings.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 更新阅读设置 -->
        <div class="test-card">
          <h3>8. 更新阅读设置</h3>
          <div class="api-info">
            <span class="method put">PUT</span>
            <span class="path">/api/v1/reader/settings</span>
            <span class="auth-badge required">需要Token</span>
          </div>
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
          <button @click="testUpdateSettings" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '更新设置' }}
          </button>
          <div v-if="readerData.updateSettings.result" class="result"
            :class="readerData.updateSettings.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(readerData.updateSettings.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 推荐系统测试 -->
      <div v-if="currentTab === 'recommendation'" class="test-section">
        <h2>推荐系统 API</h2>

        <!-- 获取个性化推荐 -->
        <div class="test-card">
          <h3>1. 获取个性化推荐</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/recommendation/personalized</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>推荐数量:</label>
            <input v-model.number="recommendationData.personalized.limit" type="number" min="1" max="50" />
          </div>
          <button @click="testGetPersonalizedRecommendations" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取个性化推荐' }}
          </button>
          <div v-if="recommendationData.personalized.result" class="result"
            :class="recommendationData.personalized.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(recommendationData.personalized.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取相似推荐 -->
        <div class="test-card">
          <h3>2. 获取相似推荐</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/recommendation/similar</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>物品ID (书籍ID):</label>
            <input v-model="recommendationData.similar.itemId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>推荐数量:</label>
            <input v-model.number="recommendationData.similar.limit" type="number" min="1" max="50" />
          </div>
          <button @click="testGetSimilarItems" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取相似推荐' }}
          </button>
          <div v-if="recommendationData.similar.result" class="result"
            :class="recommendationData.similar.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(recommendationData.similar.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 记录用户行为 -->
        <div class="test-card">
          <h3>3. 记录用户行为</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/recommendation/behavior</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>物品ID:</label>
            <input v-model="recommendationData.behavior.itemId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>行为类型:</label>
            <select v-model="recommendationData.behavior.behaviorType">
              <option value="view">浏览</option>
              <option value="click">点击</option>
              <option value="favorite">收藏</option>
              <option value="purchase">购买</option>
            </select>
          </div>
          <button @click="testRecordBehavior" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '记录行为' }}
          </button>
          <div v-if="recommendationData.behavior.result" class="result"
            :class="recommendationData.behavior.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(recommendationData.behavior.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取首页推荐 -->
        <div class="test-card">
          <h3>4. 获取首页推荐</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/recommendation/homepage</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>推荐数量:</label>
            <input v-model.number="recommendationData.homepage.limit" type="number" min="1" max="50" />
          </div>
          <button @click="testGetHomepageRecommendations" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取首页推荐' }}
          </button>
          <div v-if="recommendationData.homepage.result" class="result"
            :class="recommendationData.homepage.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(recommendationData.homepage.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取热门推荐 -->
        <div class="test-card">
          <h3>5. 获取热门推荐</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/recommendation/hot</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>推荐数量:</label>
            <input v-model.number="recommendationData.hot.limit" type="number" min="1" max="50" />
          </div>
          <div class="form-group">
            <label>统计天数:</label>
            <input v-model.number="recommendationData.hot.days" type="number" min="1" max="30" />
          </div>
          <button @click="testGetHotRecommendations" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取热门推荐' }}
          </button>
          <div v-if="recommendationData.hot.result" class="result"
            :class="recommendationData.hot.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(recommendationData.hot.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取分类推荐 -->
        <div class="test-card">
          <h3>6. 获取分类推荐</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/recommendation/category</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>分类名称/ID:</label>
            <input v-model="recommendationData.category.category" placeholder="输入分类名称或ID" />
          </div>
          <div class="form-group">
            <label>推荐数量:</label>
            <input v-model.number="recommendationData.category.limit" type="number" min="1" max="50" />
          </div>
          <button @click="testGetCategoryRecommendations" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取分类推荐' }}
          </button>
          <div v-if="recommendationData.category.result" class="result"
            :class="recommendationData.category.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(recommendationData.category.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 评分系统测试 -->
      <div v-if="currentTab === 'rating'" class="test-section">
        <h2>评分系统 API</h2>

        <!-- 获取书籍评分列表 -->
        <div class="test-card">
          <h3>1. 获取书籍评分列表</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/ratings/book/:bookId</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="ratingData.list.bookId" placeholder="输入书籍ID" />
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="ratingData.list.page" type="number" min="1" />
          </div>
          <button @click="testGetRatings" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取评分列表' }}
          </button>
          <div v-if="ratingData.list.result" class="result" :class="ratingData.list.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(ratingData.list.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 获取评分统计 -->
        <div class="test-card">
          <h3>2. 获取评分统计</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/ratings/book/:bookId/stats</span>
            <span class="auth-badge">无需认证</span>
          </div>
          <div class="form-group">
            <label>书籍ID:</label>
            <input v-model="ratingData.stats.bookId" placeholder="输入书籍ID" />
          </div>
          <button @click="testGetRatingStats" :disabled="loading" class="test-btn">
            {{ loading ? '请求中...' : '获取评分统计' }}
          </button>
          <div v-if="ratingData.stats.result" class="result"
            :class="ratingData.stats.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(ratingData.stats.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 创建评分 -->
        <div class="test-card">
          <h3>3. 创建评分</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/ratings</span>
            <span class="auth-badge required">需要Token</span>
          </div>
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
          <button @click="testCreateRating" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '提交评分' }}
          </button>
          <div v-if="ratingData.create.result" class="result"
            :class="ratingData.create.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(ratingData.create.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 更新评分 -->
        <div class="test-card">
          <h3>4. 更新评分</h3>
          <div class="api-info">
            <span class="method put">PUT</span>
            <span class="path">/api/v1/ratings/:id</span>
            <span class="auth-badge required">需要Token</span>
          </div>
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
          <button @click="testUpdateRating" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '更新评分' }}
          </button>
          <div v-if="ratingData.update.result" class="result"
            :class="ratingData.update.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(ratingData.update.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 删除评分 -->
        <div class="test-card">
          <h3>5. 删除评分</h3>
          <div class="api-info">
            <span class="method delete">DELETE</span>
            <span class="path">/api/v1/ratings/:id</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>评分ID:</label>
            <input v-model="ratingData.delete.ratingId" placeholder="输入评分ID" />
          </div>
          <button @click="testDeleteRating" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '删除评分' }}
          </button>
          <div v-if="ratingData.delete.result" class="result"
            :class="ratingData.delete.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(ratingData.delete.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 共享服务测试 -->
      <div v-if="currentTab === 'shared'" class="test-section">
        <h2>共享服务 API</h2>

        <!-- 钱包：查询余额 -->
        <div class="test-card">
          <h3>1. 查询钱包余额</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/wallet/balance</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testGetBalance" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '查询余额' }}
          </button>
          <div v-if="sharedData.wallet.balance" class="result"
            :class="sharedData.wallet.balance.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.wallet.balance, null, 2) }}</pre>
          </div>
        </div>

        <!-- 钱包：获取钱包信息 -->
        <div class="test-card">
          <h3>2. 获取钱包信息</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/wallet</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <button @click="testGetWallet" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取钱包信息' }}
          </button>
          <div v-if="sharedData.wallet.info" class="result" :class="sharedData.wallet.info.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.wallet.info, null, 2) }}</pre>
          </div>
        </div>

        <!-- 钱包：充值 -->
        <div class="test-card">
          <h3>3. 钱包充值</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/shared/wallet/recharge</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>金额:</label>
            <input v-model.number="sharedData.wallet.recharge.amount" type="number" min="0.01" step="10" />
          </div>
          <div class="form-group">
            <label>支付方式:</label>
            <select v-model="sharedData.wallet.recharge.method">
              <option value="alipay">支付宝</option>
              <option value="wechat">微信</option>
              <option value="bank">银行卡</option>
            </select>
          </div>
          <button @click="testRecharge" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '测试充值' }}
          </button>
          <div v-if="sharedData.wallet.recharge.result" class="result"
            :class="sharedData.wallet.recharge.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.wallet.recharge.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 钱包：消费 -->
        <div class="test-card">
          <h3>4. 钱包消费</h3>
          <div class="api-info">
            <span class="method post">POST</span>
            <span class="path">/api/v1/shared/wallet/consume</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>金额:</label>
            <input v-model.number="sharedData.wallet.consume.amount" type="number" min="0.01" step="1" />
          </div>
          <div class="form-group">
            <label>原因:</label>
            <input v-model="sharedData.wallet.consume.reason" placeholder="消费原因" />
          </div>
          <button @click="testConsume" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '测试消费' }}
          </button>
          <div v-if="sharedData.wallet.consume.result" class="result"
            :class="sharedData.wallet.consume.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.wallet.consume.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 钱包：交易记录 -->
        <div class="test-card">
          <h3>5. 查询交易记录</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/wallet/transactions</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="sharedData.wallet.transactions.page" type="number" min="1" />
          </div>
          <button @click="testGetTransactions" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '查询交易记录' }}
          </button>
          <div v-if="sharedData.wallet.transactions.result" class="result"
            :class="sharedData.wallet.transactions.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.wallet.transactions.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 存储：文件列表 -->
        <div class="test-card">
          <h3>6. 查询文件列表</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/storage/files</span>
            <span class="auth-badge required">需要Token</span>
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="sharedData.storage.list.page" type="number" min="1" />
          </div>
          <button @click="testListFiles" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '查询文件列表' }}
          </button>
          <div v-if="sharedData.storage.list.result" class="result"
            :class="sharedData.storage.list.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.storage.list.result, null, 2) }}</pre>
          </div>
        </div>

        <!-- 管理：待审核内容 -->
        <div class="test-card">
          <h3>7. 获取待审核内容（管理员）</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/admin/pending-reviews</span>
            <span class="auth-badge required">需要管理员权限</span>
          </div>
          <button @click="testGetPendingReviews" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取待审核列表' }}
          </button>
          <div v-if="sharedData.admin.pendingReviews" class="result"
            :class="sharedData.admin.pendingReviews.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.admin.pendingReviews, null, 2) }}</pre>
          </div>
        </div>

        <!-- 管理：操作日志 -->
        <div class="test-card">
          <h3>8. 获取操作日志（管理员）</h3>
          <div class="api-info">
            <span class="method get">GET</span>
            <span class="path">/api/v1/shared/admin/logs</span>
            <span class="auth-badge required">需要管理员权限</span>
          </div>
          <div class="form-group">
            <label>页码:</label>
            <input v-model.number="sharedData.admin.logs.page" type="number" min="1" />
          </div>
          <button @click="testGetOperationLogs" :disabled="loading || !token" class="test-btn">
            {{ loading ? '请求中...' : '获取操作日志' }}
          </button>
          <div v-if="sharedData.admin.logs.result" class="result"
            :class="sharedData.admin.logs.result.error ? 'error' : 'success'">
            <pre>{{ JSON.stringify(sharedData.admin.logs.result, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 请求历史 -->
      <div class="request-history" v-if="requestHistory.length > 0">
        <h3>请求历史 <button @click="clearHistory" class="clear-btn">清空</button></h3>
        <div class="history-list">
          <div v-for="(item, index) in requestHistory.slice(0, 10)" :key="index" class="history-item"
            :class="item.success ? 'success' : 'error'">
            <span class="time">{{ item.time }}</span>
            <span class="method" :class="item.method.toLowerCase()">{{ item.method }}</span>
            <span class="api">{{ item.api }}</span>
            <span class="status" :class="item.success ? 'success' : 'error'">
              {{ item.success ? '✓' : '✗' }}
            </span>
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
import { recommendationAPI } from '@/api/recommendation'
import sharedAPI from '@/api/shared'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const token = computed(() => authStore.token)

const loading = ref(false)
const currentTab = ref('auth')
const requestHistory = ref([])

const tabs = [
  { id: 'auth', name: '认证与用户' },
  { id: 'bookstore', name: '书城系统' },
  { id: 'reader', name: '阅读器' },
  { id: 'recommendation', name: '推荐系统' },
  { id: 'rating', name: '评分系统' },
  { id: 'shared', name: '共享服务' }
]

// 认证数据
const authData = ref({
  register: {
    username: '',
    email: '',
    password: '',
    result: null
  },
  login: {
    username: '',
    password: '',
    result: null
  },
  refresh: {
    result: null
  },
  permissions: {
    result: null
  },
  roles: {
    result: null
  },
  logout: {
    result: null
  },
  profile: {
    result: null
  },
  updateProfile: {
    nickname: '',
    bio: '',
    result: null
  },
  changePassword: {
    oldPassword: '',
    newPassword: '',
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
    page: 1,
    result: null
  },
  bookDetail: {
    bookId: '',
    result: null
  },
  categories: {
    result: null
  },
  banners: {
    limit: 5,
    result: null
  },
  rankings: {
    limit: 20,
    realtime: null,
    weekly: null,
    monthly: null,
    newbie: null
  }
})

// 阅读器数据
const readerData = ref({
  chapterContent: {
    chapterId: '',
    result: null
  },
  chapterList: {
    bookId: '',
    page: 1,
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
  annotation: {
    bookId: '',
    chapterId: '',
    type: 'highlight',
    text: '',
    note: '',
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

// 推荐系统数据
const recommendationData = ref({
  personalized: {
    limit: 10,
    result: null
  },
  similar: {
    itemId: '',
    limit: 10,
    result: null
  },
  behavior: {
    itemId: '',
    behaviorType: 'view',
    result: null
  },
  homepage: {
    limit: 10,
    result: null
  },
  hot: {
    limit: 10,
    days: 7,
    result: null
  },
  category: {
    category: '',
    limit: 10,
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

// 共享服务数据
const sharedData = ref({
  wallet: {
    balance: null,
    info: null,
    recharge: {
      amount: 100,
      method: 'alipay',
      result: null
    },
    consume: {
      amount: 10,
      reason: '测试消费',
      result: null
    },
    transactions: {
      page: 1,
      result: null
    }
  },
  storage: {
    list: {
      page: 1,
      result: null
    }
  },
  admin: {
    pendingReviews: null,
    logs: {
      page: 1,
      result: null
    }
  }
})

// 通用请求处理
const handleRequest = async (apiCall, resultRef, method, apiName) => {
  loading.value = true
  const startTime = Date.now()

  try {
    const response = await apiCall()
    resultRef.value = response

    // 添加到请求历史
    addToHistory(method, apiName, true, Date.now() - startTime)

    console.log('API响应:', response)
    return response
  } catch (error) {
    const errorResult = {
      error: true,
      message: error.message || '请求失败',
      details: error.response?.data || error
    }
    resultRef.value = errorResult

    // 添加到请求历史
    addToHistory(method, apiName, false, Date.now() - startTime)

    console.error('API错误:', error)
    throw error
  } finally {
    loading.value = false
  }
}

// 添加到请求历史
const addToHistory = (method, api, success, duration) => {
  requestHistory.value.unshift({
    time: new Date().toLocaleTimeString(),
    method,
    api,
    success,
    duration
  })

  // 只保留最近50条
  if (requestHistory.value.length > 50) {
    requestHistory.value = requestHistory.value.slice(0, 50)
  }
}

// 清空历史
const clearHistory = () => {
  requestHistory.value = []
}

// 清除Token
const clearToken = () => {
  authStore.clearToken()
}

// 快速填充
const quickFillRegister = () => {
  const timestamp = Date.now()
  authData.value.register.username = `testuser${timestamp}`
  authData.value.register.email = `test${timestamp}@example.com`
  authData.value.register.password = 'Password123!'
}

const quickFillLogin = () => {
  authData.value.login.username = authData.value.register.username || 'testuser'
  authData.value.login.password = authData.value.register.password || 'password123'
}

// ==================== 认证测试方法 ====================
const testRegister = () => handleRequest(
  () => userAPI.register(authData.value.register),
  () => authData.value.register.result,
  'POST',
  '用户注册'
)

const testLogin = async () => {
  loading.value = true
  try {
    const response = await userAPI.login(authData.value.login)
    authData.value.login.result = response

    // 保存Token
    if (response.data && response.data.token) {
      authStore.setToken(response.data.token)
      authStore.setUser(response.data)
    }

    addToHistory('POST', '用户登录', true, 0)
  } catch (error) {
    authData.value.login.result = {
      error: true,
      message: error.message || '登录失败'
    }
    addToHistory('POST', '用户登录', false, 0)
  } finally {
    loading.value = false
  }
}

const testRefreshToken = () => handleRequest(
  () => sharedAPI.auth.refreshToken(),
  () => authData.value.refresh.result,
  'POST',
  'Token刷新'
)

const testGetPermissions = () => handleRequest(
  () => sharedAPI.auth.getUserPermissions(),
  () => authData.value.permissions.result,
  'GET',
  '获取权限'
)

const testGetRoles = () => handleRequest(
  () => sharedAPI.auth.getUserRoles(),
  () => authData.value.roles.result,
  'GET',
  '获取角色'
)

const testLogout = () => handleRequest(
  () => sharedAPI.auth.logout(),
  () => authData.value.logout.result,
  'POST',
  '用户登出'
)

const testGetProfile = () => handleRequest(
  () => userAPI.getProfile(),
  () => authData.value.profile.result,
  'GET',
  '获取个人信息'
)

const testUpdateProfile = () => handleRequest(
  () => userAPI.updateProfile(authData.value.updateProfile),
  () => authData.value.updateProfile.result,
  'PUT',
  '更新个人信息'
)

const testChangePassword = () => handleRequest(
  () => userAPI.changePassword(authData.value.changePassword),
  () => authData.value.changePassword.result,
  'PUT',
  '修改密码'
)

// ==================== 书城测试方法 ====================
const testGetHomepage = () => handleRequest(
  () => bookstoreAPI.getHomepage(),
  () => bookstoreData.value.homepage.result,
  'GET',
  '获取首页数据'
)

const testGetBookList = () => handleRequest(
  () => booksAPI.getBookList({
    page: bookstoreData.value.bookList.page,
    size: bookstoreData.value.bookList.size,
    category: bookstoreData.value.bookList.category || undefined
  }),
  () => bookstoreData.value.bookList.result,
  'GET',
  '获取书籍列表'
)

const testSearchBooks = () => handleRequest(
  () => bookstoreAPI.searchBooks(bookstoreData.value.search.keyword, {
    page: bookstoreData.value.search.page
  }),
  () => bookstoreData.value.search.result,
  'GET',
  '搜索书籍'
)

const testGetBookDetail = () => handleRequest(
  () => bookstoreAPI.getBookById(bookstoreData.value.bookDetail.bookId),
  () => bookstoreData.value.bookDetail.result,
  'GET',
  '获取书籍详情'
)

const testGetCategories = () => handleRequest(
  () => booksAPI.getAllCategories(),
  () => bookstoreData.value.categories.result,
  'GET',
  '获取分类列表'
)

const testGetBanners = () => handleRequest(
  () => bookstoreAPI.getBanners(bookstoreData.value.banners.limit),
  () => bookstoreData.value.banners.result,
  'GET',
  '获取Banner列表'
)

const testGetRealtimeRanking = () => handleRequest(
  () => bookstoreAPI.getRealtimeRanking(bookstoreData.value.rankings.limit),
  () => bookstoreData.value.rankings.realtime,
  'GET',
  '获取实时榜'
)

const testGetWeeklyRanking = () => handleRequest(
  () => bookstoreAPI.getWeeklyRanking('', bookstoreData.value.rankings.limit),
  () => bookstoreData.value.rankings.weekly,
  'GET',
  '获取周榜'
)

const testGetMonthlyRanking = () => handleRequest(
  () => bookstoreAPI.getMonthlyRanking('', bookstoreData.value.rankings.limit),
  () => bookstoreData.value.rankings.monthly,
  'GET',
  '获取月榜'
)

const testGetNewbieRanking = () => handleRequest(
  () => bookstoreAPI.getNewbieRanking('', bookstoreData.value.rankings.limit),
  () => bookstoreData.value.rankings.newbie,
  'GET',
  '获取新人榜'
)

// ==================== 阅读器测试方法 ====================
const testGetChapterContent = () => handleRequest(
  () => readerAPI.getChapterContent(readerData.value.chapterContent.chapterId),
  () => readerData.value.chapterContent.result,
  'GET',
  '获取章节内容'
)

const testGetChapterList = () => handleRequest(
  () => readerAPI.getChapterList(
    readerData.value.chapterList.bookId,
    readerData.value.chapterList.page
  ),
  () => readerData.value.chapterList.result,
  'GET',
  '获取章节列表'
)

const testSaveProgress = () => handleRequest(
  () => readerAPI.saveProgress(readerData.value.progress),
  () => readerData.value.progress.result,
  'POST',
  '保存阅读进度'
)

const testGetProgress = () => handleRequest(
  () => readerAPI.getProgress(readerData.value.getProgress.bookId),
  () => readerData.value.getProgress.result,
  'GET',
  '获取阅读进度'
)

const testGetHistory = () => handleRequest(
  () => readerAPI.getReadingHistory(readerData.value.history.page),
  () => readerData.value.history.result,
  'GET',
  '获取阅读历史'
)

const testCreateAnnotation = () => handleRequest(
  () => readerAPI.createAnnotation(readerData.value.annotation),
  () => readerData.value.annotation.result,
  'POST',
  '创建注记'
)

const testGetSettings = () => handleRequest(
  () => readerAPI.getSettings(),
  () => readerData.value.settings.result,
  'GET',
  '获取阅读设置'
)

const testUpdateSettings = () => handleRequest(
  () => readerAPI.updateSettings(readerData.value.updateSettings),
  () => readerData.value.updateSettings.result,
  'PUT',
  '更新阅读设置'
)

// ==================== 推荐系统测试方法 ====================
const testGetPersonalizedRecommendations = () => handleRequest(
  () => recommendationAPI.getPersonalizedRecommendations(recommendationData.value.personalized.limit),
  () => recommendationData.value.personalized.result,
  'GET',
  '获取个性化推荐'
)

const testGetSimilarItems = () => handleRequest(
  () => recommendationAPI.getSimilarItems(
    recommendationData.value.similar.itemId,
    recommendationData.value.similar.limit
  ),
  () => recommendationData.value.similar.result,
  'GET',
  '获取相似推荐'
)

const testRecordBehavior = () => handleRequest(
  () => recommendationAPI.recordBehavior(recommendationData.value.behavior),
  () => recommendationData.value.behavior.result,
  'POST',
  '记录用户行为'
)

const testGetHomepageRecommendations = () => handleRequest(
  () => recommendationAPI.getHomepageRecommendations(recommendationData.value.homepage.limit),
  () => recommendationData.value.homepage.result,
  'GET',
  '获取首页推荐'
)

const testGetHotRecommendations = () => handleRequest(
  () => recommendationAPI.getHotRecommendations(
    recommendationData.value.hot.limit,
    recommendationData.value.hot.days
  ),
  () => recommendationData.value.hot.result,
  'GET',
  '获取热门推荐'
)

const testGetCategoryRecommendations = () => handleRequest(
  () => recommendationAPI.getCategoryRecommendations(
    recommendationData.value.category.category,
    recommendationData.value.category.limit
  ),
  () => recommendationData.value.category.result,
  'GET',
  '获取分类推荐'
)

// ==================== 评分系统测试方法 ====================
const testGetRatings = () => handleRequest(
  () => ratingAPI.getBookRatings(
    ratingData.value.list.bookId,
    ratingData.value.list.page
  ),
  () => ratingData.value.list.result,
  'GET',
  '获取评分列表'
)

const testGetRatingStats = () => handleRequest(
  () => ratingAPI.getBookRatingStats(ratingData.value.stats.bookId),
  () => ratingData.value.stats.result,
  'GET',
  '获取评分统计'
)

const testCreateRating = () => handleRequest(
  () => ratingAPI.createRating(ratingData.value.create),
  () => ratingData.value.create.result,
  'POST',
  '创建评分'
)

const testUpdateRating = () => handleRequest(
  () => ratingAPI.updateRating(
    ratingData.value.update.ratingId,
    {
      rating: ratingData.value.update.rating,
      review: ratingData.value.update.review
    }
  ),
  () => ratingData.value.update.result,
  'PUT',
  '更新评分'
)

const testDeleteRating = () => handleRequest(
  () => ratingAPI.deleteRating(ratingData.value.delete.ratingId),
  () => ratingData.value.delete.result,
  'DELETE',
  '删除评分'
)

// ==================== 共享服务测试方法 ====================
const testGetBalance = () => handleRequest(
  () => sharedAPI.wallet.getBalance(),
  () => sharedData.value.wallet.balance,
  'GET',
  '查询余额'
)

const testGetWallet = () => handleRequest(
  () => sharedAPI.wallet.getWallet(),
  () => sharedData.value.wallet.info,
  'GET',
  '获取钱包信息'
)

const testRecharge = () => handleRequest(
  () => sharedAPI.wallet.recharge(sharedData.value.wallet.recharge),
  () => sharedData.value.wallet.recharge.result,
  'POST',
  '钱包充值'
)

const testConsume = () => handleRequest(
  () => sharedAPI.wallet.consume(sharedData.value.wallet.consume),
  () => sharedData.value.wallet.consume.result,
  'POST',
  '钱包消费'
)

const testGetTransactions = () => handleRequest(
  () => sharedAPI.wallet.getTransactions({
    page: sharedData.value.wallet.transactions.page,
    page_size: 10
  }),
  () => sharedData.value.wallet.transactions.result,
  'GET',
  '查询交易记录'
)

const testListFiles = () => handleRequest(
  () => sharedAPI.storage.listFiles({
    page: sharedData.value.storage.list.page,
    page_size: 10
  }),
  () => sharedData.value.storage.list.result,
  'GET',
  '查询文件列表'
)

const testGetPendingReviews = () => handleRequest(
  () => sharedAPI.admin.getPendingReviews(),
  () => sharedData.value.admin.pendingReviews,
  'GET',
  '获取待审核列表'
)

const testGetOperationLogs = () => handleRequest(
  () => sharedAPI.admin.getOperationLogs({
    page: sharedData.value.admin.logs.page,
    page_size: 10
  }),
  () => sharedData.value.admin.logs.result,
  'GET',
  '获取操作日志'
)
</script>

<style scoped>
.comprehensive-api-test {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 28px;
}

.token-status {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.token-status .label {
  font-weight: 600;
  color: #606266;
}

.token-status .value {
  color: #909399;
}

.token-status.active .value {
  color: #67c23a;
  font-weight: 600;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab {
  padding: 12px 24px;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  font-weight: 500;
  color: #606266;
}

.tab:hover {
  border-color: #409eff;
  color: #409eff;
}

.tab.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.test-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 3px solid #409eff;
  font-size: 24px;
}

.section-info {
  color: #909399;
  margin-bottom: 20px;
  font-style: italic;
}

.test-card {
  background: #f9fafc;
  padding: 25px;
  margin-bottom: 20px;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.test-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.api-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.method {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
}

.method.get {
  background: #67c23a;
}

.method.post {
  background: #409eff;
}

.method.put {
  background: #e6a23c;
}

.method.delete {
  background: #f56c6c;
}

.path {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
}

.auth-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  background: #e4e7ed;
  color: #606266;
}

.auth-badge.required {
  background: #fef0f0;
  color: #f56c6c;
  font-weight: 600;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #409eff;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.test-btn,
.quick-fill-btn,
.clear-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.test-btn {
  background: #409eff;
  color: white;
}

.test-btn:hover:not(:disabled) {
  background: #66b1ff;
}

.test-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.quick-fill-btn {
  background: #e6a23c;
  color: white;
}

.quick-fill-btn:hover {
  background: #ebb563;
}

.clear-btn {
  background: #f56c6c;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
}

.clear-btn:hover {
  background: #f78989;
}

.result {
  margin-top: 15px;
  background: white;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
  max-height: 400px;
  overflow-y: auto;
}

.result.success {
  border-left-color: #67c23a;
  background: #f0f9ff;
}

.result.error {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.result pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 13px;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
}

.request-history {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-top: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.request-history h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9fafc;
  border-radius: 4px;
  font-size: 13px;
  border-left: 3px solid #dcdfe6;
}

.history-item.success {
  border-left-color: #67c23a;
}

.history-item.error {
  border-left-color: #f56c6c;
}

.history-item .time {
  color: #909399;
  min-width: 80px;
}

.history-item .method {
  min-width: 50px;
  text-align: center;
}

.history-item .api {
  flex: 1;
  color: #606266;
}

.history-item .status {
  font-weight: 700;
  font-size: 16px;
}

.history-item .status.success {
  color: #67c23a;
}

.history-item .status.error {
  color: #f56c6c;
}
</style>
