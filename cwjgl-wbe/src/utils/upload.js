import request from '@/utils/request'

/**
 * 通用文件上传函数
 * @param {string} url - 上传接口地址（如 '/zks/upload'）
 * @param {File} file - 要上传的文件对象
 * @param {string} fieldName - 后端接收文件的字段名（如 'image'）
 * @param {Object} [data={}] - 额外需要传递的参数（非文件字段）
 * @returns {Promise} - 上传结果的Promise
 */
export function uploadFile(url, file, fieldName, data = {}) {
  const formData = new FormData()
  // 追加文件字段
  formData.append(fieldName, file)
  // 追加额外参数
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  // 发送请求
  return request.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 可选：添加上传进度回调
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      console.log(`上传进度: ${percentCompleted}%`)
    },
  })
}
