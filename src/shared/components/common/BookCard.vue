<template>
    <div class="book-card" :class="{ 'is-horizontal': layout === 'horizontal' }" @click="handleClick">
        <!-- 封面 -->
        <div class="book-cover">
            <el-image :src="book.cover" fit="cover" :alt="book.title">
                <template #error>
                    <div class="image-slot">
                        <el-icon>
                            <Picture />
                        </el-icon>
                    </div>
                </template>
            </el-image>

            <!-- 状态标签 -->
            <el-tag v-if="showStatus && book.status === 'completed'" class="status-tag" type="success" size="small">
                完结
            </el-tag>

            <!-- 阅读进度 -->
            <div v-if="showProgress && progress !== undefined" class="progress-overlay">
                <el-progress :percentage="progress" :show-text="false" :stroke-width="3" />
            </div>
        </div>

        <!-- 书籍信息 -->
        <div class="book-info">
            <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
            <p class="book-author">{{ book.author }}</p>

            <!-- 元数据 -->
            <div v-if="showMeta" class="book-meta">
                <span v-if="book.rating" class="rating">
                    <el-icon>
                        <Star />
                    </el-icon>
                    {{ book.rating.toFixed(1) }}
                </span>
                <span v-if="book.wordCount" class="word-count">
                    {{ formatNumber(book.wordCount) }}字
                </span>
                <span v-if="book.categoryName" class="category">
                    {{ book.categoryName }}
                </span>
            </div>

            <!-- 最新章节 -->
            <p v-if="showLatest && book.latestChapter" class="latest-chapter">
                最新: {{ book.latestChapter }}
            </p>

            <!-- 操作按钮 -->
            <div v-if="showActions" class="book-actions" @click.stop>
                <slot name="actions">
                    <el-button size="small" type="primary" @click.stop="handleRead">阅读</el-button>
                    <el-button size="small" @click.stop="handleFavorite">
                        <el-icon>
                            <Star />
                        </el-icon>
                    </el-button>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture, Star } from '@element-plus/icons-vue'
import type { BookBrief } from '@/types/models'

interface Props {
    book: BookBrief
    layout?: 'vertical' | 'horizontal'
    showStatus?: boolean
    showMeta?: boolean
    showLatest?: boolean
    showActions?: boolean
    showProgress?: boolean
    progress?: number
}

const props = withDefaults(defineProps<Props>(), {
    layout: 'vertical',
    showStatus: true,
    showMeta: true,
    showLatest: false,
    showActions: false,
    showProgress: false
})

const emit = defineEmits<{
    click: [book: BookBrief]
    read: [book: BookBrief]
    favorite: [book: BookBrief]
}>()

const formatNumber = (num: number): string => {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
}

const handleClick = () => {
    emit('click', props.book)
}

const handleRead = () => {
    emit('read', props.book)
}

const handleFavorite = () => {
    emit('favorite', props.book)
}
</script>

<style scoped lang="scss">
.book-card {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: all 0.3s;
    background: white;
    border-radius: 8px;
    overflow: hidden;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &.is-horizontal {
        flex-direction: row;

        .book-cover {
            width: 120px;
            height: 160px;
            flex-shrink: 0;
        }

        .book-info {
            flex: 1;
            padding: 16px;
        }
    }

    .book-cover {
        position: relative;
        width: 100%;
        aspect-ratio: 3/4;
        overflow: hidden;

        .el-image {
            width: 100%;
            height: 100%;
        }

        .status-tag {
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 1;
        }

        .progress-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
        }
    }

    .book-info {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .book-title {
            font-size: 14px;
            font-weight: 500;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #303133;
        }

        .book-author {
            font-size: 12px;
            color: #909399;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .book-meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #606266;
            margin-top: 4px;

            .rating {
                display: flex;
                align-items: center;
                gap: 2px;
                color: #f56c6c;
            }
        }

        .latest-chapter {
            font-size: 12px;
            color: #909399;
            margin: 4px 0 0 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .book-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
    }
}

.image-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-color: #f5f7fa;
    color: #909399;
    font-size: 30px;
}

// 响应式
@media (max-width: 768px) {
    .book-card.is-horizontal {
        .book-cover {
            width: 100px;
            height: 133px;
        }

        .book-info {
            padding: 12px;
        }
    }
}
</style>
