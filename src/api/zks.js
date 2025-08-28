import request from '@/utils/request'
export default {
  // 上传图片 - 修复为正确的 FormData 格式
  upload(file) {
    // 直接接收 file 对象，更清晰
    const formData = new FormData()
    // 注意：后端可能期望的字段名是 'image' 或 'file'，需要和后端保持一致
    formData.append('image', file)
    return request.post('/zks/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 必须设置此类型
      },
    })
  },
  /**
   * 添加用户信息
   */
  addUserInfo(data) {
    return request.post('/zks/addUsers', data)
  },
}
