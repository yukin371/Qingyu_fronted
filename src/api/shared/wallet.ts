/**
 * 钱包服务API模块 (v1.3)
 * 基于 doc/api/frontend/共享服务API参考.md
 */

import request from '@/utils/request'
import type { APIResponse, PaginatedResponse } from '@/types/api'
import type {
  WalletInfo,
  Transaction,
  RechargeParams,
  ConsumeParams,
  TransferParams,
  WithdrawRequest,
  WithdrawParams
} from '@/types/shared'

/**
 * 钱包API接口 (v1.3)
 */
export const walletAPI = {
  /**
   * 查询余额
   */
  async getBalance(): Promise<APIResponse<{ balance: number }>> {
    return request.get<APIResponse<{ balance: number }>>('/shared/wallet/balance')
  },

  /**
   * 获取钱包信息
   */
  async getWallet(): Promise<APIResponse<WalletInfo>> {
    return request.get<APIResponse<WalletInfo>>('/shared/wallet')
  },

  /**
   * 充值
   */
  async recharge(params: RechargeParams): Promise<APIResponse<Transaction>> {
    return request.post<APIResponse<Transaction>>('/shared/wallet/recharge', params)
  },

  /**
   * 消费
   */
  async consume(params: ConsumeParams): Promise<APIResponse<Transaction>> {
    return request.post<APIResponse<Transaction>>('/shared/wallet/consume', params)
  },

  /**
   * 转账
   */
  async transfer(params: TransferParams): Promise<APIResponse<Transaction>> {
    return request.post<APIResponse<Transaction>>('/shared/wallet/transfer', params)
  },

  /**
   * 查询交易记录
   */
  async getTransactions(params?: {
    page?: number
    page_size?: number
    type?: string
  }): Promise<PaginatedResponse<Transaction>> {
    return request.get<PaginatedResponse<Transaction>>('/shared/wallet/transactions', {
      params
    })
  },

  /**
   * 申请提现
   */
  async requestWithdraw(params: WithdrawParams): Promise<APIResponse<WithdrawRequest>> {
    return request.post<APIResponse<WithdrawRequest>>('/shared/wallet/withdraw', params)
  },

  /**
   * 查询提现申请
   */
  async getWithdrawRequests(params?: {
    page?: number
    page_size?: number
    status?: string
  }): Promise<PaginatedResponse<WithdrawRequest>> {
    return request.get<PaginatedResponse<WithdrawRequest>>('/shared/wallet/withdrawals', {
      params
    })
  }
}

// 向后兼容：导出旧的函数名
export const getBalance = () => walletAPI.getBalance()
export const getWallet = () => walletAPI.getWallet()
export const recharge = (data: RechargeParams) => walletAPI.recharge(data)
export const consume = (data: ConsumeParams) => walletAPI.consume(data)
export const transfer = (data: TransferParams) => walletAPI.transfer(data)
export const getTransactions = (params: any) => walletAPI.getTransactions(params)
export const requestWithdraw = (data: WithdrawParams) => walletAPI.requestWithdraw(data)
export const getWithdrawRequests = (params: any) => walletAPI.getWithdrawRequests(params)

export default walletAPI

