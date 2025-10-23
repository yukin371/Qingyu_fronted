<template>
    <div class="main-layout">
        <!-- 顶部导航栏 -->
        <el-header class="layout-header">
            <div class="header-container">
                <!-- Logo -->
                <div class="header-logo" @click="goHome">
                    <img src="/favicon.ico" alt="Logo" class="logo-icon" />
                    <span class="logo-text">青羽阅读</span>
                </div>

                <!-- 导航菜单 -->
                <el-menu :default-active="activeMenu" class="header-menu" mode="horizontal" :ellipsis="false"
                    @select="handleMenuSelect">
                    <el-menu-item index="/">首页</el-menu-item>
                    <el-menu-item index="/books">书库</el-menu-item>
                    <el-menu-item index="/categories">分类</el-menu-item>
                    <el-menu-item index="/rankings">榜单</el-menu-item>
                </el-menu>

                <!-- 搜索框 -->
                <div class="header-search">
                    <el-input v-model="searchKeyword" placeholder="搜索书籍..." clearable @keyup.enter="handleSearch">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                </div>

                <!-- 用户操作区 -->
                <div class="header-actions">
                    <template v-if="isLoggedIn">
                        <el-dropdown @command="handleUserCommand">
                            <div class="user-info">
                                <el-avatar :size="32" :src="userAvatar">
                                    {{ userDisplayName.charAt(0) }}
                                </el-avatar>
                                <span class="username">{{ userDisplayName }}</span>
                                <el-icon class="el-icon--right">
                                    <ArrowDown />
                                </el-icon>
                            </div>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="profile">
                                        <el-icon>
                                            <User />
                                        </el-icon>
                                        个人中心
                                    </el-dropdown-item>
                                    <el-dropdown-item command="shelf">
                                        <el-icon>
                                            <Collection />
                                        </el-icon>
                                        我的书架
                                    </el-dropdown-item>
                                    <el-dropdown-item command="history">
                                        <el-icon>
                                            <Clock />
                                        </el-icon>
                                        阅读历史
                                    </el-dropdown-item>
                                    <el-dropdown-item divided command="logout">
                                        <el-icon>
                                            <SwitchButton />
                                        </el-icon>
                                        退出登录
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template v-else>
                        <el-button @click="showQuickLogin = true" type="primary">
                            <el-icon><User /></el-icon>
                            登录
                        </el-button>
                        <el-button @click="goToAuth('register')" link>注册</el-button>
                    </template>
                </div>

                <!-- 移动端菜单按钮 -->
                <el-button class="mobile-menu-btn" text @click="drawerVisible = true">
                    <el-icon :size="24">
                        <Menu />
                    </el-icon>
                </el-button>
            </div>
        </el-header>

        <!-- 主内容区 -->
        <el-main class="layout-main">
            <router-view v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                    <component :is="Component" :key="route.path" />
                </transition>
            </router-view>
        </el-main>

        <!-- 底部 -->
        <el-footer v-if="showFooter" class="layout-footer">
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4>关于我们</h4>
                        <p>青羽阅读致力于提供最优质的阅读体验</p>
                    </div>
                    <div class="footer-section">
                        <h4>快速链接</h4>
                        <ul>
                            <li><a href="/about">关于</a></li>
                            <li><a href="/help">帮助</a></li>
                            <li><a href="/feedback">反馈</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>联系我们</h4>
                        <p>邮箱: contact@qingyu.com</p>
                    </div>
                </div>
                <div class="footer-copyright">
                    <p>&copy; 2025 青羽阅读. All rights reserved.</p>
                </div>
            </div>
        </el-footer>

        <!-- 移动端抽屉菜单 -->
        <el-drawer v-model="drawerVisible" title="菜单" direction="rtl" size="280px">
            <el-menu :default-active="activeMenu" @select="handleMenuSelect">
                <el-menu-item index="/">
                    <el-icon>
                        <HomeFilled />
                    </el-icon>
                    <span>首页</span>
                </el-menu-item>
                <el-menu-item index="/books">
                    <el-icon>
                        <Reading />
                    </el-icon>
                    <span>书库</span>
                </el-menu-item>
                <el-menu-item index="/categories">
                    <el-icon>
                        <Grid />
                    </el-icon>
                    <span>分类</span>
                </el-menu-item>
                <el-menu-item index="/rankings">
                    <el-icon>
                        <TrendCharts />
                    </el-icon>
                    <span>榜单</span>
                </el-menu-item>
                <el-menu-item v-if="isLoggedIn" index="/profile">
                    <el-icon>
                        <User />
                    </el-icon>
                    <span>个人中心</span>
                </el-menu-item>
            </el-menu>
        </el-drawer>

        <!-- 回到顶部 -->
        <el-backtop :right="40" :bottom="40" />

        <!-- 快捷登录对话框 -->
        <el-dialog
            v-model="showQuickLogin"
            title="登录"
            width="400px"
            :close-on-click-modal="false"
        >
            <el-form :model="quickLoginForm" :rules="quickLoginRules" ref="quickLoginFormRef">
                <el-form-item prop="username">
                    <el-input
                        v-model="quickLoginForm.username"
                        placeholder="用户名或邮箱"
                        size="large"
                        clearable
                        @keyup.enter="handleQuickLogin"
                    >
                        <template #prefix>
                            <el-icon><User /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item prop="password">
                    <el-input
                        v-model="quickLoginForm.password"
                        type="password"
                        placeholder="密码"
                        size="large"
                        show-password
                        @keyup.enter="handleQuickLogin"
                    >
                        <template #prefix>
                            <el-icon><Lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item>
                    <div class="quick-login-footer">
                        <el-checkbox v-model="quickLoginForm.rememberMe">记住我</el-checkbox>
                        <el-link type="primary" @click="goToAuth('reset')">忘记密码？</el-link>
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showQuickLogin = false">取消</el-button>
                    <el-button type="primary" @click="handleQuickLogin" :loading="quickLoginLoading">
                        登录
                    </el-button>
                </div>
                <div class="register-hint">
                    还没有账号？
                    <el-link type="primary" @click="goToAuth('register')">立即注册</el-link>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
    Search, ArrowDown, User, Collection, Clock, SwitchButton, Menu,
    HomeFilled, Reading, Grid, TrendCharts, Lock
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const searchKeyword = ref('')
const drawerVisible = ref(false)
const showFooter = computed(() => !route.meta.hideFooter)

