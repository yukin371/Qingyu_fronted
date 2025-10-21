import { defineStore } from 'pinia'
import * as walletAPI from '@/api/shared/wallet'
import type {
  WalletBalance,
  WalletInfo,
  Transaction,
  WithdrawRecord,
  RechargeRequest,
  ConsumeRequest,
  TransferRequest,
  WithdrawRequest,
  TransactionQueryParams,
  WithdrawQueryParams
} from '@/api/shared/types'

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
  withdrawals: WithdrawRecord[]
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
        const data = await walletAPI.getBalance()
        this.balance = data.balance
        this.frozenAmount = data.frozenAmount
        this.availableAmount = data.availableAmount
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
        const data = await walletAPI.getWallet()
        this.walletInfo = data
        this.balance = data.balance
        this.frozenAmount = data.frozenAmount
        this.availableAmount = data.availableAmount
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
    async recharge(request: RechargeRequest): Promise<any> {
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
    async consume(request: ConsumeRequest): Promise<any> {
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
        const result = await walletAPI.transfer(request)
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
    async fetchTransactions(params?: TransactionQueryParams): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          page: params?.page || this.transactionsPage,
          page_size: params?.page_size || this.transactionsPageSize,
          type: params?.type
        }

        const response = await walletAPI.getTransactions(queryParams)

        // 处理响应数据
        if (Array.isArray(response)) {
          this.transactions = response
        } else if (response.data) {
          this.transactions = response.data
          this.transactionsTotal = response.total || 0
          this.transactionsPage = response.page || queryParams.page
          this.transactionsPageSize = response.page_size || queryParams.page_size
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
    async requestWithdraw(request: WithdrawRequest): Promise<any> {
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
    async fetchWithdrawals(params?: WithdrawQueryParams): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          page: params?.page || this.withdrawalsPage,
          page_size: params?.page_size || this.withdrawalsPageSize,
          status: params?.status
        }

        const response = await walletAPI.getWithdrawRequests(queryParams)

        // 处理响应数据
        if (Array.isArray(response)) {
          this.withdrawals = response
        } else if (response.data) {
          this.withdrawals = response.data
          this.withdrawalsTotal = response.total || 0
          this.withdrawalsPage = response.page || queryParams.page
          this.withdrawalsPageSize = response.page_size || queryParams.page_size
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

