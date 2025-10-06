import request from '@/utils/request'

/**
 * 共享钱包服务API
 */

// 查询余额
export const getBalance = () => {
  return request({
    url: '/shared/wallet/balance',
    method: 'get'
  })
}

// 获取钱包信息
export const getWallet = () => {
  return request({
    url: '/shared/wallet',
    method: 'get'
  })
}

// 充值
export const recharge = (data) => {
  return request({
    url: '/shared/wallet/recharge',
    method: 'post',
    data
  })
}

// 消费
export const consume = (data) => {
  return request({
    url: '/shared/wallet/consume',
    method: 'post',
    data
  })
}

// 转账
export const transfer = (data) => {
  return request({
    url: '/shared/wallet/transfer',
    method: 'post',
    data
  })
}

// 查询交易记录
export const getTransactions = (params) => {
  return request({
    url: '/shared/wallet/transactions',
    method: 'get',
    params
  })
}

// 申请提现
export const requestWithdraw = (data) => {
  return request({
    url: '/shared/wallet/withdraw',
    method: 'post',
    data
  })
}

// 查询提现申请
export const getWithdrawRequests = (params) => {
  return request({
    url: '/shared/wallet/withdrawals',
    method: 'get',
    params
  })
}

