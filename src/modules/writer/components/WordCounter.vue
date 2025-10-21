<template>
    <div class="word-counter">
        <div class="counter-main">
            <div class="counter-item">
                <span class="counter-label">字数</span>
                <span class="counter-value">{{ formatCount(wordCount.total) }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="counter-item">
                <span class="counter-label">中文</span>
                <span class="counter-value">{{ formatCount(wordCount.chinese) }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="counter-item">
                <span class="counter-label">英文</span>
                <span class="counter-value">{{ wordCount.english }}</span>
            </div>
        </div>

        <el-popover v-if="showDetails" placement="bottom" :width="300" trigger="hover">
            <template #reference>
                <el-button text size="small">
                    <el-icon>
                        <InfoFilled />
                    </el-icon>
                </el-button>
            </template>
            <div class="counter-details">
                <div class="detail-item">
                    <span>总字数：</span>
                    <span>{{ wordCount.total }}</span>
                </div>
                <div class="detail-item">
                    <span>中文字符：</span>
                    <span>{{ wordCount.chinese }}</span>
                </div>
                <div class="detail-item">
                    <span>英文单词：</span>
                    <span>{{ wordCount.english }}</span>
                </div>
                <div class="detail-item">
                    <span>数字：</span>
                    <span>{{ wordCount.numbers }}</span>
                </div>
                <div class="detail-item">
                    <span>标点符号：</span>
                    <span>{{ wordCount.punctuation }}</span>
                </div>
                <div class="detail-item" v-if="targetWordCount">
                    <span>完成度：</span>
                    <span>{{ completionPercentage }}%</span>
                </div>
                <div class="detail-item" v-if="targetWordCount">
                    <span>剩余字数：</span>
                    <span>{{ remainingWords }}</span>
                </div>
            </div>
        </el-popover>

        <div class="counter-progress" v-if="targetWordCount">
            <el-progress :percentage="completionPercentage" :stroke-width="4" :show-text="false"
                :color="progressColor" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

interface WordCountResult {
    total: number
    chinese: number
    english: number
    numbers: number
    punctuation: number
    whitespace: number
}

interface Props {
    wordCount: WordCountResult
    targetWordCount?: number
    showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    targetWordCount: 0,
    showDetails: true
})

const completionPercentage = computed(() => {
    if (!props.targetWordCount) return 0
    return Math.min(100, Math.round((props.wordCount.total / props.targetWordCount) * 100))
})

const remainingWords = computed(() => {
    if (!props.targetWordCount) return 0
    return Math.max(0, props.targetWordCount - props.wordCount.total)
})

const progressColor = computed(() => {
    const percentage = completionPercentage.value
    if (percentage < 30) return '#F56C6C'
    if (percentage < 70) return '#E6A23C'
    return '#67C23A'
})

function formatCount(count: number): string {
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万`
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}千`
    }
    return count.toString()
}
</script>

<style scoped lang="scss">
.word-counter {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: #f5f7fa;
    border-radius: 4px;

    .counter-main {
        display: flex;
        align-items: center;
        gap: 12px;

        .counter-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .counter-label {
                font-size: 12px;
                color: #909399;
            }

            .counter-value {
                font-size: 16px;
                font-weight: 500;
                color: #303133;
            }
        }
    }

    .counter-progress {
        flex: 1;
        min-width: 100px;
    }

    .counter-details {
        .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #606266;

            &:not(:last-child) {
                border-bottom: 1px solid #ebeef5;
            }

            span:first-child {
                color: #909399;
            }

            span:last-child {
                font-weight: 500;
            }
        }
    }
}
</style>
