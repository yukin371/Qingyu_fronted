<template>
    <el-card class="project-card" :body-style="{ padding: '20px' }" @click="$emit('click')">
        <div class="project-header">
            <h3 class="project-title">{{ project.title }}</h3>
            <el-tag :type="getStatusType(project.status)">{{ getStatusText(project.status) }}</el-tag>
        </div>

        <p class="project-description" v-if="project.description">
            {{ truncate(project.description, 100) }}
        </p>

        <div class="project-stats">
            <div class="stat-item">
                <el-icon>
                    <Document />
                </el-icon>
                <span>{{ formatNumber(project.wordCount || 0) }} 字</span>
            </div>
            <div class="stat-item">
                <el-icon>
                    <Folder />
                </el-icon>
                <span>{{ project.chapterCount || 0 }} 章</span>
            </div>
            <div class="stat-item">
                <el-icon>
                    <Clock />
                </el-icon>
                <span>{{ formatDate(project.updatedAt) }}</span>
            </div>
        </div>

        <div class="project-actions">
            <el-button text @click.stop="$emit('edit', project)">
                <el-icon>
                    <Edit />
                </el-icon>
                编辑
            </el-button>
            <el-button text @click.stop="$emit('statistics', project)">
                <el-icon>
                    <DataLine />
                </el-icon>
                统计
            </el-button>
            <el-button text type="danger" @click.stop="$emit('delete', project.projectId)">
                <el-icon>
                    <Delete />
                </el-icon>
                删除
            </el-button>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { Document, Folder, Clock, Edit, DataLine, Delete } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'

interface Project {
    projectId: string
    title: string
    description?: string
    status: string
    wordCount?: number
    chapterCount?: number
    updatedAt: string
}

interface Props {
    project: Project
}

defineProps<Props>()

const emit = defineEmits<{
    click: []
    edit: [project: Project]
    statistics: [project: Project]
    delete: [projectId: string]
}>()

function getStatusType(status: string): string {
    const typeMap: Record<string, string> = {
        draft: 'info',
        writing: 'warning',
        completed: 'success',
        published: 'success'
    }
    return typeMap[status] || 'info'
}

function getStatusText(status: string): string {
    const textMap: Record<string, string> = {
        draft: '草稿',
        writing: '写作中',
        completed: '已完成',
        published: '已发布'
    }
    return textMap[status] || status
}

function truncate(text: string, length: number): string {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
}

function formatNumber(num: number): string {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万'
    }
    return num.toString()
}
</script>

<style scoped lang="scss">
.project-card {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    .project-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .project-title {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: #303133;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .project-description {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        margin: 0 0 16px;
    }

    .project-stats {
        display: flex;
        gap: 20px;
        margin-bottom: 16px;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;

        .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #909399;

            .el-icon {
                font-size: 16px;
            }
        }
    }

    .project-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
    }
}
</style>
