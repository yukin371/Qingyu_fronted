/**
 * 站内消息 API
 */
import request from '../request'

// 消息类型
export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'system'

// 消息状态
export type MessageStatus = 'sending' | 'sent' | 'read' | 'failed'

// 会话
export interface Conversation {
  id: string
  participant_id: string
  participant_name: string
  participant_avatar: string
  last_message: string
  last_message_time: string
  last_message_type: MessageType
  unread_count: number
  updated_at: string
}

// 消息
export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  type: MessageType
  content: string
  file_url?: string
  file_name?: string
  file_size?: number
  status: MessageStatus
  is_read: boolean
  created_at: string
}

// 对话统计
export interface ConversationStats {
  total_conversations: number
  total_unread: number
}

/**
 * 获取对话列表
 */
export function getConversations(params?: {
  page?: number
  page_size?: number
}) {
  return request<{
    items: Conversation[]
    total: number
    page: number
    page_size: number
  }>({
    url: '/api/v1/social/messages/conversations',
    method: 'get',
    params
  })
}

/**
 * 获取对话消息
 */
export function getMessages(conversationId: string, params?: {
  page?: number
  page_size?: number
}) {
  return request<{
    items: Message[]
    total: number
    page: number
    page_size: number
  }>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'get',
    params
  })
}

/**
 * 发送文本消息
 */
export function sendTextMessage(conversationId: string, data: {
  content: string
}) {
  return request<Message>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'post',
    data: { ...data, type: 'text' }
  })
}

/**
 * 发送图片消息
 */
export function sendImageMessage(conversationId: string, data: {
  file_url: string
  file_name?: string
}) {
  return request<Message>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'post',
    data: { ...data, type: 'image' }
  })
}

/**
 * 发送文件消息
 */
export function sendFileMessage(conversationId: string, data: {
  file_url: string
  file_name: string
  file_size: number
}) {
  return request<Message>({
    url: `/api/v1/social/messages/conversations/${conversationId}/messages`,
    method: 'post',
    data: { ...data, type: 'file' }
  })
}

/**
 * 创建对话
 */
export function createConversation(userId: string) {
  return request<Conversation>({
    url: '/api/v1/social/messages/conversations',
    method: 'post',
    data: { participant_id: userId }
  })
}

/**
 * 标记消息为已读
 */
export function markConversationAsRead(conversationId: string) {
  return request<{ success: boolean; read_count: number }>({
    url: `/api/v1/social/messages/conversations/${conversationId}/read`,
    method: 'post'
  })
}

/**
 * 删除对话
 */
export function deleteConversation(conversationId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/messages/conversations/${conversationId}`,
    method: 'delete'
  })
}

/**
 * 删除消息
 */
export function deleteMessage(messageId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/messages/${messageId}`,
    method: 'delete'
  })
}

/**
 * 撤回消息
 */
export function recallMessage(messageId: string) {
  return request<{ success: boolean }>({
    url: `/api/v1/social/messages/${messageId}/recall`,
    method: 'post'
  })
}

/**
 * 获取对话统计
 */
export function getConversationStats() {
  return request<ConversationStats>({
    url: '/api/v1/social/messages/stats',
    method: 'get'
  })
}

/**
 * 搜索对话
 */
export function searchConversations(keyword: string) {
  return request<Conversation[]>({
    url: '/api/v1/social/messages/conversations/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 上传消息文件
 */
export function uploadMessageFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request<{ file_url: string; file_name: string; file_size: number }>({
    url: '/api/v1/social/messages/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
