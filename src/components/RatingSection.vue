<template>
  <div class="rating-section">
    <!-- 总体评分 -->
    <div class="rating-overview">
      <div class="rating-display">
        <div class="rating-score">
          <span class="score-value">{{ averageRating }}</span>
          <span class="score-unit">/5</span>
        </div>
        <div class="rating-stars">
          <el-rate
            v-model="averageRating"
            disabled
            :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
            :allow-half="true"
          />
        </div>
        <div class="rating-count">基于 {{ totalRatings }} 个评分</div>
      </div>
    </div>

    <!-- 评分分布 -->
    <div class="rating-distribution">
      <div class="distribution-item" v-for="star in 5" :key="star">
        <span class="star-label">{{ 6 - star }} 星</span>
        <el-progress
          :percentage="getRatingPercentage(6 - star)"
          :show-text="false"
          :stroke-width="8"
        />
        <span class="star-count">{{ getRatingCount(6 - star) }}</span>
      </div>
    </div>

    <!-- 用户评分（仅登录用户可评分） -->
    <div v-if="!userRating && isLoggedIn" class="user-rating">
      <div class="rating-prompt">
        <p>还没有评分？分享你的看法</p>
        <el-rate
          v-model="userRatingValue"
          :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
          size="large"
        />
      </div>
      <el-button
        type="primary"
        @click="submitRating"
        :loading="submittingRating"
        :disabled="userRatingValue === 0"
      >
        提交评分
      </el-button>
    </div>

    <!-- 已评分显示 -->
    <div v-else-if="userRating" class="your-rating">
      <p>你的评分：</p>
      <el-rate
        v-model="userRating"
        disabled
        :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
      />
      <el-button text @click="changeRating">修改评分</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  bookId: string
}

const props = defineProps<Props>()

// 状态
const averageRating = ref(4.5)
const totalRatings = ref(1240)
const userRating = ref<number | null>(null)
const userRatingValue = ref(0)
const submittingRating = ref(false)
const isLoggedIn = ref(true) // TODO: 从 auth store 获取

// 评分分布数据（示例）
const ratingDistribution = ref({
  5: 520,
  4: 380,
  3: 240,
  2: 80,
  1: 20
})

// 方法
const getRatingCount = (star: number): number => {
  return ratingDistribution.value[star as keyof typeof ratingDistribution.value] || 0
}

const getRatingPercentage = (star: number): number => {
  const count = getRatingCount(star)
  return Math.round((count / totalRatings.value) * 100)
}

const submitRating = async () => {
  submittingRating.value = true
  try {
    // TODO: 调用 API 提交评分
    // await submitBookRating(props.bookId, userRatingValue.value)
    userRating.value = userRatingValue.value
    userRatingValue.value = 0
    ElMessage.success('评分成功')
  } catch (error) {
    ElMessage.error('评分失败，请重试')
  } finally {
    submittingRating.value = false
  }
}

const changeRating = () => {
  userRatingValue.value = userRating.value || 0
  userRating.value = null
}

// 生命周期
onMounted(async () => {
  // TODO: 加载评分数据
  // const ratings = await getBookRatings(props.bookId)
  // userRating.value = ratings.userRating
})
</script>

<style scoped lang="scss">
.rating-section {
  padding: 20px;

  .rating-overview {
    text-align: center;
    margin-bottom: 40px;

    .rating-display {
      .rating-score {
        font-size: 48px;
        font-weight: bold;
        color: #f7ba2a;
        margin-bottom: 12px;

        .score-unit {
          font-size: 24px;
          color: #999;
        }
      }

      .rating-stars {
        margin-bottom: 12px;
      }

      .rating-count {
        color: #999;
        font-size: 14px;
      }
    }
  }

  .rating-distribution {
    margin-bottom: 40px;

    .distribution-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .star-label {
        min-width: 40px;
        text-align: right;
      }

      :deep(.el-progress) {
        flex: 1;
      }

      .star-count {
        min-width: 40px;
        text-align: right;
        color: #999;
      }
    }
  }

  .user-rating,
  .your-rating {
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;

    p {
      margin-bottom: 12px;
      font-weight: 500;
    }

    .el-rate {
      margin-bottom: 16px;
    }
  }

  .your-rating {
    display: flex;
    align-items: center;
    gap: 16px;

    p {
      margin: 0;
    }

    .el-button {
      margin-left: auto;
    }
  }
}
</style>
