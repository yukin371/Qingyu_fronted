import request from '@/utils/request'

/**
 * 共享存储服务API
 */

// 上传文件
export const uploadFile = (file, path = '') => {
  const formData = new FormData()
  formData.append('file', file)
  if (path) {
    formData.append('path', path)
  }

  return request({
    url: '/shared/storage/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载文件
export const downloadFile = (fileId) => {
  return request({
    url: `/shared/storage/download/${fileId}`,
    method: 'get',
    responseType: 'blob'
  })
}

// 删除文件
export const deleteFile = (fileId) => {
  return request({
    url: `/shared/storage/files/${fileId}`,
    method: 'delete'
  })
}

// 获取文件信息
export const getFileInfo = (fileId) => {
  return request({
    url: `/shared/storage/files/${fileId}`,
    method: 'get'
  })
}

// 列出文件
export const listFiles = (params) => {
  return request({
    url: '/shared/storage/files',
    method: 'get',
    params
  })
}

// 获取文件访问URL
export const getFileURL = (fileId, expire = 3600) => {
  return request({
    url: `/shared/storage/files/${fileId}/url`,
    method: 'get',
    params: { expire }
  })
}

