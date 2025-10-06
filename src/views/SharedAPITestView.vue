<template>
  <div class="shared-api-test">
    <h1>Shared API 测试页面</h1>

    <!-- 认证测试 -->
    <el-card class="test-section">
      <template #header>
        <h2>认证服务测试</h2>
      </template>

      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 注册 -->
        <div class="test-item">
          <h3>用户注册</h3>
          <el-form :model="registerForm" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="registerForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testRegister" :loading="loading.register">
                测试注册
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 登录 -->
        <div class="test-item">
          <h3>用户登录</h3>
          <el-form :model="loginForm" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testLogin" :loading="loading.login">
                测试登录
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 权限和角色 -->
        <div class="test-item">
          <h3>权限与角色查询</h3>
          <el-space>
            <el-button @click="testGetPermissions" :loading="loading.permissions">
              获取用户权限
            </el-button>
            <el-button @click="testGetRoles" :loading="loading.roles">
              获取用户角色
            </el-button>
            <el-button @click="testRefreshToken" :loading="loading.refreshToken">
              刷新Token
            </el-button>
            <el-button @click="testLogout" :loading="loading.logout">
              登出
            </el-button>
          </el-space>
        </div>
      </el-space>
    </el-card>

    <!-- 钱包测试 -->
    <el-card class="test-section">
      <template #header>
        <h2>钱包服务测试</h2>
      </template>

      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 查询余额和钱包信息 -->
        <div class="test-item">
          <h3>钱包信息查询</h3>
          <el-space>
            <el-button type="primary" @click="testGetBalance" :loading="loading.balance">
              查询余额
            </el-button>
            <el-button type="primary" @click="testGetWallet" :loading="loading.wallet">
              查询钱包信息
            </el-button>
          </el-space>
          <div v-if="walletInfo" class="result-display">
            <p><strong>余额:</strong> {{ walletInfo.balance || 0 }} 元</p>
          </div>
        </div>

        <!-- 充值 -->
        <div class="test-item">
          <h3>充值</h3>
          <el-form :model="rechargeForm" label-width="100px">
            <el-form-item label="金额">
              <el-input-number v-model="rechargeForm.amount" :min="0.01" :step="10" />
            </el-form-item>
            <el-form-item label="支付方式">
              <el-select v-model="rechargeForm.method">
                <el-option label="支付宝" value="alipay" />
                <el-option label="微信" value="wechat" />
                <el-option label="银行卡" value="bank" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testRecharge" :loading="loading.recharge">
                测试充值
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 消费 -->
        <div class="test-item">
          <h3>消费</h3>
          <el-form :model="consumeForm" label-width="100px">
            <el-form-item label="金额">
              <el-input-number v-model="consumeForm.amount" :min="0.01" :step="1" />
            </el-form-item>
            <el-form-item label="原因">
              <el-input v-model="consumeForm.reason" placeholder="请输入消费原因" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testConsume" :loading="loading.consume">
                测试消费
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 转账 -->
        <div class="test-item">
          <h3>转账</h3>
          <el-form :model="transferForm" label-width="100px">
            <el-form-item label="收款用户ID">
              <el-input v-model="transferForm.to_user_id" placeholder="请输入用户ID" />
            </el-form-item>
            <el-form-item label="金额">
              <el-input-number v-model="transferForm.amount" :min="0.01" :step="1" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="transferForm.reason" placeholder="请输入转账备注" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testTransfer" :loading="loading.transfer">
                测试转账
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 交易记录 -->
        <div class="test-item">
          <h3>交易记录</h3>
          <el-button type="primary" @click="testGetTransactions" :loading="loading.transactions">
            查询交易记录
          </el-button>
        </div>
      </el-space>
    </el-card>

    <!-- 存储测试 -->
    <el-card class="test-section">
      <template #header>
        <h2>存储服务测试</h2>
      </template>

      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 上传文件 -->
        <div class="test-item">
          <h3>文件上传</h3>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-button>选择文件</el-button>
          </el-upload>
          <el-button
            type="primary"
            @click="testUploadFile"
            :loading="loading.upload"
            :disabled="!selectedFile"
            style="margin-top: 10px"
          >
            测试上传
          </el-button>
        </div>

        <!-- 文件列表 -->
        <div class="test-item">
          <h3>文件列表</h3>
          <el-button type="primary" @click="testListFiles" :loading="loading.listFiles">
            查询文件列表
          </el-button>

          <el-table
            v-if="fileList.length > 0"
            :data="fileList"
            style="margin-top: 10px"
          >
            <el-table-column prop="id" label="文件ID" width="200" />
            <el-table-column prop="filename" label="文件名" />
            <el-table-column prop="size" label="大小(字节)" width="120" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button size="small" @click="testGetFileInfo(row.id)">
                  查看信息
                </el-button>
                <el-button size="small" type="danger" @click="testDeleteFile(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-space>
    </el-card>

    <!-- 管理测试 (需要管理员权限) -->
    <el-card class="test-section">
      <template #header>
        <h2>管理服务测试（需要管理员权限）</h2>
      </template>

      <el-space direction="vertical" :size="20" style="width: 100%">
        <!-- 待审核内容 -->
        <div class="test-item">
          <h3>待审核内容</h3>
          <el-button type="primary" @click="testGetPendingReviews" :loading="loading.pendingReviews">
            获取待审核列表
          </el-button>
        </div>

        <!-- 操作日志 -->
        <div class="test-item">
          <h3>操作日志</h3>
          <el-button type="primary" @click="testGetOperationLogs" :loading="loading.operationLogs">
            获取操作日志
          </el-button>
        </div>
      </el-space>
    </el-card>

    <!-- 测试结果显示 -->
    <el-card class="test-section" v-if="testResults.length > 0">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2>测试结果</h2>
          <el-button size="small" @click="clearResults">清空结果</el-button>
        </div>
      </template>

      <div class="test-results">
        <div
          v-for="(result, index) in testResults"
          :key="index"
          class="result-item"
          :class="result.success ? 'success' : 'error'"
        >
          <div class="result-header">
            <strong>{{ result.api }}</strong>
            <el-tag :type="result.success ? 'success' : 'danger'" size="small">
              {{ result.success ? '成功' : '失败' }}
            </el-tag>
            <span class="result-time">{{ result.time }}</span>
          </div>
          <pre class="result-data">{{ JSON.stringify(result.data, null, 2) }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import sharedAPI from '@/api/shared'

// 加载状态
const loading = reactive({
  register: false,
  login: false,
  logout: false,
  permissions: false,
  roles: false,
  refreshToken: false,
  balance: false,
  wallet: false,
  recharge: false,
  consume: false,
  transfer: false,
  transactions: false,
  upload: false,
  listFiles: false,
  pendingReviews: false,
  operationLogs: false
})

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})