// 快捷登录相关
const showQuickLogin = ref(false)
const quickLoginLoading = ref(false)
const quickLoginFormRef = ref<FormInstance>()
const quickLoginForm = ref({
    username: '',
    password: '',
    rememberMe: false
})

const quickLoginRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
}

// 用户信息
const isLoggedIn = computed(() => authStore.isLoggedIn)
const userAvatar = computed(() => authStore.user?.avatar || '')
const userDisplayName = computed(() => authStore.user?.nickname || authStore.user?.username || '用户')

// 当前激活的菜单
const activeMenu = computed(() => {
    const path = route.path
    if (path === '/') return '/'
    if (path.startsWith('/books')) return '/books'
    if (path.startsWith('/categories')) return '/categories'
    if (path.startsWith('/rankings')) return '/rankings'
    return '/'
})

// 菜单选择处理
const handleMenuSelect = (index: string) => {
    router.push(index)
    drawerVisible.value = false
}

// 搜索处理
const handleSearch = () => {
    if (!searchKeyword.value.trim()) {
        ElMessage.warning('请输入搜索关键词')
        return
    }
    router.push({
        path: '/search',
        query: { q: searchKeyword.value }
    })
}

// 回到首页
const goHome = () => {
    router.push('/')
}

// 跳转认证页面
const goToAuth = (mode: 'login' | 'register' | 'reset' = 'login') => {
    showQuickLogin.value = false
    router.push({ path: '/auth', query: { mode } })
}

