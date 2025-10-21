<template>
    <div class="bookshelf-view">
        <div class="bookshelf-header">
            <h2>我的书架</h2>
            <el-tabs v-model="activeTab" @tab-change="handleTabChange">
                <el-tab-pane label="收藏" name="favorites" />
                <el-tab-pane label="最近阅读" name="recent" />
                <el-tab-pane label="阅读历史" name="history" />
            </el-tabs>
        </div>

        <el-skeleton :loading="loading" :rows="5" animated>
            <div class="bookshelf-content">
                <!-- 收藏书籍 -->
                <div v-if="activeTab === 'favorites'" class="book-grid">
                    <el-empty v-if="favorites.length === 0" description="暂无收藏的书籍" />
                    <BookCard v-for="book in favorites" :key="book.id" :book="book" show-progress
                        @click="goToReader(book.id)" @remove="handleRemoveFavorite(book.id)" />
                </div>

                <!-- 最近阅读 -->
                <div v-if="activeTab === 'recent'" class="recent-list">
                    <el-empty v-if="recentBooks.length === 0" description="暂无阅读记录" />
                    <div v-for="book in recentBooks" :key="book.id" class="recent-item"
                        @click="goToReader(book.id, book.lastChapterId)">
                        <el-image :src="book.cover" fit="cover" class="recent-cover">
                            <template #error>
                                <div class="image-slot">
                                    <el-icon>
                                        <Picture />
                                    </el-icon>
                                </div>
                            </template>
                        </el-image>

                        <div class="recent-info">
                            <h3 class="recent-title">{{ book.title }}</h3>
                            <p class="recent-chapter">{{ book.lastChapterTitle }}</p>
                            <div class="recent-meta">
                                <el-progress :percentage="book.progress" :stroke-width="4" :show-text="false" />
                                <span class="recent-time">{{ formatTime(book.lastReadTime) }}</span>
                            </div>
                        </div>

                        <el-button text type="primary" @click.stop="continueReading(book)">
                            继续阅读
                        </el-button>
                    </div>
                </div>

                <!-- 阅读历史 -->
                <div v-if="activeTab === 'history'" class="history-list">
                    <el-empty v-if="histories.length === 0" description="暂无阅读历史" />
                    <el-timeline>
                        <el-timeline-item v-for="history in histories" :key="history.id"
                            :timestamp="formatDate(history.readTime)" placement="top">
                            <div class="history-item" @click="goToReader(history.bookId, history.chapterId)">
                                <div class="history-book">
                                    <span class="history-title">{{ history.bookTitle }}</span>
                                    <span class="history-chapter">- {{ history.chapterTitle }}</span>
                                </div>
                                <span class="history-duration">阅读 {{ formatDuration(history.duration) }}</span>
                            </div>
                        </el-timeline-item>
                    </el-timeline>

                    <!-- 分页 -->
                    <el-pagination v-if="historyTotal > historyPageSize" v-model:current-page="historyPage"
                        :page-size="historyPageSize" :total="historyTotal" layout="prev, pager, next"
                        @current-change="loadHistory" style="margin-top: 20px; justify-content: center" />
                </div>
            </div>
        </el-skeleton>

        <!-- 统计信息 -->
        <div class="bookshelf-stats" v-if="stats">
            <el-card>
                <template #header>
                    <span>阅读统计</span>
                </template>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">{{ stats.totalBooks }}</div>
                        <div class="stat-label">收藏书籍</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ formatReadingTime(stats.totalTime) }}</div>
                        <div class="stat-label">累计阅读</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ stats.finishedBooks }}</div>
                        <div class="stat-label">已读完</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">{{ formatReadingTime(stats.todayTime) }}</div>
                        <div class="stat-label">今日阅读</div>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import BookCard from '@/components/common/BookCard.vue'
import { formatDate, formatReadingTime } from '@/utils/format'
import { ElMessage } from 'element-plus'

const router = useRouter()

const activeTab = ref('favorites')
const loading = ref(false)

// 收藏书籍
const favorites = ref<any[]>([])

