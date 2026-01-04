import { defineStore } from 'pinia'
import { walletAPI } from '@/api/shared/wallet'
import type {
  WalletInfo,
  Transaction,
  WithdrawRequest,
  RechargeParams,
  ConsumeParams,
  TransferRequest
} from '@/types/shared'

/**
 * 钱包状态接口
 */
export interface WalletState {
  // 钱包信息
  balance: number
  frozenAmount: number
  availableAmount: number
  walletInfo: WalletInfo | null

  // 交易记录
  transactions: Transaction[]
  transactionsTotal: number
  transactionsPage: number
  transactionsPageSize: number

  // 提现记录
  withdrawals: WithdrawRequest[]
  withdrawalsTotal: number
  withdrawalsPage: number
  withdrawalsPageSize: number

  // 加载状态
  loading: boolean
  error: string | null
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    // 钱包信息
    balance: 0,
    frozenAmount: 0,
    availableAmount: 0,
    walletInfo: null,

    // 交易记录
    transactions: [],
    transactionsTotal: 0,
    transactionsPage: 1,
    transactionsPageSize: 20,

    // 提现记录
    withdrawals: [],
    withdrawalsTotal: 0,
    withdrawalsPage: 1,
    withdrawalsPageSize: 20,

    // 加载状态
    loading: false,
    error: null
  }),

  getters: {
    /**
     * 格式化余额显示
     */
    formattedBalance: (state): string => {
      return `¥${state.balance.toFixed(2)}`
    },

    /**
     * 格式化可用余额
     */
    formattedAvailableAmount: (state): string => {
      return `¥${state.availableAmount.toFixed(2)}`
    },

    /**
     * 格式化冻结金额
     */
    formattedFrozenAmount: (state): string => {
      return `¥${state.frozenAmount.toFixed(2)}`
    },

    /**
     * 是否有足够余额
     */
    hasEnoughBalance: (state) => (amount: number): boolean => {
      return state.availableAmount >= amount
    },

    /**
     * 待审核提现数量
     */
    pendingWithdrawalsCount: (state): number => {
      return state.withdrawals.filter((w) => w.status === 'pending').length
    }
  },

  actions: {
    /**
     * 获取钱包余额
     */
    async fetchBalance(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const response = await walletAPI.getBalance()
        if (response.data) {
          this.balance = response.data.balance || 0
          // 如果API没有返回冻结金额，默认为0
          this.frozenAmount = (response.data as any).frozenAmount || (response.data as any).frozenBalance || 0
          this.availableAmount = (response.data as any).availableAmount || (this.balance - this.frozenAmount)
        }
      } catch (error: any) {
        this.error = error.message || '获取余额失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取完整钱包信息
     */
    async fetchWalletInfo(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const response = await walletAPI.getWallet()
        if (response.data) {
          this.walletInfo = response.data
          this.balance = response.data.balance || 0
          this.frozenAmount = response.data.frozenAmount || response.data.frozenBalance || 0
          this.availableAmount = response.data.availableAmount || 0
        }
      } catch (error: any) {
        this.error = error.message || '获取钱包信息失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 充值
     */
    async recharge(request: RechargeParams): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const result = await walletAPI.recharge(request)
        // 刷新余额
        await this.fetchBalance()
        return result
      } catch (error: any) {
        this.error = error.message || '充值失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 消费
     */
    async consume(request: ConsumeParams): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const result = await walletAPI.consume(request)
        // 刷新余额
        await this.fetchBalance()
        return result
      } catch (error: any) {
        this.error = error.message || '消费失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 转账
     */
    async transfer(request: TransferRequest): Promise<any> {
      this.loading = true
      this.error = null

      try {
        // 转换参数格式
        const params = {
          toUserId: request.targetUserId,
          amount: request.amount,
          reason: request.reason
        }
        const result = await walletAPI.transfer(params)
        // 刷新余额
        await this.fetchBalance()
        return result
      } catch (error: any) {
        this.error = error.message || '转账失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取交易记录
     */
    async fetchTransactions(params?: {page?: number; page_size?: number; type?: string}): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          page: params?.page || this.transactionsPage,
          page_size: params?.page_size || this.transactionsPageSize,
          type: params?.type
        }

        const response = await walletAPI.getTransactions(queryParams)

        // 处理分页响应数据
        if (response.data) {
          this.transactions = response.data
        }
        if (response.pagination) {
          this.transactionsTotal = response.pagination.total || 0
          this.transactionsPage = response.pagination.page || queryParams.page
          this.transactionsPageSize = response.pagination.page_size || queryParams.page_size
        }
      } catch (error: any) {
        this.error = error.message || '获取交易记录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 申请提现
     */
    async requestWithdraw(request: {amount: number; account: string; accountType: string; verifyCode?: string}): Promise<any> {
      this.loading = true
      this.error = null

      try {
        const result = await walletAPI.requestWithdraw(request)
        // 刷新余额和提现记录
        await this.fetchBalance()
        await this.fetchWithdrawals()
        return result
      } catch (error: any) {
        this.error = error.message || '申请提现失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取提现记录
     */
    async fetchWithdrawals(params?: {page?: number; page_size?: number; status?: string}): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          page: params?.page || this.withdrawalsPage,
          page_size: params?.page_size || this.withdrawalsPageSize,
          status: params?.status
        }

        const response = await walletAPI.getWithdrawRequests(queryParams)

        // 处理分页响应数据
        if (response.data) {
          this.withdrawals = response.data
        }
        if (response.pagination) {
          this.withdrawalsTotal = response.pagination.total || 0
          this.withdrawalsPage = response.pagination.page || queryParams.page
          this.withdrawalsPageSize = response.pagination.page_size || queryParams.page_size
        }
      } catch (error: any) {
        this.error = error.message || '获取提现记录失败'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 清除错误
     */
    clearError(): void {
      this.error = null
    },

    /**
     * 重置状态
     */
    reset(): void {
      this.balance = 0
      this.frozenAmount = 0
      this.availableAmount = 0
      this.walletInfo = null
      this.transactions = []
      this.transactionsTotal = 0
      this.withdrawals = []
      this.withdrawalsTotal = 0
      this.error = null
    }
  }
})