const loginForm = reactive({
  username: '',
  password: ''
})

const rechargeForm = reactive({
  amount: 100,
  method: 'alipay'
})

const consumeForm = reactive({
  amount: 10,
  reason: '测试消费'
})

const transferForm = reactive({
  to_user_id: '',
  amount: 10,
  reason: '测试转账'
})

// 数据存储
const walletInfo = ref(null)
const selectedFile = ref(null)
const fileList = ref([])
const testResults = ref([])

// 文件处理
const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

// 添加测试结果
const addTestResult = (api, success, data) => {
  testResults.value.unshift({
    api,
    success,
    data,
    time: new Date().toLocaleTimeString()
  })
}

// 清空结果
const clearResults = () => {
  testResults.value = []
}

// ============ 认证服务测试 ============
const testRegister = async () => {
  loading.register = true
  try {
    const result = await sharedAPI.auth.register(registerForm)
    addTestResult('注册', true, result)
    ElMessage.success('注册成功')
  } catch (error) {
    addTestResult('注册', false, { error: error.message })
  } finally {
    loading.register = false
  }
}

const testLogin = async () => {
  loading.login = true
  try {
    const result = await sharedAPI.auth.login(loginForm)
    addTestResult('登录', true, result)
    ElMessage.success('登录成功')
  } catch (error) {
    addTestResult('登录', false, { error: error.message })
  } finally {
    loading.login = false
  }
}

const testLogout = async () => {
  loading.logout = true
  try {
    const result = await sharedAPI.auth.logout()
    addTestResult('登出', true, result)
    ElMessage.success('登出成功')
  } catch (error) {
    addTestResult('登出', false, { error: error.message })
  } finally {
    loading.logout = false
  }
}

const testGetPermissions = async () => {
  loading.permissions = true
  try {
    const result = await sharedAPI.auth.getUserPermissions()
    addTestResult('获取权限', true, result)
    ElMessage.success('获取权限成功')
  } catch (error) {
    addTestResult('获取权限', false, { error: error.message })
  } finally {
    loading.permissions = false
  }
}

const testGetRoles = async () => {
  loading.roles = true
  try {
    const result = await sharedAPI.auth.getUserRoles()
    addTestResult('获取角色', true, result)
    ElMessage.success('获取角色成功')
  } catch (error) {
    addTestResult('获取角色', false, { error: error.message })
  } finally {
    loading.roles = false
  }
}

const testRefreshToken = async () => {
  loading.refreshToken = true
  try {
    const result = await sharedAPI.auth.refreshToken()
    addTestResult('刷新Token', true, result)
    ElMessage.success('刷新Token成功')
  } catch (error) {
    addTestResult('刷新Token', false, { error: error.message })
  } finally {
    loading.refreshToken = false
  }
}

// ============ 钱包服务测试 ============
const testGetBalance = async () => {
  loading.balance = true
  try {
    const result = await sharedAPI.wallet.getBalance()
    walletInfo.value = { balance: result }
    addTestResult('查询余额', true, result)
    ElMessage.success('查询余额成功')
  } catch (error) {
    addTestResult('查询余额', false, { error: error.message })
  } finally {
    loading.balance = false
  }
}