// 最近阅读
const recentBooks = ref<any[]>([])

// 阅读历史
const histories = ref<any[]>([])
const historyPage = ref(1)
const historyPageSize = ref(20)
const historyTotal = ref(0)

// 统计数据
const stats = ref<any>(null)

onMounted(() => {
    loadData()
})

async function loadData(): Promise<void> {
    loading.value = true
    try {
        switch (activeTab.value) {
            case 'favorites':
                await loadFavorites()
                break
            case 'recent':
                await loadRecentBooks()
                break
            case 'history':
                await loadHistory()
                break
        }
        await loadStats()
    } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败')
    } finally {
        loading.value = false
    }
}

async function loadFavorites(): Promise<void> {
    // TODO: 调用API加载收藏书籍
    favorites.value = []
}

async function loadRecentBooks(): Promise<void> {
    // TODO: 调用API加载最近阅读
    recentBooks.value = []
}

async function loadHistory(): Promise<void> {
    // TODO: 调用API加载阅读历史
    histories.value = []
}

async function loadStats(): Promise<void> {
    // TODO: 调用API加载统计数据
    stats.value = {
        totalBooks: 0,
        totalTime: 0,
        finishedBooks: 0,
        todayTime: 0
    }
}

function handleTabChange(): void {
    loadData()
}

function goToReader(bookId: string, chapterId?: string): void {
    router.push({
        name: 'reader',
        params: { bookId },
        query: chapterId ? { chapterId } : undefined
    })
}

function continueReading(book: any): void {
    goToReader(book.id, book.lastChapterId)
}

async function handleRemoveFavorite(bookId: string): Promise<void> {
    try {
        // TODO: 调用API移除收藏
        favorites.value = favorites.value.filter(book => book.id !== bookId)
        ElMessage.success('已移除收藏')
    } catch (error) {
        ElMessage.error('移除失败')
    }
}

function formatTime(time: string): string {
    return formatDate(time, 'MM-DD HH:mm')
}

function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}分钟`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}
</script>

<style scoped lang="scss">
.bookshelf-view {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;

    .bookshelf-header {
        margin-bottom: 24px;

        h2 {
            margin: 0 0 16px;
            font-size: 24px;
            font-weight: 500;
            color: #303133;
        }
    }

    .bookshelf-content {
        min-height: 400px;

        .book-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 20px;
        }

        .recent-list {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .recent-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: #fff;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;

                &:hover {
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                }

                .recent-cover {
                    width: 80px;
                    height: 106px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }

                .recent-info {
                    flex: 1;

                    .recent-title {
                        margin: 0 0 8px;
                        font-size: 16px;
                        font-weight: 500;
                        color: #303133;
                    }

                    .recent-chapter {
                        margin: 0 0 12px;
                        font-size: 14px;
                        color: #606266;
                    }

                    .recent-meta {
                        display: flex;
                        align-items: center;
                        gap: 12px;

                        .el-progress {
                            flex: 1;
                        }

                        .recent-time {
                            font-size: 12px;
                            color: #909399;
                        }
                    }
                }
            }
        }

        .history-list {
            .history-item {
                cursor: pointer;
                padding: 8px;
                border-radius: 4px;
                transition: background 0.3s;

                &:hover {
                    background: #f5f7fa;
                }

                .history-book {
                    margin-bottom: 4px;

                    .history-title {
                        font-size: 14px;
                        font-weight: 500;
                        color: #303133;
                    }

                    .history-chapter {
                        font-size: 14px;
                        color: #606266;
                    }
                }

                .history-duration {
                    font-size: 12px;
                    color: #909399;
                }
            }
        }
    }

    .bookshelf-stats {
        margin-top: 24px;

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;

            .stat-item {
                text-align: center;

                .stat-value {
                    font-size: 28px;
                    font-weight: bold;
                    color: #409EFF;
                    margin-bottom: 8px;
                }

                .stat-label {
                    font-size: 14px;
                    color: #909399;
                }
            }
        }
    }
}
</style>