// 快捷登录处理
const handleQuickLogin = async () => {
    if (!quickLoginFormRef.value) return

    await quickLoginFormRef.value.validate(async (valid) => {
        if (valid) {
            quickLoginLoading.value = true
            try {
                await authStore.login({
                    username: quickLoginForm.value.username,
                    password: quickLoginForm.value.password
                })

                ElMessage.success('登录成功')
                showQuickLogin.value = false

                // 重置表单
                quickLoginForm.value = {
                    username: '',
                    password: '',
                    rememberMe: false
                }
            } catch (error: any) {
                ElMessage.error(error.message || '登录失败')
            } finally {
                quickLoginLoading.value = false
            }
        }
    })
}

// 用户菜单命令处理
const handleUserCommand = async (command: string) => {
    switch (command) {
        case 'profile':
            router.push('/profile')
            break
        case 'shelf':
            router.push('/profile?tab=shelf')
            break
        case 'history':
            router.push('/profile?tab=history')
            break
        case 'logout':
            try {
                await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                await authStore.logout()
                ElMessage.success('已退出登录')
                router.push('/home')
            } catch (error) {
                // 用户取消
            }
            break
    }
}
</script>

<style scoped lang="scss">
.main-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.layout-header {
    background: white;
    border-bottom: 1px solid #e4e7ed;
    padding: 0;
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .header-container {
        max-width: 1400px;
        margin: 0 auto;
        height: 100%;
        padding: 0 20px;
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .header-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        flex-shrink: 0;

        .logo-icon {
            width: 32px;
            height: 32px;
        }

        .logo-text {
            font-size: 20px;
            font-weight: bold;
            color: #409eff;
        }
    }

    .header-menu {
        flex: 0 0 auto;
        border: none;
        background: transparent;
    }

    .header-search {
        flex: 1;
        max-width: 400px;

        .el-input {
            width: 100%;
        }
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;

        .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background 0.2s;

            &:hover {
                background: #f5f7fa;
            }

            .username {
                font-size: 14px;
                color: #303133;
            }
        }
    }

    .mobile-menu-btn {
        display: none;
    }
}

.layout-main {
    flex: 1;
    padding: 0;
    background: #f5f5f5;
}

.layout-footer {
    background: #2c3e50;
    color: white;
    padding: 40px 0 20px;
    height: auto;

    .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }

    .footer-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 40px;
        margin-bottom: 30px;

        .footer-section {
            h4 {
                margin: 0 0 16px 0;
                font-size: 16px;
                font-weight: 600;
            }

            p {
                margin: 0;
                font-size: 14px;
                color: #bdc3c7;
                line-height: 1.6;
            }

            ul {
                list-style: none;
                padding: 0;
                margin: 0;

                li {
                    margin-bottom: 8px;

                    a {
                        color: #bdc3c7;
                        text-decoration: none;
                        font-size: 14px;
                        transition: color 0.2s;

                        &:hover {
                            color: #409eff;
                        }
                    }
                }
            }
        }
    }

    .footer-copyright {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        p {
            margin: 0;
            font-size: 14px;
            color: #95a5a6;
        }
    }
}

// 页面过渡动画
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

// 响应式
@media (max-width: 992px) {
    .layout-header {
        .header-menu {
            display: none;
        }

        .header-search {
            flex: 1;
            max-width: none;
        }

        .header-actions {
            display: none;
        }

        .mobile-menu-btn {
            display: block;
        }
    }
}

@media (max-width: 768px) {
    .layout-header {
        .header-logo .logo-text {
            display: none;
        }

        .header-search {
            max-width: 200px;
        }
    }

    .layout-footer {
        .footer-content {
            grid-template-columns: 1fr;
            gap: 24px;
        }
    }
}

// 快捷登录样式
.quick-login-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.register-hint {
    text-align: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
    font-size: 14px;
    color: #606266;
}
</style>