const testGetWallet = async () => {
  loading.wallet = true
  try {
    const result = await sharedAPI.wallet.getWallet()
    walletInfo.value = result
    addTestResult('查询钱包信息', true, result)
    ElMessage.success('查询钱包信息成功')
  } catch (error) {
    addTestResult('查询钱包信息', false, { error: error.message })
  } finally {
    loading.wallet = false
  }
}

const testRecharge = async () => {
  loading.recharge = true
  try {
    const result = await sharedAPI.wallet.recharge(rechargeForm)
    addTestResult('充值', true, result)
    ElMessage.success('充值成功')
    // 刷新余额
    await testGetBalance()
  } catch (error) {
    addTestResult('充值', false, { error: error.message })
  } finally {
    loading.recharge = false
  }
}

const testConsume = async () => {
  loading.consume = true
  try {
    const result = await sharedAPI.wallet.consume(consumeForm)
    addTestResult('消费', true, result)
    ElMessage.success('消费成功')
    // 刷新余额
    await testGetBalance()
  } catch (error) {
    addTestResult('消费', false, { error: error.message })
  } finally {
    loading.consume = false
  }
}

const testTransfer = async () => {
  loading.transfer = true
  try {
    const result = await sharedAPI.wallet.transfer(transferForm)
    addTestResult('转账', true, result)
    ElMessage.success('转账成功')
    // 刷新余额
    await testGetBalance()
  } catch (error) {
    addTestResult('转账', false, { error: error.message })
  } finally {
    loading.transfer = false
  }
}

const testGetTransactions = async () => {
  loading.transactions = true
  try {
    const result = await sharedAPI.wallet.getTransactions({
      page: 1,
      page_size: 10
    })
    addTestResult('查询交易记录', true, result)
    ElMessage.success('查询交易记录成功')
  } catch (error) {
    addTestResult('查询交易记录', false, { error: error.message })
  } finally {
    loading.transactions = false
  }
}

// ============ 存储服务测试 ============
const testUploadFile = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  loading.upload = true
  try {
    const result = await sharedAPI.storage.uploadFile(selectedFile.value)
    addTestResult('上传文件', true, result)
    ElMessage.success('上传文件成功')
    selectedFile.value = null
    // 刷新文件列表
    await testListFiles()
  } catch (error) {
    addTestResult('上传文件', false, { error: error.message })
  } finally {
    loading.upload = false
  }
}

const testListFiles = async () => {
  loading.listFiles = true
  try {
    const result = await sharedAPI.storage.listFiles({
      page: 1,
      page_size: 10
    })
    fileList.value = result || []
    addTestResult('查询文件列表', true, result)
    ElMessage.success('查询文件列表成功')
  } catch (error) {
    addTestResult('查询文件列表', false, { error: error.message })
  } finally {
    loading.listFiles = false
  }
}

const testGetFileInfo = async (fileId) => {
  try {
    const result = await sharedAPI.storage.getFileInfo(fileId)
    addTestResult('获取文件信息', true, result)
    ElMessage.success('获取文件信息成功')
  } catch (error) {
    addTestResult('获取文件信息', false, { error: error.message })
  }
}

const testDeleteFile = async (fileId) => {
  try {
    const result = await sharedAPI.storage.deleteFile(fileId)
    addTestResult('删除文件', true, result)
    ElMessage.success('删除文件成功')
    // 刷新文件列表
    await testListFiles()
  } catch (error) {
    addTestResult('删除文件', false, { error: error.message })
  }
}

// ============ 管理服务测试 ============
const testGetPendingReviews = async () => {
  loading.pendingReviews = true
  try {
    const result = await sharedAPI.admin.getPendingReviews()
    addTestResult('获取待审核列表', true, result)
    ElMessage.success('获取待审核列表成功')
  } catch (error) {
    addTestResult('获取待审核列表', false, { error: error.message })
  } finally {
    loading.pendingReviews = false
  }
}

const testGetOperationLogs = async () => {
  loading.operationLogs = true
  try {
    const result = await sharedAPI.admin.getOperationLogs({
      page: 1,
      page_size: 10
    })
    addTestResult('获取操作日志', true, result)
    ElMessage.success('获取操作日志成功')
  } catch (error) {
    addTestResult('获取操作日志', false, { error: error.message })
  } finally {
    loading.operationLogs = false
  }
}
</script>

<style scoped>
.shared-api-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.test-section {
  margin-bottom: 20px;
}

.test-section h2 {
  margin: 0;
  color: #409eff;
}

.test-item {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.test-item h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}

.result-display {
  margin-top: 15px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.test-results {
  max-height: 500px;
  overflow-y: auto;
}

.result-item {
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.result-item.success {
  background: #f0f9ff;
  border-color: #67c23a;
}

.result-item.error {
  background: #fef0f0;
  border-color: #f56c6c;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.result-time {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.result-data {
  margin: 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 300px;
}
</style>

