<template>
    <div class="search-bar">
        <el-autocomplete ref="autocompleteRef" v-model="searchText" :fetch-suggestions="fetchSuggestions"
            :placeholder="placeholder" :size="size" :clearable="clearable" :prefix-icon="Search" class="search-input"
            @select="handleSelect" @keyup.enter="handleSearch">
            <template #default="{ item }">
                <div class="suggestion-item">
                    <div class="item-content">
                        <el-icon class="item-icon">
                            <component :is="getItemIcon(item.type)" />
                        </el-icon>
                        <span class="item-text">{{ item.value }}</span>
                    </div>
                    <el-tag v-if="item.type" size="small" class="item-tag">
                        {{ getTypeLabel(item.type) }}
                    </el-tag>
                </div>
            </template>
            <template #append>
                <el-button :icon="Search" @click="handleSearch">搜索</el-button>
            </template>
        </el-autocomplete>

        <!-- 热门搜索标签 -->
        <div v-if="showHotTags && hotTags.length > 0" class="hot-tags">
            <span class="hot-label">热门:</span>
            <el-tag v-for="tag in hotTags" :key="tag" class="hot-tag" @click="handleHotTagClick(tag)">
                {{ tag }}
            </el-tag>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Document, User, Collection } from '@element-plus/icons-vue'

interface SearchSuggestion {
    value: string
    type?: 'book' | 'author' | 'tag'
    id?: string
}

interface Props {
    modelValue?: string
    placeholder?: string
    size?: 'large' | 'default' | 'small'
    clearable?: boolean
    showHotTags?: boolean
    hotTags?: string[]
    fetchSuggestions?: (queryString: string, cb: (suggestions: SearchSuggestion[]) => void) => void
}

interface Emits {
    (e: 'update:modelValue', value: string): void
    (e: 'search', keyword: string): void
    (e: 'select', suggestion: SearchSuggestion): void
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '搜索书名、作者、标签...',
    size: 'default',
    clearable: true,
    showHotTags: false,
    hotTags: () => [],
    fetchSuggestions: undefined
})

const emit = defineEmits<Emits>()

const router = useRouter()
const autocompleteRef = ref()
const searchText = ref(props.modelValue)

// 获取建议列表
const fetchSuggestions = (queryString: string, cb: (suggestions: SearchSuggestion[]) => void) => {
    if (props.fetchSuggestions) {
        props.fetchSuggestions(queryString, cb)
        return
    }

    // 如果没有提供fetchSuggestions，使用本地搜索历史
    const history = getSearchHistory()
    const suggestions = history
        .filter(item => item.includes(queryString))
        .map(value => ({ value, type: undefined as any }))
    cb(suggestions)
}

// 获取搜索历史
const getSearchHistory = (): string[] => {
    try {
        const history = localStorage.getItem('search_history')
        return history ? JSON.parse(history) : []
    } catch {
        return []
    }
}

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
    if (!keyword.trim()) return

    try {
        let history = getSearchHistory()

        // 去重并添加到开头
        history = history.filter(item => item !== keyword)
        history.unshift(keyword)

        // 只保留最近10条
        history = history.slice(0, 10)

        localStorage.setItem('search_history', JSON.stringify(history))
    } catch (error) {
        console.error('保存搜索历史失败:', error)
    }
}

// 获取类型图标
const getItemIcon = (type?: string) => {
    switch (type) {
        case 'book':
            return Document
        case 'author':
            return User
        case 'tag':
            return Collection
        default:
            return Search
    }
}

// 获取类型标签
const getTypeLabel = (type?: string) => {
    switch (type) {
        case 'book':
            return '书籍'
        case 'author':
            return '作者'
        case 'tag':
            return '标签'
        default:
            return ''
    }
}

// 处理搜索
const handleSearch = () => {
    const keyword = searchText.value.trim()
    if (!keyword) return

    saveSearchHistory(keyword)
    emit('update:modelValue', keyword)
    emit('search', keyword)

    // 跳转到搜索页
    router.push({
        path: '/search',
        query: { q: keyword }
    })
}

// 选择建议
const handleSelect = (suggestion: SearchSuggestion) => {
    emit('select', suggestion)

    if (suggestion.type === 'book' && suggestion.id) {
        // 如果是书籍，直接跳转到详情页
        router.push(`/books/${suggestion.id}`)
    } else if (suggestion.type === 'author' && suggestion.id) {
        // 如果是作者，跳转到作者页
        router.push(`/author/${suggestion.id}`)
    } else {
        // 否则执行搜索
        handleSearch()
    }
}

// 点击热门标签
const handleHotTagClick = (tag: string) => {
    searchText.value = tag
    handleSearch()
}

// 监听外部值变化
watch(
    () => props.modelValue,
    (newVal) => {
        searchText.value = newVal
    }
)

// 暴露方法
defineExpose({
    focus: () => {
        autocompleteRef.value?.focus()
    },
    blur: () => {
        autocompleteRef.value?.blur()
    }
})
</script>

<style scoped lang="scss">
.search-bar {
    .search-input {
        width: 100%;

        :deep(.el-input-group__append) {
            padding: 0;

            .el-button {
                margin: 0;
                border-radius: 0 4px 4px 0;
            }
        }
    }

    .hot-tags {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;

        .hot-label {
            font-size: 14px;
            color: #909399;
            margin-right: 4px;
        }

        .hot-tag {
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                color: #409eff;
                border-color: #409eff;
            }
        }
    }
}

// 建议项样式
.suggestion-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;

    .item-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;

        .item-icon {
            flex-shrink: 0;
            font-size: 16px;
            color: #909399;
        }

        .item-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .item-tag {
        flex-shrink: 0;
        margin-left: 12px;
    }
}
</style>
