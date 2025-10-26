/**
 * Wallet API
 */

import { httpService } from '@/core/services/http.service'
import type {
  WalletBalance,
  Transaction,
  RechargeParams,
  WithdrawParams
} from '../types/user.types'
import type { APIResponse } from '@/core/types/api.types'

export const walletAPI = {
  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<WalletBalance> {
    const response = await httpService.get<APIResponse<WalletBalance>>('/user/wallet/balance')
    return response.data
  },

  /**
   * Get transactions
   */
  async getTransactions(page: number = 1, size: number = 20): Promise<Transaction[]> {
    const response = await httpService.get<APIResponse<Transaction[]>>('/user/wallet/transactions', {
      params: { page, size }
    } as any)
    return response.data
  },

  /**
   * Recharge
   */
  async recharge(params: RechargeParams): Promise<void> {
    return httpService.post('/user/wallet/recharge', params)
  },

  /**
   * Withdraw
   */
  async withdraw(params: WithdrawParams): Promise<void> {
    return httpService.post('/user/wallet/withdraw', params)
  }
}

export default walletAPI

